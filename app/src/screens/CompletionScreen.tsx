import { useState } from 'react'
import type { KozuyuData } from '../data/types'
import type { Result } from '../lib/buildResult'
import { AizuSection, Bubble, GrannyFigure } from '../components/parts'
import akabeko from '../../../images/akabeko.webp'

type Props = { data: KozuyuData; result: Result; onEvaluate: () => void; onRestart: () => void }

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
    <div className="flex flex-1 flex-col gap-4 px-4 pt-3 pb-8 md:mx-auto md:w-full md:max-w-4xl md:pt-6">
      <div className="flex items-center gap-3 md:justify-center">
        <GrannyFigure height={168} />
        <Bubble>{data.lines.completion}</Bubble>
      </div>
      <div className="pt-2 text-center">
        <svg
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#a82a1f"
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
          <h1 className="text-[26px] font-bold">こづゆ、できたぞ！</h1>
          <img src={akabeko} alt="" className="h-12 w-auto" />
        </div>
        <p className="mt-1.5 text-sm text-sumi">まず作ってみたことが、本場を知る最初の一歩だ。</p>
      </div>

      <button
        type="button"
        onClick={onEvaluate}
        className="min-h-14 w-full rounded-full bg-shu text-[17px] font-bold text-white shadow-lg"
      >
        食べたら、どうだったか付けてけさい
      </button>

      <AizuSection>
        {result.aizu.length > 0 && (
          <div className="mt-7 md:mt-9">
            <h3 className="mb-3 text-lg font-bold">会津で手に入れたいもの</h3>
            <ul className={`grid gap-3 ${result.aizu.length > 1 ? 'md:grid-cols-2' : ''}`}>
              {result.aizu.map((item) => (
                <li key={item.original} className="rounded-xl bg-kinari p-3">
                  <p className="font-bold">{item.original}</p>
                  {item.sources.length === 0 ? (
                    <p className="text-sm text-sumi">会津で買える場所は、今確かめてっとこだ</p>
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
          </div>
        )}
        {result.memo && (
          <button
            type="button"
            onClick={onCopy}
            className="mt-5 min-h-14 w-full rounded-full bg-ai text-[17px] font-bold text-white shadow-lg"
          >
            {copied ? '買い物メモをコピーしたぞ' : '会津で買うもんをメモするべ'}
          </button>
        )}
      </AizuSection>

      <button
        type="button"
        onClick={onRestart}
        className="min-h-12 w-full rounded-full border-2 border-ai font-bold"
      >
        もう一回作るべ
      </button>
    </div>
  )
}
