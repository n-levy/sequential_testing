'use client'

export function DetailedReferences() {
  return (
    <section id="references" className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">References</h2>
        </div>

        <ol className="space-y-6 text-neutral-700">
          <li className="border-l-4 border-purple-300 pl-4">
            <p className="font-semibold">Ville, J. (1939).</p>
            <p className="italic">
              &Eacute;tude critique de la notion de collectif.
            </p>
            <p>Gauthier-Villars, Paris.</p>
            <p className="text-sm text-neutral-500 mt-1">
              Original proof of Ville&apos;s inequality for non-negative supermartingales.
              <span className="italic"> [Used in Acts 5, 7, 8.]</span>
            </p>
          </li>

          <li className="border-l-4 border-purple-300 pl-4">
            <p className="font-semibold">Wald, A. (1945).</p>
            <p>Sequential tests of statistical hypotheses.</p>
            <p className="italic">Annals of Mathematical Statistics, 16(2), 117&ndash;186.</p>
            <p className="text-sm text-neutral-500 mt-1">
              Foundational 70-page monograph defining the SPRT, proving the fundamental
              inequalities, and showing 47&ndash;63% savings over fixed-sample tests.
              <span className="italic"> [Used in Act 6.]</span>
            </p>
          </li>

          <li className="border-l-4 border-purple-300 pl-4">
            <p className="font-semibold">Wald, A. &amp; Wolfowitz, J. (1948).</p>
            <p>Optimum character of the sequential probability ratio test.</p>
            <p className="italic">Annals of Mathematical Statistics, 19(3), 326&ndash;339.</p>
            <p className="text-sm text-neutral-500 mt-1">
              Proof that the SPRT is exactly optimal among all sequential tests with the same
              error probabilities.
              <span className="italic"> [Used in Act 6.]</span>
            </p>
          </li>

          <li className="border-l-4 border-purple-300 pl-4">
            <p className="font-semibold">Doob, J. L. (1953).</p>
            <p className="italic">Stochastic Processes.</p>
            <p>Wiley, New York.</p>
            <p className="text-sm text-neutral-500 mt-1">
              Definitive treatment of martingale theory including the Optional Stopping Theorem.
              <span className="italic"> [Used in Act 2.]</span>
            </p>
          </li>

          <li className="border-l-4 border-purple-300 pl-4">
            <p className="font-semibold">Robbins, H. (1970).</p>
            <p>Statistical methods related to the law of the iterated logarithm.</p>
            <p className="italic">Annals of Mathematical Statistics, 41(5), 1397&ndash;1409.</p>
            <p className="text-sm text-neutral-500 mt-1">
              Introduced the mixture likelihood ratio approach and confidence sequences.
              <span className="italic"> [Used in Act 7.]</span>
            </p>
          </li>

          <li className="border-l-4 border-purple-300 pl-4">
            <p className="font-semibold">Pocock, S. J. (1977).</p>
            <p>Group sequential methods in the design and analysis of clinical trials.</p>
            <p className="italic">Biometrika, 64(2), 191&ndash;199.</p>
            <p className="text-sm text-neutral-500 mt-1">
              Constant boundary for group sequential testing in clinical trials.
              <span className="italic"> [Used in Act 13.]</span>
            </p>
          </li>

          <li className="border-l-4 border-purple-300 pl-4">
            <p className="font-semibold">O&apos;Brien, P. C. &amp; Fleming, T. R. (1979).</p>
            <p>A multiple testing procedure for clinical trials.</p>
            <p className="italic">Biometrics, 35(3), 549&ndash;556.</p>
            <p className="text-sm text-neutral-500 mt-1">
              Decreasing boundary that preserves most of the final-analysis power.
              <span className="italic"> [Used in Act 13.]</span>
            </p>
          </li>

          <li className="border-l-4 border-purple-300 pl-4">
            <p className="font-semibold">Deng, A., Xu, Y., Kohavi, R., &amp; Walker, T. (2013).</p>
            <p>Improving the sensitivity of online controlled experiments by utilizing
              pre-experiment data.</p>
            <p className="italic">Proc. WSDM, 123&ndash;132.</p>
            <p className="text-sm text-neutral-500 mt-1">
              The original CUPED paper. Practical results at Microsoft Bing: 45&ndash;52% variance reduction.
              <span className="italic"> [Used in Acts 9&ndash;11.]</span>
            </p>
          </li>

          <li className="border-l-4 border-purple-300 pl-4">
            <p className="font-semibold">Johari, R., Pekelis, L., &amp; Walsh, D. J. (2017).</p>
            <p>Always valid inference: Continuous monitoring of A/B tests.</p>
            <p className="italic">Operations Research, 65(6), 1651&ndash;1667.</p>
            <p className="text-sm text-neutral-500 mt-1">
              Applied the mixture SPRT to A/B testing. Assumes known variance.
              <span className="italic"> [Used in Act 7.]</span>
            </p>
          </li>

          <li className="border-l-4 border-purple-300 pl-4">
            <p className="font-semibold">Howard, S. R., Ramdas, A., McAuliffe, J., &amp; Sekhon, J. (2021).</p>
            <p>Time-uniform, nonparametric, nonasymptotic confidence sequences.</p>
            <p className="italic">Annals of Statistics, 49(2), 1055&ndash;1080.</p>
            <p className="text-sm text-neutral-500 mt-1">
              Developed the sub-&psi; framework for confidence sequences. Key result: the
              Normal mixture boundary. <strong>This is the framework Eppo adopted.</strong>
              <span className="italic"> [Used in Acts 8, 10, 12.]</span>
            </p>
          </li>

          <li className="border-l-4 border-purple-300 pl-4">
            <p className="font-semibold">Schmit, M. &amp; Miller, T. (2024).</p>
            <p>Sequential confidence intervals for comparing two proportions with variance reduction.</p>
            <p className="italic">Eppo Technical Report.</p>
            <p className="text-sm text-neutral-500 mt-1">
              Eppo&apos;s implementation combining Howard et al.&apos;s confidence sequences with
              generalised CUPED. Estimates variance (does not assume known &sigma;&sup2;).
              <span className="italic"> [Used in Acts 9&ndash;12.]</span>
            </p>
          </li>
        </ol>
      </div>
    </section>
  )
}
