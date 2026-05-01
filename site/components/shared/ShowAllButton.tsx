'use client'

export function ShowAllButton() {
  return (
    <div className="flex justify-center py-12 bg-neutral-50">
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent('show-all-content'))}
        className="px-8 py-4 text-base font-semibold bg-blue-600 text-white rounded-lg border border-blue-700 hover:bg-blue-700 active:bg-blue-800 shadow-md transition-colors"
      >
        Show all content
      </button>
    </div>
  )
}
