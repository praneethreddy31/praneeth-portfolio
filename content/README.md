# Content Guide

This portfolio uses git-backed content files so routine updates do not require React or route changes.

## Directory layout

- `content/site/home.json`: hero copy, about paragraphs, Spotify playlists, and books
- `content/site/projects.json`: project section headings and project cards
- `content/site/reach-out.json`: bottom work-page contact funnels and CTAs
- `content/site/tech-stack.json`: tech stack section copy and ordered tool list
- `content/site/work-experience.json`: work experience section heading and entries
- `content/site/navigation.json`: primary navigation items
- `content/site/social-links.json`: reusable outbound profile links

## Project fields

Every project entry requires:

- `id`
- `slug`
- `title`
- `summary`
- `description`
- `tech`
- `featured`
- `published`
- `sortOrder`
- `year`
- `role`
- `status`

`githubUrl`, `liveUrl`, and `image` are optional.

## Reach out fields

Every reach-out lane requires:

- `id`
- `label`
- `title`
- `description`
- `actions`

`options` is optional and works well for playful secondary prompts.

## Tech stack fields

Every tech stack item requires:

- `id`
- `label`
- `group`
- `sortOrder`

`accent` is optional and gives important tools a stronger visual treatment.

## Work experience fields

Every work experience entry requires:

- `id`
- `role`
- `company`
- `periodLabel`
- `startDate`
- `summary`
- `highlights`
- `links`
- `published`
- `sortOrder`

`endDate` and `location` are optional.

## Publishing and sorting

- Hidden items are kept in the repo by setting `published: false`
- Projects are ordered by `featured` first and then `sortOrder`
- Work experience entries are ordered by `sortOrder` and then `startDate`
- Navigation items render only when `visible: true`

## Common edits

### Add a new project

1. Open `content/site/projects.json`
2. Add a new object to `items`
3. Set a unique `id` and `slug`
4. Keep `published: false` until you want it visible

### Add a new job

1. Open `content/site/work-experience.json`
2. Add a new object to `items`
3. Set a unique `id`
4. Use `sortOrder` to position it

## Validation rules

- IDs and slugs must be unique
- Dates must use sortable `YYYY-MM-DD`
- External links must be valid URLs
- Invalid content fails during loading and tests
