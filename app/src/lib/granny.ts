// ばあちゃんの画像。ビルド時に Vite が取り込む
// 止まっているとき（顔アイコンと、判定の最後）は、まっすぐ正面を向いた 1 枚を使う
import front from '../../../images/kozuyu-onbachan/front.webp'
// 判定シーンで横と縦に 1 周ずつ回って正面で止まる、60fps の動画（3 秒）
// 10° 刻みの 360° 画像（images/kozuyu-onbachan/sphere/）の間を補って作った。作り方は tools/granny-spin/render.py
// 背景は白。画面では mix-blend-mode: multiply で背景に重ねる
import spin from '../../../images/kozuyu-onbachan/spin.mp4'

export const GRANNY_FRONT = front
export const GRANNY_SPIN = spin

let spinLoad: Promise<string | null> | undefined

// 回転の動画を先に読み込んでおき、端末の中の URL を返す。失敗したら null を返し、次はやり直す
// 再生の途中で通信を待つと止まって見えるので、最後まで読み込んでから使う
export function loadSpinVideo() {
  spinLoad ??= fetch(GRANNY_SPIN)
    .then((response) => {
      if (!response.ok) throw new Error(`${response.status}`)
      return response.blob()
    })
    .then((blob) => URL.createObjectURL(blob))
    .catch(() => {
      spinLoad = undefined
      return null
    })
  return spinLoad
}
