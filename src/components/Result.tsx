import { useEffect, useState } from 'react'
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel'

export interface BehaviourResult {
  psychological_reasons: string[]
  environmental_triggers: string[]
  when_to_worry: string
}

interface ResultProps {
  behaviourResult: BehaviourResult
  previousBehaviour: string
}

export const Result = ({ behaviourResult, previousBehaviour }: ResultProps) => {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) return
    api.on('select', () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  const dots = [0, 1, 2]

  return (
    <div className="flex flex-col gap-4">
      {/* Previous behaviour pill */}
      <div className="bg-tertiary/20 border border-tertiary rounded-xl px-4 py-3 text-sm text-dark">
        <span className="font-bold mr-1">🐶 You asked:</span>
        {previousBehaviour}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center items-center gap-2">
        {dots.map((i) => (
          <button
            key={i}
            onClick={() => api?.scrollTo(i)}
            className={`h-2 rounded-full border-none cursor-pointer transition-all duration-300 ${
              current === i
                ? i === 0
                  ? 'w-6 bg-primary'
                  : i === 1
                    ? 'w-6 bg-secondary'
                    : 'w-6 bg-tertiary'
                : 'w-2 bg-dark/20'
            }`}
          />
        ))}

        <div className="relative w-full">
          <Carousel setApi={setApi}>
            <CarouselContent className="w-full">
              {/* Card 1 — Psychological Reasons */}
              <CarouselItem>
                <div className="bg-white border-2 border-primary rounded-2xl p-5 shadow-[0_4px_20px] shadow-primary/20 min-h-[200px]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-lg shrink-0">
                      🧠
                    </div>
                    <div>
                      <p className="text-[10px] text-primary font-extrabold tracking-widest uppercase m-0">
                        Card 1 of 3
                      </p>
                      <h2 className="text-base font-extrabold text-dark m-0">
                        Psychological Reasons
                      </h2>
                    </div>
                  </div>
                  <ul className="flex flex-col gap-2 m-0 p-0 list-none">
                    {behaviourResult.psychological_reasons.map((reason, i) => (
                      <li
                        key={i}
                        className="flex gap-2.5 items-start text-sm text-dark leading-relaxed"
                      >
                        <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </CarouselItem>

              {/* Card 2 — Environmental Triggers */}
              <CarouselItem>
                <div className="bg-white border-2 border-secondary rounded-2xl p-5 shadow-[0_4px_20px] shadow-secondary/20 min-h-[200px]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-lg shrink-0">
                      🌿
                    </div>
                    <div>
                      <p className="text-[10px] text-secondary font-extrabold tracking-widest uppercase m-0">
                        Card 2 of 3
                      </p>
                      <h2 className="text-base font-extrabold text-dark m-0">
                        Environmental Triggers
                      </h2>
                    </div>
                  </div>
                  <ul className="flex flex-col gap-2 m-0 p-0 list-none">
                    {behaviourResult.environmental_triggers.map(
                      (trigger, i) => (
                        <li
                          key={i}
                          className="flex gap-2.5 items-start text-sm text-dark leading-relaxed"
                        >
                          <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-secondary inline-block" />
                          {trigger}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </CarouselItem>

              {/* Card 3 — When to Worry */}
              <CarouselItem>
                <div className="bg-white border-2 border-tertiary rounded-2xl p-5 shadow-[0_4px_20px] shadow-tertiary/20 min-h-[200px]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-tertiary/30 flex items-center justify-center text-lg shrink-0">
                      ⚠️
                    </div>
                    <div>
                      <p className="text-[10px] text-dark/50 font-extrabold tracking-widest uppercase m-0">
                        Card 3 of 3
                      </p>
                      <h2 className="text-base font-extrabold text-dark m-0">
                        When to Worry
                      </h2>
                    </div>
                  </div>
                  <p className="text-sm text-dark leading-relaxed m-0">
                    {behaviourResult.when_to_worry}
                  </p>
                </div>
              </CarouselItem>
            </CarouselContent>

            <CarouselPrevious className="border border-dark/15 bg-white text-dark shadow-sm" />
            <CarouselNext className="border border-dark/15 bg-white text-dark shadow-sm" />
          </Carousel>

          {/* Swipe hint — first card only */}
          {current === 0 && (
            <p className="text-center mt-2.5 text-xs text-dark/40 flex items-center justify-center gap-1">
              Swipe or use arrows to see all 3 cards
              <span className="animate-[nudge_1.5s_ease-in-out_infinite]">
                →
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
