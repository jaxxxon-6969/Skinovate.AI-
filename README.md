# Skinovate hero page

React + TypeScript + Vite implementation of the supplied Skinovate hero artwork, with restrained looping scan/mesh/ambient effects and responsive scaling.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Source artwork

`public/skinovate-hero-reference.jpg` is the supplied Skinovate hero artwork used as the visual base. The artwork contains its original typography, portrait, logo, scenery and button graphics. CSS adds the scan beam, pulsing mesh highlights, ambient motion and hover hit areas.

## Notes on fidelity

The uploaded video is a flattened video reference, not the original editable design file. The project preserves the supplied hero artwork and overlays CSS effects. The scan/mesh clipping and responsive hit areas may need small coordinate adjustments against the final browser viewport. The flower/cloud effects are subtle ambient overlays rather than independent cut-out layers because the source artwork is flattened.
