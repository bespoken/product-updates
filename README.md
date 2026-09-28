# product-updates

Content source for the Bespoken Dashboard's "Product updates" feed
(the `/updates` page and the notifications bell). Add a `.md` file here and
list it in `index.json` — no dashboard deploy required. It shows up the next
time someone loads the dashboard.

## Publishing a new update

1. Add a file named `YYYY-MM-DD-slug.md` (today's date + a short slug), for
   example:

   `2026-10-02-new-voice-selector.md`

2. Write it with this frontmatter, then the body in Markdown below the `---`:

   ```md
   ---
   title: Short title for the update
   description: One-sentence summary shown in the list and notification bell
   tags: New
   ---

   Full write-up goes here. Standard Markdown — headings, bold, links,
   lists, images all work.
   ```

   - `title` and `description` are required.
   - `tags` is optional, comma-separated (e.g. `tags: New, Feature`). Known
     tags get a color in the dashboard: `New`, `Feature`, `Improvement`,
     `Fix`. Any other word still works, just shown in a neutral color.
   - **Images must be a full URL**, not a local path. Upload the image to
     this repo (e.g. under `media/`) and reference it as
     `https://raw.githubusercontent.com/bespoken/product-updates/main/media/your-image.png`.

3. Add the filename to `index.json` at the repo root (a JSON array of
   filenames — order in the file doesn't matter, the dashboard sorts by the
   date in each filename).

4. Commit and push (or open a PR, if this repo requires review before
   merging to `main`). Once it's on `main`, the update is live — no
   dashboard deploy needed.

## Why this repo is separate

So a new post can go out without anyone needing to touch or deploy the main
dashboard codebase. The dashboard fetches `index.json` and each listed file
from this repo at runtime — nothing here needs a build step.
