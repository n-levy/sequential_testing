export function AppendixDivider() {
  return (
    <section id="appendix" className="py-12 bg-neutral-100 border-t-2 border-neutral-300">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-neutral-900 mb-3">Appendix</h2>
        <p className="text-neutral-700 max-w-2xl mx-auto">
          The sections below are optional deep dives. They cover variance reduction
          (CUPED) and the historical &ldquo;A/B at platform scale&rdquo; problem that
          motivated Eppo&apos;s pipeline. The main argument of the guide does not depend
          on them &mdash; come back when you want the full picture.
        </p>
      </div>
    </section>
  )
}
