'use client'

import { CardContent } from '../ui/Card'
import { InlineMath, BlockMath } from '../ui/Math'

export function HarmDetectionImpl() {
  return (
    <CardContent>
      <div className="space-y-6">

        <div>
          <h4 className="font-bold text-neutral-900 mb-2">The idea</h4>
          <p className="text-neutral-700">
            A simple rule for guardrail monitoring: stop the experiment if the effect on
            a guardrail metric is more than 3 standard deviations in the <em>harmful</em> direction.
            Unlike the old two-sided 3 SD rule, this check is <strong>one-sided</strong>:it only
            triggers when the effect is clearly negative (harmful). A large positive effect on a
            guardrail is not a reason to abort.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-neutral-900 mb-2">The recipe</h4>
          <p className="text-neutral-700 mb-2">
            At each peek, check whether the confidence interval lies entirely below zero:
          </p>
          <BlockMath>{`\\hat{\\tau}(t_k) + 3.0 \\cdot \\text{SE}(t_k) < 0`}</BlockMath>
          <p className="text-neutral-700 mb-3">
            If this holds, the upper bound of the 3-SD interval is below zero:the data
            provide very strong evidence of harm. Abort the experiment.
          </p>
          <p className="text-neutral-700">
            Equivalently, compute the one-sided z-statistic and check{' '}
            <InlineMath>{`Z_k < -3.0`}</InlineMath> (i.e. the standardised effect is strongly negative).
            No early stopping for positive effects.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-neutral-900 mb-2">Stopping threshold vs. other methods (K = 4)</h4>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm border-collapse border border-neutral-300">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="border border-neutral-300 p-2">Peek <InlineMath>{`k`}</InlineMath> (of K=4)</th>
                  <th className="border border-neutral-300 p-2">Harm detection (z = 3.0, one-sided)</th>
                  <th className="border border-neutral-300 p-2"><InlineMath>{`c_k^{\\text{OBF}}`}</InlineMath> (OBF)</th>
                  <th className="border border-neutral-300 p-2"><InlineMath>{`c_P`}</InlineMath> (Pocock)</th>
                  <th className="border border-neutral-300 p-2"><InlineMath>{`z_{\\alpha/2}`}</InlineMath> (classical)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1 (25% of data)', '3.00', '4.05', '2.36', '1.96'],
                  ['2 (50% of data)', '3.00', '2.86', '2.36', '1.96'],
                  ['3 (75% of data)', '3.00', '2.34', '2.36', '1.96'],
                  ['4 (100% of data)', '3.00', '2.02', '2.36', '1.96'],
                ].map(([peek, hd, obf, poc, cls], i) => (
                  <tr key={i} className={i % 2 === 1 ? 'bg-neutral-50' : ''}>
                    <td className="border border-neutral-300 p-2 text-center">{peek}</td>
                    <td className="border border-neutral-300 p-2 text-center font-semibold">{hd}</td>
                    <td className="border border-neutral-300 p-2 text-center">{obf}</td>
                    <td className="border border-neutral-300 p-2 text-center">{poc}</td>
                    <td className="border border-neutral-300 p-2 text-center">{cls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-neutral-600 text-sm mt-2">
            The z = 3.0 threshold is the same at every peek. Unlike OBF and Pocock, this is not
            formally calibrated to the number of peeks:it is a fixed rule chosen for its
            simplicity and conservativeness.
          </p>
        </div>

        <div className="bg-white border border-neutral-400 rounded-lg p-4">
          <p className="text-neutral-700">
            At a single look the false positive rate for the one-sided test is{' '}
            <InlineMath>{`\\Phi(-3) \\approx 0.13\\%`}</InlineMath>:far below the nominal 5%.
            This means the rule will <strong>rarely trigger</strong> even under a genuine harmful
            effect unless the effect is large or the experiment runs for a long time. It is
            intended as a last-resort safety check, not a precise statistical test.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-neutral-900 mb-2">Implementation step by step</h4>
          <ol className="list-decimal list-inside space-y-3 text-neutral-700 ml-4">
            <li>
              <strong>At each peek:</strong> compute the effect estimate and its standard error:
              <BlockMath>{`\\hat{\\tau}(t_k), \\quad \\text{SE}(t_k)`}</BlockMath>
            </li>
            <li>
              <strong>Compute the upper bound:</strong>{' '}
              <InlineMath>{`\\text{UB}_k = \\hat{\\tau}(t_k) + 3.0 \\cdot \\text{SE}(t_k)`}</InlineMath>
            </li>
            <li>
              <strong>Harm check:</strong> If <InlineMath>{`\\text{UB}_k < 0`}</InlineMath>: harm detected
             :abort the experiment immediately.
            </li>
            <li>
              <strong>Otherwise:</strong> continue. No stopping for positive results.
            </li>
            <li>
              <strong>No pre-specification of K required</strong>:the threshold does not depend
              on the number of planned peeks.
            </li>
          </ol>
        </div>

        <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
          <h5 className="font-bold text-blue-900 mb-2">Caveats</h5>
          <ul className="text-neutral-700 text-sm space-y-2 list-disc list-inside">
            <li>
              <strong>No formal FWER guarantee.</strong> The false positive rate for the
              one-sided test depends on the number of peeks, which may not be known in advance.
            </li>
            <li>
              <strong>Very conservative.</strong> The rule will rarely trigger. It requires a
              strong harmful signal (effect more than 3 SDs below zero) before aborting, so
              moderate harms may not be caught quickly.
            </li>
            <li>
              <strong>One-sided by design.</strong> Large positive effects on a guardrail metric
              never cause the experiment to stop. If you also need to detect guardrail benefits,
              use a two-sided method.
            </li>
            <li>
              <strong>Better alternative for formal guardrail monitoring:</strong> use OBF with
              a one-sided <InlineMath>{`\\alpha`}</InlineMath> for guardrail KPIs. This gives formal
              FWER control with a threshold that is very strict early (preventing over-triggering)
              and closer to classical at the planned end date.
            </li>
          </ul>
        </div>

      </div>
    </CardContent>
  )
}
