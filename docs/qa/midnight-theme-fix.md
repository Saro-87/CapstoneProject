# Midnight loading appearance fix

The screenshots exposed two inherited styles: the global `--text-h` depended on the system color preference, and `html, body, #root` had a fixed `height: 100%`. On light systems this made metric headings dark and exposed a white root canvas below the first viewport.

The live Midnight stylesheet now defines its heading color on the Midnight body, applies the dark root canvas, and lets the body and React root grow with the document. The body theme class is applied in a layout effect before the first paint.

Verification:

- Built application and six frontend data tests passed.
- A temporary browser fixture forced the original light globals (`--text-h: #08060d` and white root background). The metric color remained `rgb(237, 242, 255)`, savings remained mint, and the root stayed `rgb(10, 16, 29)`.
- Desktop document: body covered the full approximately 4,178-pixel document.
- Mobile at 390 pixels: body covered the full approximately 6,371-pixel document; no horizontal page overflow.
- The temporary fixture was removed after verification. Native operating-system preferences were not changed.

Screenshots: [readable metrics](midnight-metrics-fixed.jpg), [continuous lower-page background](midnight-background-fixed.jpg).

Only the live Midnight appearance and theme timing changed. Backend behavior and the earlier production-readiness findings are unchanged.
