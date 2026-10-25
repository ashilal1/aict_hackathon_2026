// ばあちゃんの 360° 画像のうち、正面の高さ（仰角 0°）で横に一周する 36 枚（10° 刻み）を使う
// 画像はリポジトリ直下の images/ にあり、ビルド時に Vite が取り込む
const modules = import.meta.glob<string>('../../../images/kozuyu-onbachan/sphere/full/e+00_a*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

const azimuthOf = (path: string) => Number(path.match(/_a(\d{3})\.webp$/)![1])

// 添字 i が方位 i×10° の画像。0 番が正面
export const GRANNY_FRAMES = Object.keys(modules)
  .sort((a, b) => azimuthOf(a) - azimuthOf(b))
  .map((path) => modules[path])

export const GRANNY_FRONT = GRANNY_FRAMES[0]

// 判定シーンでカクつかないように、入力画面のうちに読み込んでおく
export function preloadGranny() {
  for (const src of GRANNY_FRAMES) {
    const img = new Image()
    img.src = src
  }
}
