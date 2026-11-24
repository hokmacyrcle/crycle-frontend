/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  // Status pills are chosen at run time (cy-pill-<status>), so Tailwind cannot see them in the templates.
  safelist: [{ pattern: /^cy-pill-(draft|awaiting|overdue|paid|void|sent|accepted|declined|expired|invoiced)$/ }],
  theme: {
    extend: {
      colors: {
        // Cyrcle brand guideline (Jan 2026)
        cyrcle: {
          black: '#001219',      // Rich Black
          navy: '#01153E',       // Navy
          royal: '#002366',      // Royal Blue
          midnight: '#005560',   // Midnight Green
          cyan: '#047070',       // Dark Cyan
          sand: '#D6C3A2',       // Grayish Orange
          pearl: '#E6DAC4',      // Seedpearl
          cream: '#E8E3CF',      // Dirty White
          poppy: '#FFC200',      // Golden Poppy (accent / CTA)
          chestnut: '#897C6A',   // Liver Chestnut
          graphite: '#2E2E2E',   // Pearl Black
        },
      },
      fontFamily: {
        // Headings: Archivo Expanded, body/buttons: Archivo Semi-Expanded
        display: ['"Archivo"', 'sans-serif'],
        sans: ['"Archivo"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'cyrcle-metal': 'linear-gradient(135deg, #01153E 0%, #002366 45%, #001219 100%)',
        'cyrcle-teal': 'linear-gradient(135deg, #005560 0%, #047070 60%, #00CDD1 100%)',
      },
      spacing: {
        'safe-b': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}
