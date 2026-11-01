import { useState } from 'react'
import type { KozuyuData } from '../data/types'
import type { Result } from '../lib/buildResult'
import { Bubble, Card, GrannyFace, StepHeader } from '../components/parts'

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
      <StepHeader step={4} title="本場のこづゆも食べてみよう" />
      <div className="flex items-center gap-4 md:justify-center">
        <GrannyFace size={72} />
        <Bubble>家で作った一杯の次は、会津の一杯も味わってみてけろ</Bubble>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="受け継がれてきた一杯">
          <p className="leading-relaxed text-sumi">{data.lines.aizuHeritage}</p>
        </Card>
        <Card title="本場で味わう楽しさ">
          <p className="leading-relaxed text-sumi">{data.lines.aizuExperience}</p>
        </Card>
      </div>

      {result.aizu.length > 0 && (
        <Card title="会津の材料を知る">
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
          className="min-h-12 w-full rounded-full bg-ai py-4 text-lg font-bold text-white shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-kincha/50"
        >
          {copied ? '買い物メモをコピーしました' : '会津で買うものをメモする'}
        </button>
      )}
      <p className="text-center text-xl font-bold">自分の一杯から、会津の一杯へ。</p>
      <button
        type="button"
        onClick={onRestart}
        className="min-h-11 w-full rounded-full border-2 border-ai py-3 font-bold text-ai focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-kincha/50"
      >
        別の作り方も試す
      </button>
    </div>
  )
}
