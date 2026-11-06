import type { KozuyuData } from '../data/types'
import type { Result } from '../lib/buildResult'
import { withPreparation, type EffortLevel } from '../lib/effort'
import { Bubble, Card, GrannyFigure, Stepper } from '../components/parts'

type Props = {
  data: KozuyuData
  result: Result
  checked: Set<string>
  extras: Set<string>
  effort: EffortLevel
  onStartCooking: () => void
  onRestart: () => void
}

export function ResultScreen({ data, result, checked, extras, effort, onStartCooking, onRestart }: Props) {
  const { template } = result

  return (
    <div className="flex flex-1 flex-col gap-3 px-4 pt-3 pb-8 md:gap-5 md:px-10 md:pt-6">
      <Stepper current={3} />
      <div className="flex items-center gap-3 md:justify-center">
        <GrannyFigure />
        <Bubble>
          {template ? `「${effort.shortLabel}」なら、ここを意識して作ってみっせ` : data.lines.noTemplate}
        </Bubble>
      </div>

      {template ? (
        <div className="grid gap-4 md:grid-cols-2 md:items-start md:gap-6">
          <Card>
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <h1 className="text-xl font-bold">今日の{data.dish}</h1>
              <span className="text-sm text-sumi">
                {template.servings}・{template.time}
              </span>
            </div>
            <p className="mt-2.5 mb-2 text-sm font-bold text-kincha-dark">{template.label}</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-xl bg-kinari px-3 py-2.5 text-sm">
              {template.amounts.map((amount) => (
                <div key={amount.item} className="contents">
                  <dt>{amount.item}</dt>
                  <dd className="font-bold">{amount.qty}</dd>
                </div>
              ))}
              {[...extras].map((name) => (
                <div key={name} className="contents">
                  <dt>{name}</dt>
                  <dd className="font-bold">好みの分だけ</dd>
                </div>
              ))}
            </dl>
            {extras.size > 0 && (
              <p className="mt-2 text-xs leading-relaxed text-sumi">
                {[...extras].join('・')}
                は自分で足すもんだ。本来のこづゆの材料ではねえから、味を見ながら使ってけさい
              </p>
            )}
          </Card>
          <Card title="作り方">
            <ol className="flex flex-col gap-2.5">
              {withPreparation(template.steps, checked, extras).map((step, i) => (
                <li key={step} className="flex gap-2.5 text-[15px] leading-normal font-bold">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ai text-[13px] text-white">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </Card>
          <Card title="最初に、出汁" className="md:col-span-2">
            <p className="font-bold text-shu">{effort.dashiTime}</p>
            <p className="mt-2 leading-relaxed">{effort.dashiMethod}</p>
            {effort.caution && (
              <p className="mt-2.5 rounded-xl bg-kinari p-2.5 text-[13px] leading-relaxed text-sumi">
                注意：{effort.caution}
              </p>
            )}
          </Card>
        </div>
      ) : (
        <Card title="だしになるもん">
          <p className="mb-3">次のどれか1つがあれば作れっからな。</p>
          <p className="text-lg font-bold">{result.needOneOf.join('・')}</p>
        </Card>
      )}

      {template && (
        <button
          type="button"
          onClick={onStartCooking}
          className="min-h-14 w-full rounded-full bg-shu text-[17px] font-bold text-white shadow-lg md:mx-auto md:max-w-md"
        >
          こづゆばあちゃんと作り始めるべ
        </button>
      )}
      <button
        type="button"
        onClick={onRestart}
        className="min-h-12 w-full rounded-full border-2 border-ai font-bold md:mx-auto md:max-w-md"
      >
        材料を選び直すべ
      </button>
    </div>
  )
}
