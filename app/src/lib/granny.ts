// ばあちゃんの 360° 画像（images/kozuyu-onbachan/sphere/）。ビルド時に Vite が取り込む
// 撮影データ: 横 10° 刻み × 縦 -80〜+80° 10° 刻み、真上/真下（±89°）は 0/90/180/270° の 4 枚

// 高画質版は、正面の高さで横に一周する 36 枚だけ（顔アイコンと、判定の最後に止まる正面）
const fullModules = import.meta.glob<string>('../../../images/kozuyu-onbachan/sphere/full/e+00_a*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

// 回している最中は、全方位そろった小さい版（384px）を使う
const smallModules = import.meta.glob<string>('../../../images/kozuyu-onbachan/sphere/small/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

const fileName = (path: string) => path.slice(path.lastIndexOf('/') + 1)

const SMALL = new Map(Object.entries(smallModules).map(([path, url]) => [fileName(path), url]))

const azimuthOf = (path: string) => Number(path.match(/_a(\d{3})\.webp$/)![1])

// 添字 i が方位 i×10° の画像。0 番が正面
export const GRANNY_FRAMES = Object.keys(fullModules)
  .sort((a, b) => azimuthOf(a) - azimuthOf(b))
  .map((path) => fullModules[path])

export const GRANNY_FRONT = GRANNY_FRAMES[0]

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

export const smallUrl = (file: string) => SMALL.get(file)

// 判定シーンの回り方: 横と縦に同時に 1 周ずつ回して、正面で止まる
export const SPIN_MS = 2600

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)

export function spinView(t: number): GrannyView {
  const e = easeInOutCubic(Math.min(Math.max(t, 0), 1))
  return frameFor(360 * e, 360 * e)
}

// 回る途中で通る画像の一覧（先読み用）。620 枚すべては読み込まない
export function spinFiles(): string[] {
  const files = new Set<string>()
  for (let i = 0; i <= 240; i++) files.add(spinView(i / 240).file)
  return [...files]
}

// 判定シーンでカクつかないように、入力画面のうちに読み込んでおく
export function preloadGranny() {
  const urls = [GRANNY_FRONT, ...spinFiles().map(smallUrl)]
  for (const src of urls) {
    if (!src) continue
    const img = new Image()
    img.src = src
  }
}
