export function Hero() {
  return (
    <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
          Sequential Testing in A/B Experiments
        </h1>
        <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
          An interactive guide to modern sequential testing methods, featuring EPPO's approach
          and practical implementations for data scientists and experimenters.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-primary">
            Start Learning
          </button>
          <button className="btn-secondary">
            View Simulations
          </button>
        </div>
      </div>
    </section>
  )
}