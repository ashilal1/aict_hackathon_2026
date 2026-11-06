// ばあちゃんの画像。ビルド時に Vite が取り込む
// 止まっているとき（顔アイコンと、判定の最後）は、まっすぐ正面を向いた 1 枚を使う
import front from '../../../images/kozuyu-onbachan/front.webp'

// 回っている最中は 360° 画像（images/kozuyu-onbachan/sphere/）を使う
// 撮影データ: 横 10° 刻み × 縦 -80〜+80° 10° 刻み、真上/真下（±89°）は 0/90/180/270° の 4 枚

// 回転の通り道の 68 枚だけを 768px にしたもの（元は sphere/full/ の高画質版）
const midModules = import.meta.glob<string>('../../../images/kozuyu-onbachan/sphere/mid/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

const fileName = (path: string) => path.slice(path.lastIndexOf('/') + 1)

const MID = new Map(Object.entries(midModules).map(([path, url]) => [fileName(path), url]))

export const GRANNY_FRONT = front

const POLE_AZ = [0, 90, 180, 270]
const POLE_SPIN = -1 // 真上で方位が増えると画像は反時計回りに回る（撮影結果から確認済み）
const pad = (n: number, w: number) => String(Math.abs(n)).padStart(w, '0')
const elName = (e: number) => (e < 0 ? '-' : '+') + pad(e, 2)
const mod = (x: number, m: number) => ((x % m) + m) % m

export type GrannyView = { file: string; rot: number }

// yaw: 横の角度, pitch: 縦の角度。±90° を超えると頭の上/足の下を越えて裏側へ回り込む
// images/kozuyu-onbachan/sphere/preview.html と同じ計算
export function frameFor(yaw: number, pitch: number): GrannyView {
  let p = mod(pitch + 180, 360) - 180
  let az = yaw
  let rot = 0
  if (Math.abs(p) > 90) {
    p = Math.sign(p) * 180 - p
    az += 180
    rot = 180
  }
  az = mod(az, 360)
  if (Math.abs(p) > 85) {
    const top = p > 0
    let best = 0
    let bestDiff = 999
    for (const a of POLE_AZ) {
      const d = Math.abs(mod(az - a + 180, 360) - 180)
      if (d < bestDiff) {
        bestDiff = d
        best = a
      }
    }
    const delta = mod(az - best + 180, 360) - 180
    rot += (top ? 1 : -1) * POLE_SPIN * delta
    return { file: `e${elName(top ? 89 : -89)}_a${pad(best, 3)}.webp`, rot }
  }
  const el = Math.max(-80, Math.min(80, Math.round(p / 10) * 10))
  const a = mod(Math.round(az / 10) * 10, 360)
  return { file: `e${elName(el)}_a${pad(a, 3)}.webp`, rot }
}

export const midUrl = (file: string) => MID.get(file)

// 判定シーンの回り方: 横と縦に同時に 1 周ずつ回して、正面で止まる
export const SPIN_MS = 3000

const SPIN_STEPS = 72
const SPIN_STEP_DEG = 10
// 正面の画像にいちばん近い撮影データは方位 350°。ここから回り始めて、ここで止まる
const SPIN_START_YAW = -10

// 回転の通り道にある画像。最初と最後（null）は正面の画像
// 撮影データは 10° 刻みなので、横と縦を 1 段ずつ交互に進めて、1 周の段数を増やす
export const SPIN_KEYFRAMES: (GrannyView | null)[] = Array.from({ length: SPIN_STEPS + 1 }, (_, i) =>
  i === 0 || i === SPIN_STEPS
    ? null
    : frameFor(SPIN_START_YAW + Math.ceil(i / 2) * SPIN_STEP_DEG, Math.floor(i / 2) * SPIN_STEP_DEG),
)

// 回り始めと止まる前の割合。ここが長いと 1 段ずつ見えてしまうので、短くして等速で回す時間を長くする
const RAMP = 0.12

// 動き出しと止まり際だけなめらかに加減速し、あいだは等速で進む
export function easeSpin(t: number): number {
  if (t > 0.5) return 1 - easeSpin(1 - t)
  const cruise = 1 / (1 - RAMP)
  if (t >= RAMP) return cruise * (t - RAMP / 2)
  return (cruise * (t - (RAMP / Math.PI) * Math.sin((Math.PI * t) / RAMP))) / 2
}

// 横の 1 段は縦の 1 段より絵の変化が小さいので（実測で 4.7 対 6.7）、時間も短くして見た目の速さをそろえる
const YAW_SHARE = 0.41

function stepPosition(progress: number) {
  const pairs = (progress * SPIN_STEPS) / 2
  const pair = Math.floor(pairs)
  const rest = pairs - pair
  return pair * 2 + (rest < YAW_SHARE ? rest / YAW_SHARE : 1 + (rest - YAW_SHARE) / (1 - YAW_SHARE))
}

// 1 コマの真ん中で前の画像から後の画像へ切り替える。width は 1 コマのうち混ぜる幅
export const spinFade = (mix: number, width: number) => Math.min(Math.max((mix - 0.5) / width + 0.5, 0), 1)

// t（0〜1）のときの 2 枚の添字と、後の 1 枚の濃さ
// 等速の間は絵がくっきり見えるように狭く、1 段が長くなる加減速の間は段差が見えないように全部混ぜる
export function spinBlend(t: number) {
  const clamped = Math.min(Math.max(t, 0), 1)
  const position = stepPosition(easeSpin(clamped))
  const from = Math.min(Math.floor(position), SPIN_STEPS - 1)
  const inRamp = clamped < RAMP || clamped > 1 - RAMP
  return { from, to: from + 1, fade: spinFade(position - from, inRamp ? 1 : 0.5) }
}

export type SpinFrame = { image: HTMLImageElement; rot: number }

let spinLoad: Promise<SpinFrame[] | null> | undefined

// SPIN_KEYFRAMES と同じ順の、デコード済みの画像。1 枚でも失敗したら null を返し、次はやり直す
export function loadSpinImages() {
  spinLoad ??= Promise.all(
    SPIN_KEYFRAMES.map(async (view) => {
      const image = new Image()
      image.src = view ? (midUrl(view.file) ?? '') : GRANNY_FRONT
      await image.decode()
      return { image, rot: view?.rot ?? 0 }
    }),
  ).catch(() => {
    spinLoad = undefined
    return null
  })
  return spinLoad
}
