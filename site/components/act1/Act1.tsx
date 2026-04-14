export function Act1() {
  return (
    <section id="act1" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Act 1: The Problem with Fixed-Horizon Testing
          </h2>
          <p className="text-lg text-neutral-600">
            Why traditional A/B testing wastes time and resources
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">
              The Traditional Approach
            </h3>
            <p className="text-neutral-600 mb-4">
              Fixed-horizon testing requires you to wait for a predetermined sample size,
              even when the results are clear much earlier.
            </p>
            <ul className="text-neutral-600 space-y-2">
              <li>• Waste time on obvious winners/losers</li>
              <li>• Delay important decisions</li>
              <li>• Consume unnecessary resources</li>
            </ul>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">
              The Sequential Solution
            </h3>
            <p className="text-neutral-600 mb-4">
              Sequential testing allows you to stop early when you have enough evidence,
              saving time and resources.
            </p>
            <ul className="text-neutral-600 space-y-2">
              <li>• Stop early when results are clear</li>
              <li>• Make decisions faster</li>
              <li>• Optimize resource usage</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-neutral-600">
            Interactive simulation coming soon...
          </p>
        </div>
      </div>
    </section>
  )
}