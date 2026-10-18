# Where were the gods born?

A geography of Greek myth: a downloadable illustrated poster and a companion interactive atlas.

- [View the poster](https://khayoon.github.io/greek-gods-atlas/)
- [Download the full-resolution PNG](https://khayoon.github.io/greek-gods-atlas/greek-gods-birthplaces.png)
- [Explore the interactive atlas](https://khayoon.github.io/greek-gods-atlas/atlas/)

The expanded roster contains 34 divine figures across 25 story entries. The nine Muses and the Dioscuri are grouped. Heracles is included as a deified hero. Birth traditions, rival local claims, regional settings, arrivals, and infancy stories are distinguished. Locations are approximate aids to reading; they are not historical birth records. Ancient place names without secure modern locations remain uncertain.

## Files

- `docs/index.html`: poster page.
- `docs/greek-gods-birthplaces.png`: 3200 × 4000 poster.
- `docs/atlas/`: buildless interactive atlas; deity data and citations are in `data/gods.js`.
- `scripts/render-poster.py`: poster rendering source, using Pillow and bundled map/font assets.

## Run locally

From the repository root:

```sh
python -m http.server 8765 --directory docs
```

Open `http://localhost:8765/`. No build or external service is required. GitHub Pages serves `docs/` from `main`.

To regenerate the poster on Windows, install Pillow and run `python scripts/render-poster.py`. The renderer uses the bundled Gentium Plus font and the system Segoe UI font.

## Sources and credits

Each atlas entry links to its ancient account, primarily through [Theoi](https://www.theoi.com/) and [LacusCurtius](https://penelope.uchicago.edu/Thayer/E/Roman/home.html). The poster retains its source key inside the image. The project preserves competing traditions rather than assigning a single canonical birthplace to every god.

Coastlines are [Natural Earth](https://www.naturalearthdata.com/) 1:50m public-domain land data. Modern coastlines orient the reader; modern political borders are omitted. D3 uses the ISC license. Gentium Plus uses the SIL Open Font License. Their license files are retained in `docs/atlas/vendor/`.
