import { useState } from 'react'
import type { KozuyuData } from '../data/types'
import type { Result } from '../lib/buildResult'
import { Bubble, Card, GrannyFace } from '../components/parts'

type Props = { data: KozuyuData; result: Result; onRestart: () => void }

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

export function CompletionScreen({ data, result, onRestart }: Props) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    if (result.memo && (await copyText(result.memo))) setCopied(true)
  }

  return (
    <div className="flex flex-1 flex-col gap-5 px-4 pt-5 pb-8 md:px-10 md:pt-8">
      <div className="flex items-center gap-4 md:justify-center">
        <GrannyFace size={80} />
        <Bubble>{data.lines.completion}</Bubble>
      </div>
      <div className="text-center">
        <p className="text-5xl" aria-hidden>
          🎉
        </p>
        <h1 className="mt-2 text-3xl font-bold">こづゆ、できあがり！</h1>
        <p className="mt-2 text-sumi">まず作ってみたことが、本場を知る最初の一歩です。</p>
      </div>

      {result.aizu.length > 0 && (
        <Card title="もっと本場に近づけるなら">
          <ul className="space-y-3">
            {result.aizu.map((item) => (
              <li key={item.original} className="rounded-xl bg-kinari p-3">
                <p className="text-lg font-bold">{item.original}</p>
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
          className="w-full rounded-full bg-ai py-4 text-lg font-bold text-white shadow-lg"
        >
          {copied ? '買い物メモをコピーしました' : '会津で買うものをメモする'}
        </button>
      )}
      <p className="text-center text-lg font-bold">代用でここまで。残りは、会津で。</p>
      <button
        type="button"
        onClick={onRestart}
        className="w-full rounded-full border-2 border-ai py-3 font-bold text-ai"
      >
        もう一度作る
      </button>
    </div>
  )
}
