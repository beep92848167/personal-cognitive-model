# Recommendation Detail View

The recommendation detail view lets a user inspect why a recommendation was made.

It exposes:

- score;
- confidence;
- supporting signals;
- watch-outs;
- source provenance;
- feedback state;
- learning adjustment;
- explanation graph size.

The UI uses `src/core/recommendation-detail.js` so rendering can be tested independently of the browser.
