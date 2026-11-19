# Blog and changelog

How to publish on [wolfstar.rocks/blog](https://wolfstar.rocks/blog) and
[wolfstar.rocks/changelog](https://wolfstar.rocks/changelog): write a post, add a changelog entry, and make
their images. It is for whoever looks after the blog. You need this repository checked out and `pnpm install`
done. Everything else is a Markdown file and a pull request.

## A post or a changelog entry

Both are Markdown files under `content/`. They answer different questions, and one release often gets both.

|                 | Changelog entry                                             | Post                                                |
| --------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| It says         | what changed                                                | why it changed, or where the project is going       |
| Length          | a few lines                                                 | as long as the story needs                          |
| File            | `content/changelog/<slug>.md`                               | `content/blog/<slug>.md`                            |
| Where it shows  | on `/changelog`, and among the latest at the top of `/blog` | its own page, `/blog/<slug>`, and a card on `/blog` |
| Needs a picture | no                                                          | a cover, see [Images](#images)                      |

The words follow the same rules as the rest of the site: [`COPY.md`](../COPY.md) for the voice and the claims
that may be made, [`GLOSSARY.md`](../GLOSSARY.md) for what things are called ("server", never "guild").

## Write a post

1. Create `content/blog/<slug>.md`. The file name is the address: `wolfstar-v7-alpha.md` is
   `/blog/wolfstar-v7-alpha`. Use lower-case letters, digits and hyphens, and do not rename the file once the
   post is public, because its links would stop working.
2. Start the file with the frontmatter, then write the post in Markdown under it.

    ```md
    ---
    title: WolfStar v7 alpha
    description: The v7 alpha is live with notes, multiple auto-moderation rules, a honeypot channel, and settings export and import.
    date: 2026-10-12
    category: Release
    image: /assets/blog/wolfstar-v7-alpha.png
    authors:
        - name: RedStar
          to: https://x.com/redstar071
          avatar:
              src: https://github.com/RedStar071.png
    ---

    The WolfStar v7 alpha is live.

    ## What's new
    ```

3. Run `pnpm dev` and open `http://localhost:3000/blog/<slug>`. The page reloads when you save the file.
4. Make the cover: `pnpm blog:cover <slug>`, then add the `image` line it prints. [Images](#images) has the
   details.
5. Open a pull request titled `docs(blog): <what the post is>`, in lower case. The post is public when the
   pull request is merged and deployed.

### The fields of a post

| Field         | Required | What it does                                                                                                 |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| `title`       | yes      | The heading of the post, of its card and of its cover.                                                       |
| `description` | yes      | One sentence. It is under the title, on the card (two lines at most), in search results and in the RSS feed. |
| `date`        | yes      | The day it is published, as `2026-10-12`. Posts are listed newest first.                                     |
| `category`    | yes      | `Release`, `Announcement`, `Tutorial` or `Article`, written exactly so. See below.                           |
| `authors`     | yes      | One or more. `name` is required. `to` links the name, `avatar.src` is the picture next to it.                |
| `image`       | no       | The cover, as a path under `public/`: `/assets/blog/<slug>.jpg`.                                             |
| `draft`       | no       | `true` keeps the post out of the list, the feed and the links between posts.                                 |
| `tags`        | no       | A list of words. Nothing on the site shows them today.                                                       |

An author can also carry `twitter`, their handle on X without the `@`. When a reader shares the post on X, the
text credits that handle.

The category decides which link above the list of posts leads to the post:

| Category       | Use it for                                                   |
| -------------- | ------------------------------------------------------------ |
| `Release`      | A version of WolfStar, Staryl or the dashboard that shipped. |
| `Announcement` | A plan, a decision, or news about the project.               |
| `Tutorial`     | How to do something with the bots or the dashboard.          |
| `Article`      | Anything else: how something was built, a look back.         |

A category gets its link once a post uses it, so an unused one is not shown.

The reading time ("3 min read") is counted from the text when the site is built. Do not write it.

A wrong value does not pass silently. `pnpm dev` prints an error that names the file and the field, for
example ``content/blog/my-post.md: `category` must be one of: Release, Announcement, Tutorial, Article.``,
and the build of the pull request stops on it.

### The body

Write the sections with `##` and `###`. The title is already the page's only `#` heading. A post with two
sections or more gets a table of contents beside the text on wide screens.

Two blocks are available besides plain Markdown:

```md
::note
A remark that stands apart from the text.
::

::card{type="warning"}
**This is an alpha.** Do not rely on it for critical moderation.
::
```

A card's `type` is `info`, `warning`, `danger` or `success`.

### Drafts

With `draft: true`, the post is in no list and no feed. Its page still opens under `pnpm dev`, at
`/blog/<slug>`, so you can read it while you write. A deployed site answers "not found" for it. Remove the
line to publish.

There is no scheduling: a post without `draft: true` is public as soon as it is deployed, whatever its `date`.

## Write a changelog entry

1. Create `content/changelog/<slug>.md`.

    ```md
    ---
    title: 'Fixed a false "session not found" error'
    description: The OAuth callback page could briefly claim your session was missing even though sign-in had just succeeded.
    date: 2026-08-24
    kind: fixed
    ---

    Sessions are read from an eventually-consistent store, so the callback page could race the write. It now
    retries with backoff instead of giving up.
    ```

2. Run `pnpm dev` and look at `http://localhost:3000/changelog` and at the top of `http://localhost:3000/blog`.
3. Open a pull request titled `docs(blog): <what changed>`.

| Field         | Required | What it does                                                                         |
| ------------- | -------- | ------------------------------------------------------------------------------------ |
| `title`       | yes      | What changed, in a few words.                                                        |
| `description` | yes      | One sentence. It is the text of the entry at the top of `/blog` and in the RSS feed. |
| `date`        | yes      | The day it shipped, as `2026-08-24`. Entries are listed newest first.                |
| `kind`        | yes      | `new`, `improved` or `fixed`, in lower case. It becomes the entry's badge.           |
| `image`       | no       | A screenshot of the change, shown under the title. Not a cover with the title on it. |
| `authors`     | no       | Who made the change, written as for a post.                                          |

An entry has no page of its own. It lives on `/changelog`, and its address is the page plus the file name:
`homepage-redesign.md` is `/changelog#homepage-redesign`. The eight most recent entries are also the timeline at
the top of `/blog`.

When a post tells the story of the same change, link it from the entry's text with an ordinary Markdown link,
as `content/changelog/rocks-v2.md` does.

## Images

Every image of the blog is under `public/assets/blog/`, and is written in Markdown and in frontmatter without
`public`: the file `public/assets/blog/my-post.jpg` is `/assets/blog/my-post.jpg`.

### The cover of a post

The cover is used twice: as the picture of the post's card on `/blog`, and as the preview a link to the post
gets on Discord, X and other sites. That is why it carries the title.

Draw it from the post's own frontmatter:

```bash
pnpm blog:cover wolfstar-v7-alpha
```

```text
Wrote public/assets/blog/wolfstar-v7-alpha.jpg (1600×840, 95 KB).
The post's frontmatter needs this line:

image: /assets/blog/wolfstar-v7-alpha.jpg
```

The command reads `title`, `description` and `category`, and draws them on the site's dark background with
the WolfStar mark. A long title gets smaller letters and is cut after two lines, so look at the picture
before you commit it. After changing the title or the description, draw it again with `--force`:

```bash
pnpm blog:cover wolfstar-v7-alpha --force
```

You can also make a cover by hand, for example to show a screenshot or numbers as
`public/assets/blog/wolfstar-v7-alpha.png` does. Keep to these:

| What      | Value                                                                                              |
| --------- | -------------------------------------------------------------------------------------------------- |
| Size      | 1600 × 840 px, or 2400 × 1260 px. Other sizes are cropped to fit.                                  |
| Safe area | Keep text 90 px or more from the left and right edges. The card on `/blog` is 16:9 and crops them. |
| Format    | JPEG or PNG. Some sites do not show a WebP preview.                                                |
| Weight    | 300 KB at most. A link preview downloads the file as it is.                                        |
| File name | The post's file name: `public/assets/blog/<slug>.jpg`.                                             |

A dark gradient saved as PNG is heavy: the two covers that weighed 3.6 MB each are about 130 KB as JPEG, with no
visible difference.

A post without `image` still works. Its card has no picture, and its link preview is drawn automatically from
the title, the date and the authors.

### Images inside a post

Put them in a folder named after the post, and reference them with a description of what they show:

```md
![The honeypot warning in a Discord channel](/assets/blog/wolfstar-v7-alpha/honeypot-warning.png)
```

The text column is 768 px wide, so 1536 px is as wide as an image needs to be. The reader downloads the file
as it is: keep each one under 300 KB, as PNG for screenshots and JPEG for photos. Give a screenshot an opaque
background, because the site has a light and a dark theme and a transparent one is unreadable on one of them.
A click on the image opens it larger.

## Where it is in the code

| What                                                    | Where                                                             |
| ------------------------------------------------------- | ----------------------------------------------------------------- |
| The fields and their allowed values                     | `content.config.ts`, `shared/utils/blog.ts`                       |
| The frontmatter check and the reading time              | `modules/blog-content.ts`, `config/blog-content.ts`               |
| The pages                                               | `app/pages/(marketing)/blog/`, `app/pages/(marketing)/changelog/` |
| The RSS feeds, `/blog/rss.xml` and `/changelog/rss.xml` | `server/routes/blog/`, `server/routes/changelog/`                 |
| The cover                                               | `scripts/blog-cover.ts`                                           |

To add a category, add it to `BLOG_CATEGORIES` in `shared/utils/blog.ts`, give it its two labels
(`blog.category.*` and `blog.categories.*` in `i18n/locales/en/common.json`, read in
`app/composables/useBlog.ts`), then run `pnpm i18n:check:fix` and `pnpm vp run i18n:schema`.
