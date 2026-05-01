export function References() {
  return (
    <section id="references" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">References</h2>

        <ol className="list-decimal list-inside space-y-4 text-neutral-700">
          <li id="ref-deng-2013">
            <strong>Deng, A., Xu, Y., Kohavi, R., &amp; Walker, T.</strong> (2013).
            Improving the sensitivity of online controlled experiments by
            utilizing pre-experiment data.
            <em> Proc. WSDM</em>, 123&ndash;132.
            <span className="text-neutral-500"> &mdash; The original CUPED paper. Variance reduction via pre-experiment covariates.</span>
          </li>
          <li id="ref-howard-2021">
            <strong>Howard, S.R., Ramdas, A., McAuliffe, J., &amp; Sekhon, J.</strong> (2021).
            Time-uniform, nonparametric, nonasymptotic confidence sequences.
            <em> Annals of Statistics</em>, 49(2), 1055&ndash;1080.
            <span className="text-neutral-500"> &mdash; The confidence sequence framework that Eppo adopted.</span>
          </li>
          <li id="ref-pocock-1977">
            <strong>Pocock, S.J.</strong> (1977).
            Group sequential methods in the design and analysis of clinical trials.
            <em> Biometrika</em>, 64(2), 191&ndash;199.
          </li>
          <li id="ref-obrien-fleming-1979">
            <strong>O&apos;Brien, P.C. &amp; Fleming, T.R.</strong> (1979).
            A multiple testing procedure for clinical trials.
            <em> Biometrics</em>, 35(3), 549&ndash;556.
          </li>
          <li id="ref-schmit-miller-2022">
            <strong>Schmit, M. &amp; Miller, T.</strong> (2022).
            Sequential confidence intervals for comparing two proportions with
            variance reduction.
            <em> Eppo Technical Report</em>.
            <span className="text-neutral-500"> &mdash; Eppo&apos;s implementation combining Howard et al.&apos;s confidence sequences with generalised CUPED.</span>
          </li>
        </ol>
      </div>
    </section>
  )
}
