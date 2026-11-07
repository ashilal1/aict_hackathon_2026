# /// script
# requires-python = ">=3.10"
# dependencies = ["opencv-python-headless==4.10.0.84", "numpy<2.3", "pillow"]
# ///
"""判定シーンで、こづゆばあちゃんが横と縦に 1 周ずつ回る動画を作る。

ばあちゃんの画像は 3D モデルを 10° 刻みで撮ったものしかない。そのまま切り替えると
1 コマで 10° ずつ跳んでカクカクするので、間の絵をオプティカルフローで補って 60fps の動画にする。

使い方（リポジトリ直下で。ffmpeg と uv が要る）:
    uv run tools/granny-spin/render.py

高画質の元画像 images/kozuyu-onbachan/sphere/full/ は、正面の高さの 36 枚しか git に入っていない。
全部の元画像を持っている人の手元でだけ作り直せる。

画面では背景を透かせるように mix-blend-mode: multiply で生成りの背景に重ねる。
そのため動画の背景は白にし、ばあちゃんの色は生成りの色で割っておく（重ねると元の色に戻る）。
"""

import math
import subprocess
import tempfile
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

REPO = Path(__file__).resolve().parents[2]
GRANNY = REPO / 'images/kozuyu-onbachan'
OUTPUT = GRANNY / 'spin.mp4'

SIZE = 720
FPS = 60
SPIN_MS = 3000
# 生成り（app/src/index.css の --color-kinari）
KINARI = np.array([0xF5, 0xEF, 0xE3], dtype=np.float32) / 255

# ---- 回る通り道 ----
# 撮影データ: 横 10° 刻み × 縦 -80〜+80° 10° 刻み、真上/真下（±89°）は 0/90/180/270° の 4 枚
POLE_AZ = [0, 90, 180, 270]
POLE_SPIN = -1  # 真上で方位が増えると画像は反時計回りに回る（撮影結果から確認済み）
STEPS = 72
STEP_DEG = 10
# 正面の画像にいちばん近い撮影データは方位 350°。ここから回り始めて、ここで止まる
START_YAW = -10


def frame_for(yaw, pitch):
    """yaw: 横の角度, pitch: 縦の角度。±90° を超えると頭の上/足の下を越えて裏側へ回り込む"""
    p = (pitch + 180) % 360 - 180
    az = yaw
    rot = 0
    if abs(p) > 90:
        p = math.copysign(180, p) - p
        az += 180
        rot = 180
    az %= 360
    if abs(p) > 85:
        top = p > 0
        best = min(POLE_AZ, key=lambda a: abs((az - a + 180) % 360 - 180))
        delta = (az - best + 180) % 360 - 180
        rot += (1 if top else -1) * POLE_SPIN * delta
        return f"e{'+' if top else '-'}89_a{best:03d}.webp", rot
    el = max(-80, min(80, round(p / 10) * 10))
    a = round(az / 10) * 10 % 360
    return f"e{'-' if el < 0 else '+'}{abs(el):02d}_a{a:03d}.webp", rot


# 横と縦を 1 段ずつ交互に進める。最初と最後（None）は正面の画像
KEYFRAMES = [
    None
    if i in (0, STEPS)
    else frame_for(START_YAW + math.ceil(i / 2) * STEP_DEG, (i // 2) * STEP_DEG)
    for i in range(STEPS + 1)
]

# ---- 速さの変化 ----
# 回り始めと止まる前の割合。あいだは等速で回す
RAMP = 0.12
# 横の 1 段は縦の 1 段より絵の変化が小さいので（実測で 4.7 対 6.7）、時間も短くして見た目の速さをそろえる
YAW_SHARE = 0.41


def ease(t):
    if t > 0.5:
        return 1 - ease(1 - t)
    cruise = 1 / (1 - RAMP)
    if t >= RAMP:
        return cruise * (t - RAMP / 2)
    return cruise * (t - (RAMP / math.pi) * math.sin(math.pi * t / RAMP)) / 2


def step_position(progress):
    pairs = progress * STEPS / 2
    pair = math.floor(pairs)
    rest = pairs - pair
    if rest < YAW_SHARE:
        return pair * 2 + rest / YAW_SHARE
    return pair * 2 + 1 + (rest - YAW_SHARE) / (1 - YAW_SHARE)


# ---- 間の絵を作る ----


def load(view):
    """アルファを掛けた色（premultiplied）の配列。輪郭を補間してもにじまない"""
    if view is None:
        image = Image.open(GRANNY / 'front.webp')
    else:
        image = Image.open(GRANNY / 'sphere/full' / view[0])
        if view[1]:
            image = image.rotate(-view[1], resample=Image.BICUBIC)  # 画面と同じ時計回り
    pixels = np.asarray(image.convert('RGBA').resize((SIZE, SIZE), Image.LANCZOS)).astype(np.float32) / 255
    pixels[..., :3] *= pixels[..., 3:4]
    return pixels


def gray(pixels):
    # 背景は中間の灰色にして、輪郭も模様もフローの手がかりにする
    g = pixels[..., :3].mean(axis=2) + 0.5 * (1 - pixels[..., 3])
    return (g * 255).clip(0, 255).astype(np.uint8)


FLOW = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_ULTRAFAST)
FLOW.setFinestScale(0)
FLOW.setPatchSize(12)
FLOW.setPatchStride(4)
FLOW.setGradientDescentIterations(25)
FLOW.setVariationalRefinementIterations(5)
GRID_X, GRID_Y = np.meshgrid(np.arange(SIZE, dtype=np.float32), np.arange(SIZE, dtype=np.float32))


def warp(pixels, flow, t):
    return cv2.remap(pixels, GRID_X - t * flow[..., 0], GRID_Y - t * flow[..., 1], cv2.INTER_LINEAR, borderValue=0)


class Pair:
    def __init__(self, a, b):
        self.a, self.b = load(a), load(b)
        ga, gb = gray(self.a), gray(self.b)
        self.ab = FLOW.calc(ga, gb, None)
        self.ba = FLOW.calc(gb, ga, None)

    def at(self, t):
        """前の絵を前へ、後の絵を後ろへ t だけ動かして混ぜる"""
        return (1 - t) * warp(self.a, self.ab, t) + t * warp(self.b, self.ba, 1 - t)


def for_multiply(pixels):
    rgb = pixels[..., :3] / KINARI + (1 - pixels[..., 3:4])
    return Image.fromarray((rgb.clip(0, 1) * 255 + 0.5).astype(np.uint8), 'RGB')


def main():
    frames = round(SPIN_MS * FPS / 1000)
    with tempfile.TemporaryDirectory() as tmp:
        pair_index, pair = -1, None
        for f in range(frames + 1):
            position = min(step_position(ease(f / frames)), STEPS)
            i = min(int(position), STEPS - 1)
            if i != pair_index:
                pair_index, pair = i, Pair(KEYFRAMES[i], KEYFRAMES[i + 1])
            for_multiply(pair.at(position - i)).save(Path(tmp) / f'{f:04d}.png')
        subprocess.run(
            [
                'ffmpeg', '-y', '-loglevel', 'error',
                '-framerate', str(FPS), '-i', str(Path(tmp) / '%04d.png'),
                '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-tune', 'animation',
                '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
                '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
                str(OUTPUT),
            ],
            check=True,
        )  # fmt: skip
    print(f'{frames + 1} frames -> {OUTPUT.relative_to(REPO)}')


if __name__ == '__main__':
    main()
