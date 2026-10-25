import { useState } from 'react'
import type { KozuyuData, Part } from '../data/types'
import type { Result, Row } from '../lib/buildResult'
import { Bubble, Card, DraftNote, GrannyFace, VerdictTag } from '../components/parts'

const SECTIONS: { id: Part['section']; label: string }[] = [
  { id: 'dashi', label: 'だし' },
  { id: 'gu', label: '具' },
]

type Props = {
  data: KozuyuData
  result: Result
  onRestart: () => void
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // クリップボード API が使えないブラウザ向け
    const area = document.createElement('textarea')
    area.value = text
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

function SubstituteRow({ row }: { row: Row }) {
  return (
    <li className="py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold">
          {row.original}
          {row.verdict !== 'real' && (
            <>
              <span className="mx-1.5 text-sumi">→</span>
              {row.text}
            </>
          )}
        </span>
        <VerdictTag verdict={row.verdict} />
      </div>
      {row.note && <p className="mt-1 text-xs text-sumi">{row.note}</p>}
    </li>
  )
}

export function ResultScreen({ data, result, onRestart }: Props) {
  const [copied, setCopied] = useState(false)
  const { template } = result

  const onCopy = async () => {
    if (result.memo && (await copyText(result.memo))) setCopied(true)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-5 pb-8 md:gap-6 md:px-10 md:pt-6">
      <div className="flex items-center gap-4 md:justify-center">
        <GrannyFace size={64} />
        <Bubble>{template ? data.lines.result : data.lines.noTemplate}</Bubble>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:items-start md:gap-6">
        {template ? (
          <Card className="md:col-start-1 md:row-start-1">
            <div className="mb-3 flex flex-wrap items-baseline gap-x-3">
              <h2 className="text-xl font-bold">今日の{data.dish}</h2>
              <span className="text-sm text-sumi">
                {template.servings}・{template.time}
              </span>
            </div>
            <p className="mb-2 text-sm font-bold text-kincha">{template.label}</p>
            <dl className="mb-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-xl bg-kinari px-3 py-2 text-sm">
              {template.amounts.map((a) => (
                <div key={a.item} className="contents">
                  <dt>{a.item}</dt>
                  <dd className="font-bold">{a.qty}</dd>
                </div>
              ))}
            </dl>
            <ol className="list-decimal space-y-1 pl-6 text-base font-bold">
              {template.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Card>
        ) : (
          <Card title="だしになるもの" className="md:col-start-1 md:row-start-1">
            <p className="mb-3">次のどれか 1 つがあれば作れます。</p>
            <p className="text-lg font-bold">{result.needOneOf.join('・')}</p>
          </Card>
        )}

        <Card title="本物と今回の代わり" className="md:col-start-2 md:row-span-3 md:row-start-1">
          {SECTIONS.map((section) => (
            <div key={section.id} className="mb-2 last:mb-0">
              <h3 className="border-b border-stone-200 pb-1 text-sm font-bold text-sumi">{section.label}</h3>
              <ul className="divide-y divide-stone-100">
                {result.rows
                  .filter((row) => row.section === section.id)
                  .map((row) => (
                    <SubstituteRow key={row.partId} row={row} />
                  ))}
              </ul>
            </div>
          ))}
        </Card>

        {result.aizu.length > 0 && (
          <Card title="代わりがきかないものは、会津から" className="md:col-start-1 md:row-start-2">
            <ul className="space-y-3">
              {result.aizu.map((item) => (
                <li key={item.original} className="rounded-xl bg-kinari p-3">
                  <p className="text-lg font-bold">{item.original}</p>
                  {item.sources.length === 0 ? (
                    <p className="text-sm text-sumi">会津で買える場所は確認中です</p>
                  ) : (
                    item.sources.map((s) => (
                      <div key={s.label} className="mt-1 text-sm">
                        <p className="font-bold">
                          {s.label}
                          {s.publicOnly && <span className="ml-1 text-xs text-sumi">（公開情報より）</span>}
                        </p>
                        <p className="text-sumi">{s.how.join('／')}</p>
                        {s.url && (
                          <a href={s.url} target="_blank" rel="noreferrer" className="text-ai underline">
                            お店のページ
                          </a>
                        )}
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
            className="w-full rounded-full bg-ai py-4 text-lg font-bold text-white shadow-lg md:col-start-1 md:row-start-3"
          >
            {copied ? 'コピーしたよ。帰省のときに見てけろ' : '買い物メモをコピー'}
          </button>
        )}
      </div>

      <p className="text-center text-lg font-bold">代用でここまで。残りは、会津で。</p>

      <div className="space-y-2 md:mx-auto md:max-w-2xl">
        {data.draft && <DraftNote />}
        <p className="text-xs leading-relaxed text-sumi">
          分量・手順・作り手の情報は、チームが試作や電話で確かめたものだけを載せます。AI
          には作らせていません。
        </p>
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="w-full rounded-full border-2 border-ai py-3 font-bold text-ai md:mx-auto md:max-w-md"
      >
        材料をえらび直す
      </button>
    </div>
  )
}
