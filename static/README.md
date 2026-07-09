# Symbiosys Static Site

This folder contains a **static HTML/CSS/JavaScript** version of the Symbiosys React app. The original React project in the parent directory is **unchanged**.

## Structure

```
static/
├── index.html          # Home page (hero, services, about, clients, testimonials, contact)
├── about.html          # About page with HLS video backgrounds
├── contact.html        # Contact page with globe video overlay
├── css/
│   ├── styles.css      # Full design system (ported from src/index.css)
│   └── animations.css  # CSS animations replacing framer-motion
├── js/
│   ├── app.js          # Lenis smooth scroll, navigation, scroll reveals
│   ├── three-canvas.js # Three.js HeroCanvas & ParticlesCanvas
│   ├── neural-network.js # Three.js neural network scene (replaces React Three Fiber)
│   ├── carousel.js     # Hero & testimonial carousels, about email form
│   ├── hls-video.js    # HLS video playback
│   ├── home.js         # Home page initialization
│   ├── about.js        # About page initialization
│   └── contact.js      # Contact page initialization
└── assets/
    └── symbiosys-logo.svg
```

## Features Ported

- **Three.js**: Scroll-driven icosahedron canvas, particle fields, neural network with stars & orbit controls
- **Animations**: Hero carousel, testimonial carousel, client marquee, scroll reveals, parallax, floating badges
- **HLS Videos**: Mux background videos on About and Contact pages
- **Lenis**: Smooth scrolling
- **Lucide Icons**: All icons via CDN
- **Layout & Colors**: Identical CSS utility classes and design tokens

## Running Locally

Static files must be served over HTTP (ES modules require it):

```bash
# Option 1: Python
cd static
python -m http.server 8080

# Option 2: npx serve
npx serve static -p 8080
```

Then open http://localhost:8080

## Assets

Place your logo at `static/assets/symbiosys-logo.png` to match the React app exactly. An SVG fallback is included.

For the contact page world map, add `static/assets/map.png` or the Wikimedia fallback will be used.

## CSS Architecture

- **Bootstrap 5.3.8** (CDN) — Base reset; kept for parity with the React app
- **bootstrap-compat.css** — Prevents Bootstrap from overriding Symbiosys buttons, forms, and layout
- **styles.css** — Full design system from `src/index.css`, including the Tailwind utility shim
- **animations.css** — Carousel, marquee, scroll reveal, and mobile menu animations

To restore layout after edits, run:

```bash
node scripts/restore-layout.mjs
node scripts/fix-remaining.mjs
node scripts/polish-html.mjs
```

## Dependencies (CDN)
- Three.js 0.185.0
- Lenis 1.3.25
- HLS.js 1.6.16
- Lucide Icons
- Google Fonts (Inter, Space Grotesk, Instrument Serif)
