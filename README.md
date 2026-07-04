# Barcelona Family Relocation Explorer

Personal decision-support tool for comparing greater-Barcelona areas on price,
rent, school fit, commute to Glovo HQ (Poblenou) and family livability, and
shortlisting 2–3.

## Run

Static site, no build step. Open `index.html` directly (`file://` works), or:

```
python3 -m http.server 4173
```

## Deploy (GitHub Pages)

Push the folder to a repo and enable Pages on the branch root — all paths are
relative, so it works from a subdirectory.

## Data

Everything lives in `js/data.js`, embedded verbatim from the June 2026
research brief (idealista asking averages, editorial ratings and commute
estimates). Update by editing that file — there are no runtime fetches and no
API keys. Out-of-city €/m² figures are editorial estimate ranges
(`SUBURB_PRICE_EST`) flagged with `~` in the UI; verify on idealista.

## Notes

- Shortlist state persists in the URL hash (`#shortlist=sarria,gracia`) —
  shareable, no localStorage.
- Conservative fee basis = top of the primary fee range +30% hidden-cost
  uplift; toggle to optimistic (bottom of range) in the controls bar.
- 5-year cost sketch: buy = price +10% ITP/notary + 5 yrs tuition;
  rent = 60 months + tuition. Not a financial model.
