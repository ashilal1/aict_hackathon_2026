import { useState } from 'react'
import type { KozuyuData } from '../data/types'
import type { Result } from '../lib/buildResult'
import { Bubble, Card, GrannyFace } from '../components/parts'

type Props = { data: KozuyuData; result: Result; onEvaluate: () => void; onRestart: () => void }

// 会津の赤べこ（飾り）
function Akabeko() {
  return (
    <svg width="44" height="44" viewBox="0 0 40 40" aria-hidden>
      <rect x="6" y="18" width="24" height="13" rx="6" fill="#c0392b" />
      <circle cx="30" cy="14" r="8" fill="#c0392b" />
      <circle cx="13" cy="23" r="3" fill="#fff" />
      <circle cx="22" cy="27" r="2.4" fill="#fff" />
      <path d="M27 7 L24 2 L29 6Z" fill="#f5efe3" />
      <circle cx="34" cy="14" r="1.4" fill="#1f2a44" />
      <rect x="8" y="30" width="3" height="7" fill="#1f2a44" />
      <rect x="25" y="30" width="3" height="7" fill="#1f2a44" />
    </svg>
  )
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

export function CompletionScreen({ data, result, onEvaluate, onRestart }: Props) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    if (result.memo && (await copyText(result.memo))) setCopied(true)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-3 pb-8 md:mx-auto md:w-full md:max-w-xl md:pt-6">
      <div className="flex items-center gap-3 md:justify-center">
        <GrannyFace size={64} />
        <Bubble>{data.lines.completion}</Bubble>
      </div>
      <div className="pt-2 text-center">
        <svg
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#c0392b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="mx-auto"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M7.5 12.5l3 3 6-6.5" />
        </svg>
        <div className="mt-2 flex items-center justify-center gap-2.5">
          <h1 className="text-[26px] font-bold">こづゆ、できあがり！</h1>
          <Akabeko />
        </div>
        <p className="mt-1.5 text-sm text-sumi">まず作ってみたことが、本場を知る最初の一歩です。</p>
      </div>

      <button
        type="button"
        onClick={onEvaluate}
        className="min-h-14 w-full rounded-full bg-shu text-[17px] font-bold text-white shadow-lg"
      >
        食べたら、どうだったか付ける
      </button>

      {result.aizu.length > 0 && (
        <Card title="もっと本場に近づけるなら">
          <ul className="space-y-3">
            {result.aizu.map((item) => (
              <li key={item.original} className="rounded-xl bg-kinari p-3">
                <p className="font-bold">{item.original}</p>
                {item.sources.length === 0 ? (
                  <p className="text-sm text-sumi">会津で買える場所は確認中です</p>
                ) : (
                  item.sources.map((source) => (
                    <div key={source.label} className="mt-1 text-sm">
                      <p className="font-bold">
                        {source.label}
                        {source.publicOnly && (
                          <span className="ml-1 text-xs text-sumi">（公開情報より）</span>
                        )}
                      </p>
                      <p className="text-sumi">{source.how.join('／')}</p>
                    </div>
                  ))
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {result.memo && (
        <button
          type="button"
          onClick={onCopy}
          className="min-h-14 w-full rounded-full bg-ai text-[17px] font-bold text-white shadow-lg"
        >
          {copied ? '買い物メモをコピーしました' : '会津で買うものをメモする'}
        </button>
      )}
      <p className="text-center text-lg font-bold">代用でここまで。残りは、会津で。</p>
      <button
        type="button"
        onClick={onRestart}
        className="min-h-12 w-full rounded-full border-2 border-ai font-bold"
      >
        もう一度作る
      </button>
    </div>
  )
}
