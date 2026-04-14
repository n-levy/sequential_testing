export function Act2() {
  return (
    <section id="act2" className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 2: The Eppo Sequential Testing Solution
          </h2>
          <p className="text-lg text-neutral-600">
            How a modern sequential testing pipeline solves the peeking problem.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="card">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">
              Why sequential CIs?
            </h3>
            <p className="text-neutral-600 mb-4">
              Standard confidence intervals are valid only at a single, preplanned
              analysis. Sequential CIs stay valid at every check, so you can monitor
              safely over time.
            </p>
          </div>
          <div className="card">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">
              Eppo's edge
            </h3>
            <p className="text-neutral-600 mb-4">
              Eppo combines sequential inference with regression adjustment to
              reduce variance and make continuous monitoring practical.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
