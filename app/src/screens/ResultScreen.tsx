import type { KozuyuData } from '../data/types'
import type { Result } from '../lib/buildResult'
import type { EffortLevel } from '../lib/effort'
import { Bubble, Card, DraftNote, GrannyFace } from '../components/parts'
import { ScoreCard } from '../components/ScoreCard'

type Props = {
  data: KozuyuData
  result: Result
  effort: EffortLevel
  onStartCooking: () => void
  onRestart: () => void
}

export function ResultScreen({ data, result, effort, onStartCooking, onRestart }: Props) {
  const { template } = result

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-5 pb-8 md:gap-6 md:px-10 md:pt-6">
      <div className="flex items-center gap-4 md:justify-center">
        <GrannyFace size={64} />
        <Bubble>
          {template ? `「${effort.label}」なら、ここを意識して作ってみっせ` : data.lines.noTemplate}
        </Bubble>
      </div>
      {template && <ScoreCard score={result.score} rows={result.rows} />}

      {template ? (
        <div className="grid gap-4 md:grid-cols-2 md:items-start md:gap-6">
          <Card>
            <div className="mb-3 flex flex-wrap items-baseline gap-x-3">
              <h1 className="text-xl font-bold">今日の{data.dish}</h1>
              <span className="text-sm text-sumi">
                {template.servings}・{template.time}
              </span>
            </div>
            <p className="mb-2 text-sm font-bold text-kincha">{template.label}</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-xl bg-kinari px-3 py-2 text-sm">
              {template.amounts.map((amount) => (
                <div key={amount.item} className="contents">
                  <dt>{amount.item}</dt>
                  <dd className="font-bold">{amount.qty}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card title="作り方">
            <ol className="list-decimal space-y-2 pl-6 text-base font-bold">
              {template.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Card>
          <Card title="最初に、出汁" className="md:col-span-2">
            <p className="font-bold text-shu">{effort.dashiTime}</p>
            <p className="mt-2 leading-relaxed">{effort.dashiMethod}</p>
            <p className="mt-3 rounded-xl bg-kinari p-3 text-sm leading-relaxed text-sumi">
              {effort.caution}
            </p>
          </Card>
          <Card title="ばあちゃんのアドバイス" className="md:col-span-2">
            <p className="leading-relaxed text-sumi">{effort.advice}</p>
          </Card>
        </div>
      ) : (
        <Card title="だしになるもの">
          <p className="mb-3">次のどれか1つがあれば作れます。</p>
          <p className="text-lg font-bold">{result.needOneOf.join('・')}</p>
        </Card>
      )}

      {data.draft && <DraftNote />}
      {template && (
        <button
          type="button"
          onClick={onStartCooking}
          className="w-full rounded-full bg-shu py-4 text-lg font-bold text-white shadow-lg"
        >
          ばあちゃんと作り始める
        </button>
      )}
      <button
        type="button"
        onClick={onRestart}
        className="w-full rounded-full border-2 border-ai py-3 font-bold text-ai"
      >
        材料を選び直す
      </button>
    </div>
  )
}
