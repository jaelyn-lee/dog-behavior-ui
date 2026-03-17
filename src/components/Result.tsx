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
  return (
    <>
      <p>{previousBehaviour}</p>
      <div className="mt-5 p-4 bg-gray-100 rounded-lg whitespace-pre-wrap">
        <h2 className="text-xl font-bold mb-2">Psychological Reasons:</h2>
        <ul className="list-disc list-inside mb-4">
          {behaviourResult.psychological_reasons.map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>

        <h2 className="text-xl font-bold mb-2">Environmental Triggers:</h2>
        <ul className="list-disc list-inside mb-4">
          {behaviourResult.environmental_triggers.map((trigger, index) => (
            <li key={index}>{trigger}</li>
          ))}
        </ul>

        <h2 className="text-xl font-bold mb-2">When to Worry:</h2>
        <p>{behaviourResult.when_to_worry}</p>
      </div>
    </>
  )
}
