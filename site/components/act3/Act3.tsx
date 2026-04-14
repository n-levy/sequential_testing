export function Act3() {
  return (
    <section id="act3" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 3: DIY Options When You Don’t Have Eppo
          </h2>
          <p className="text-lg text-neutral-600">
            Practical alternative methods for teams without a sequential testing platform.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="card">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">
              Bonferroni
            </h3>
            <p className="text-neutral-600">
              The simplest safe correction for pre-planned multiple looks.
            </p>
          </div>
          <div className="card">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">
              Pocock
            </h3>
            <p className="text-neutral-600">
              A tighter group-sequential boundary for repeated analyses.
            </p>
          </div>
          <div className="card">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">
              O'Brien--Fleming
            </h3>
            <p className="text-neutral-600">
              A highly efficient method that preserves most final-stage power.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
