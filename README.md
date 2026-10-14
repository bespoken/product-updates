# product-updates

Content source for the Bespoken Dashboard's "Product updates" feed
(the `/updates` page and the notifications bell). Add a post folder here and
list it in `index.json` — no dashboard deploy required. It shows up the next
time someone loads the dashboard.

## Layout

One folder per post, grouped by year. Each post's images live next to it.

```
posts/
  2026/
    2026-09-21-dtmf-validation/
      post.md
    2026-10-02-exploratory-testing/
      post.md
      call-tree.png
index.json
```

The folder name (`2026-10-02-exploratory-testing`) is the post's ID. The
dashboard uses it as the URL and to track which posts each user has read.
**Don't rename a folder once it's published**: its link breaks and the post
can show up as unread again.

## Publishing a new update

1. Create a folder `posts/YYYY/YYYY-MM-DD-slug/` (today's date + a short
   slug, lowercase letters, numbers and dashes), for example:

   `posts/2026/2026-10-02-new-voice-selector/`

2. Add a `post.md` inside it with this frontmatter, then the body in
   Markdown below the `---`:

   ```md
   ---
   title: Short title for the update
   description: One-sentence summary shown in the list and notification bell
   tags: New
   ---

   Full write-up goes here. Standard Markdown — headings, bold, links,
   lists and images all work.

   ![The new voice selector](voice-selector.png)
   ```

   - `title` and `description` are required.
   - `tags` is optional, comma-separated (e.g. `tags: New, Feature`). Known
     tags get a color in the dashboard: `New`, `Feature`, `Improvement`,
     `Fix`. Any other word still works, just shown in a neutral color.

3. Add the post's path to `index.json` at the repo root, for example
   `"posts/2026/2026-10-02-new-voice-selector/post.md"`. Order in the file
   doesn't matter; the dashboard sorts by date.

4. Push to `dev` first and check it on the dev dashboard. When it looks
   right, open a PR to `main`. Once it's on `main`, the update is live.

## Images

- Put the image in the post's folder and use a **relative** path:
  `![Call tree](call-tree.png)`. Don't use full
  `raw.githubusercontent.com/...` URLs: those are tied to one branch, so the
  image breaks or shows the wrong version on the other one.
- **Keep images small.** Git keeps every version of every image forever, so
  a large image makes the repo heavier for good. Resize to about **1600px
  wide** and compress before committing (e.g. [Squoosh](https://squoosh.app)
  or [TinyPNG](https://tinypng.com)). Images over **500 KB** fail the check.
- PNG for screenshots, JPG/WebP for photos.

## Checks

Every push runs `node scripts/validate.mjs` (GitHub Action). It checks that
every `index.json` entry exists and has the right path, that each post has a
`title` and `description`, that every image a post uses exists in its folder,
and that images are under 500 KB. Run it locally before pushing:

```sh
node scripts/validate.mjs
```

## Why this repo is separate

So a new post can go out without anyone needing to touch or deploy the main
dashboard codebase. The dashboard fetches `index.json` and each listed post
from this repo at runtime — nothing here needs a build step.
