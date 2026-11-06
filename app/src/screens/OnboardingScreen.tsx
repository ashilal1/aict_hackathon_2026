import { useEffect, useState } from 'react'
import type { KozuyuData } from '../data/types'
import { Bubble, Card, GrannyFigure } from '../components/parts'
import { IntroScreen, Landscape } from './IntroScreen'
import koboshi from '../../../images/okiagari-koboshi.webp'

type Props = {
  data: KozuyuData
  onDone: () => void
}

const PAGES = ['使い方', 'こづゆって、なんだべ？', 'こづゆばあちゃんの生態', 'ばあちゃんっこ宣言']
const NUMBERS = ['一', '二', '三', '四', '五', '六']

function HowToPage({ onboarding }: { onboarding: KozuyuData['onboarding'] }) {
  return (
    <>
      <div className="flex items-center gap-3 md:justify-center">
        <GrannyFigure />
        <Bubble>{onboarding.greeting}</Bubble>
      </div>
      <ol className="grid gap-3 md:grid-cols-2 md:gap-5">
        {onboarding.howTo.map((item, i) => (
          <li key={item.title} className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm md:p-6">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-shu font-bold text-white">
              {i + 1}
            </span>
            <div>
              <p className="font-bold">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-sumi">{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  )
}

function GrannyPage({ granny }: { granny: KozuyuData['onboarding']['granny'] }) {
  return (
    <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-center md:gap-8">
      <div className="flex items-center gap-3 md:flex-col">
        <GrannyFigure height={260} />
        <Bubble>{granny.greeting}</Bubble>
      </div>
      <Card title="生態図鑑">
        <dl className="divide-y divide-[#f0ebe0]">
          {granny.profile.map((item) => (
            <div key={item.label} className="grid grid-cols-[6.5rem_1fr] gap-2 py-2 text-sm leading-relaxed">
              <dt className="font-bold text-shu">{item.label}</dt>
              <dd>{item.text}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-sumi">{granny.note}</p>
      </Card>
    </div>
  )
}

// 縦書きで右から読む。本家の「あいづっこ宣言」の形にならって、景色の上に置く
function DeclarationPage({ declaration }: { declaration: KozuyuData['onboarding']['declaration'] }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#c9d6e3] via-[#e8eef3] to-kinari">
      <div aria-hidden className="absolute inset-x-0 bottom-0 opacity-40">
        <Landscape />
      </div>
      <div className="relative mx-auto h-[30rem] w-fit pt-8 pb-5 text-[17px] leading-[1.9] font-bold tracking-wider [writing-mode:vertical-rl] md:h-[35rem] md:text-xl md:leading-[2.2]">
        <ol>
          {declaration.items.map((item, i) => (
            <li key={item} className="whitespace-nowrap">
              <span className="mb-[1em] inline-block">{NUMBERS[i]}</span>
              {item}
            </li>
          ))}
        </ol>
        <div className="mr-3 text-shu md:mr-6">
          {declaration.closing.map((line, i) => (
            <p key={line} className="whitespace-nowrap" style={{ paddingTop: `${i * 2}em` }}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

// アプリを開いて最初に出す説明。どのページからでも飛ばせる
export function OnboardingScreen({ data, onDone }: Props) {
  const [page, setPage] = useState(0)
  const last = page === PAGES.length - 1

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page])

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-3 pb-8 md:mx-auto md:w-full md:max-w-4xl md:gap-5 md:pt-6">
      <div className="flex min-h-11 items-center justify-between">
        <p aria-label={`${PAGES.length} ページのうち ${page + 1} ページ目`} className="flex gap-2">
          {PAGES.map((title, i) => (
            <img
              key={title}
              src={koboshi}
              alt=""
              className={`h-7 w-auto ${i === page ? '' : 'opacity-35 grayscale'}`}
            />
          ))}
        </p>
        {!last && (
          <button
            type="button"
            onClick={onDone}
            className="min-h-11 px-3 text-sm font-bold text-sumi underline"
          >
            スキップするべ
          </button>
        )}
      </div>

      <h1 className="text-center text-2xl font-bold md:text-3xl">{PAGES[page]}</h1>

      {page === 0 && <HowToPage onboarding={data.onboarding} />}
      {page === 1 && <IntroScreen intro={data.intro} />}
      {page === 2 && <GrannyPage granny={data.onboarding.granny} />}
      {page === 3 && <DeclarationPage declaration={data.onboarding.declaration} />}

      <div className="mt-auto grid gap-3 pt-2 md:grid-cols-2">
        <button
          type="button"
          onClick={() => (last ? onDone() : setPage((value) => value + 1))}
          className={`min-h-14 w-full rounded-full bg-shu text-lg font-bold text-white shadow-lg ${
            page === 0 ? 'md:col-span-2' : 'md:order-2'
          }`}
        >
          {last ? 'こづゆを作り始めるべ' : '次さ行くべ'}
        </button>
        {page > 0 && (
          <button
            type="button"
            onClick={() => setPage((value) => value - 1)}
            className="min-h-12 w-full rounded-full border-2 border-ai font-bold md:order-1 md:min-h-14"
          >
            前さ戻るべ
          </button>
        )}
      </div>
    </div>
  )
}
