# Sequential Testing Interactive Website

An interactive single-page web application explaining EPPO's sequential testing for A/B experiments.

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom color palette
- **Math Rendering:** KaTeX
- **Data Visualization:** D3.js
- **Animations:** Framer Motion
- **Deployment:** Vercel

## Project Structure

```
site/
├── app/                    # Next.js app router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── act1/             # Act 1 components
│   ├── act2/             # Act 2 components
│   ├── act3/             # Act 3 components
│   ├── ui/               # Shared UI components
│   └── layout/           # Layout components
└── lib/                  # Utilities and math functions
    └── math/             # Statistical computations
```

## Development

```bash
cd site
npm install
npm run dev
```

## Implementation Plan

Based on `/plan/short_version/implementation_plan.md`:

- **Phase 0:** ✅ Project scaffold (this)
- **Phase 1:** Static content pages
- **Phase 2:** Math engine
- **Phase 3:** Act 1 simulation
- **Phase 4:** Act 2 simulation
- **Phase 5:** Act 3 simulation
- **Phase 6:** Polish and optimization
- **Phase 7:** Deploy

## Color Palette

- **Primary:** Blue tones for main content
- **Secondary:** Yellow tones for highlights
- **Accent:** Purple tones for interactive elements
- **Neutral:** Gray tones for text and backgrounds