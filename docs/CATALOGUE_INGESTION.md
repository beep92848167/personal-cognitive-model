# Catalogue Ingestion

V2 Discover uses `src/core/catalogue.js` to ingest the Personal Cognitive Model media catalogue.

## Inputs

The catalogue reads from the PCM seed:

- `media.television`
- `media.movies`
- `media.novels`
- `media.games`
- `media.documentaries`
- `media.comedy`
- `media.integrated_m2m`
- `knowledge.recommendations.current`

## Guarantees

- candidates are deduplicated by normalized title;
- source provenance is preserved in `sources`;
- known negative/bounced items can remain in the catalogue but are excluded from Discover candidates;
- Discover continues to receive transparent source labels.
