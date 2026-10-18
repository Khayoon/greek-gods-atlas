# Where were the gods born?

A geography of Greek myth: a downloadable illustrated poster and a companion interactive atlas.

- [View the poster](https://khayoon.github.io/greek-gods-atlas/)
- [Download the full-resolution PNG](https://khayoon.github.io/greek-gods-atlas/greek-gods-birthplaces.png)
- [Explore the interactive atlas](https://khayoon.github.io/greek-gods-atlas/atlas/)

The expanded roster contains 34 divine figures across 25 story entries. The nine Muses and the Dioscuri are grouped. Heracles is included as a deified hero. Birth traditions, rival local claims, regional settings, arrivals, and infancy stories are distinguished. Locations are approximate aids to reading; they are not historical birth records. Ancient place names without secure modern locations remain uncertain.

Athena’s Lake Tritonis tradition appears in a North African coastal inset without an asserted lake coordinate. Ancient Libya is a broad geographic term here. The note connects her epithet Tritogeneia to the Triton waters as a traditional explanation. Zeus’s Messenian tradition is plotted at Mount Ithome with the infancy symbol: Pausanias 4.33.1 describes nursing by Ithome and Neda and bathing at the Klepsydra spring, rather than explicitly locating his birth there.

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

Coastlines use the original full-resolution level-1 polygons from [GSHHG 2.3.7](https://www.soest.hawaii.edu/wessel/gshhg/), by Paul Wessel and Walter H. F. Smith. The regional extract is clipped to 17–37° E and 30–44° N without simplifying the coastal vertices. It retains 209,652 original coastal vertices and 3,088 land polygons. GSHHG is distributed under the GNU Lesser General Public License v3 or earlier; its license and provenance are retained in `docs/atlas/data/`. Modern coastlines orient the reader; modern political borders are omitted. D3 uses the ISC license. Gentium Plus uses the SIL Open Font License. Their license files are retained in `docs/atlas/vendor/`.

The North African context inset uses an additional unsimplified GSHHG extract (3–29° E, 28–42° N), containing 211,275 original coastal vertices and 2,892 land polygons. It shows modern coastlines for orientation, not a reconstructed ancient lake.
