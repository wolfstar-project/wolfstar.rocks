<div align="center"><a name="readme-top"></a>

<img src="https://github.com/WolfStarBot.png" width="15%" alt="WolfStar Logo">

# WolfStar.rocks

The official web dashboard for WolfStar, a powerful multi-purpose Discord
bot.<br/>

[Official Site][official-site] · [Blog][blog] · [WolfStar Invite
Link][invite-link] · [Support Server][discord-link] ·
[Feedback][github-issues-link]

<!-- SHIELD GROUP -->

[![Netlify deploy status badge][netlify-status-shield]][netlify-status-link]
[![GitHub latest release badge][github-release-shield]][github-release-link]
[![GitHub release date badge][github-releasedate-shield]][github-releasedate-link]<br/>
[![Discord community badge][discord-shield]][discord-link]
[![Codecov coverage badge][codecov-shield]][codecov-link]
[![GitHub contributors badge][github-contributors-shield]][github-contributors-link]<br/>
[![GitHub forks badge][github-forks-shield]][github-forks-link]
[![GitHub stars badge][github-stars-shield]][github-stars-link]
[![GitHub issues badge][github-issues-shield]][github-issues-link]
[![GitHub license badge][github-license-shield]][github-license-link]<br>
[![PRs welcome badge][pr-welcome-shield]][pr-welcome-link]
[![Codspeed badge][codspeed-shield]][codspeed-link]

### Share WolfStar Repository

[![][share-linkedin-shield]][share-linkedin-link]
[![][share-reddit-shield]][share-reddit-link]
[![][share-telegram-shield]][share-telegram-link]
[![][share-whatsapp-shield]][share-whatsapp-link]
[![][share-x-shield]][share-x-link] <sup>Pioneering the new age of server
moderation management. Built for you, the Super Admin.</sup>

</div>

<details>
<summary><kbd>Table of contents</kbd></summary>

## Table of Contents

- [✨ Features](#-features)
- [🛳 Self-Hosting WolfStar.rocks](#-self-hosting-wolfstarrocks)
- [🚀 Self-Hosting WolfStar.rocks Requirements](#-self-hosting-wolfstarrocks-requirements)
- [⌨️ Local Development](#️-local-development)
- [💻 Online Development](#-online-development)
- [🤝 Contributing](#-contributing)
- [❤️ Sponsor](#️-sponsor)

<br/>

</details>

<div id="-welcome-to-wolfstarrocks">

## 👋🏻 Welcome to WolfStar.rocks

WolfStar.rocks is the official web dashboard for WolfStar, a powerful
multi-purpose Discord bot for moderation and community management.

</div>

<div id="-features">

## ✨ Features

- **Modern Web Interface**: Built with Nuxt 4 and modern web technologies for a
  smooth user experience.
- **Guild Management**: Manage your Discord server's settings, roles, and
  permissions through an intuitive web interface.
- **Real-time Updates**: Live updates for guild data and bot status.
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
  devices.
- **OAuth Integration**: Secure Discord authentication and authorization.
- **Audit Trail**: All security-relevant actions (guild settings changes,
  logins, token refreshes, and OAuth CSRF denials) are captured via a
  tamper-evident audit log. Each event is persisted to PostgreSQL with a SHA-256
  hash chain, making the audit trail verifiable and tamper-evident.
- **Multi-language Support**: Support for multiple languages (coming soon).
- **Dashboard Analytics**: View server statistics and bot usage metrics.

</div>

<div id="-self-hosting-wolfstarrocks-requirements">

## 🚀 Self-Hosting WolfStar.rocks Requirements

- **Node.js**: WolfStar.rocks is built on Node.js, so you will need to have
  Node.js (v24+) installed.
- **WolfStar Bot**: You need a running instance of WolfStar bot to connect this
  dashboard to.
- **Discord Bot Application**: A Discord bot application with proper OAuth2
  configuration.
- **PostgreSQL**: PostgreSQL database (shared with WolfStar bot instance).

</div>

<div id="-self-hosting-wolfstarrocks">

## 🛳 Self-Hosting WolfStar.rocks

### Quick Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/wolfstar-project/wolfstar.rocks.git
   cd wolfstar.rocks
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Configuration**
   - Duplicate `.env.example` and rename it to `.env`.
   - Fill in all required environment variables.
   - Configure Discord OAuth2 settings in your Discord Developer Portal.

4. **Database Setup**
   - Ensure your WolfStar bot database is accessible.
   - Run database migrations if needed.

5. **Start the development server**

   ```bash
   pnpm dev
   ```

### Environment Variables

1. Duplicate `.env.example` and rename it to `.env`.
2. Fill in all required environment variables.
3. Configure Discord OAuth2 settings in your Discord Developer Portal.

### Discord OAuth2 Configuration

1. Go to the
   [Discord Developer Portal](https://discord.com/developers/applications/).
2. Select your bot application.
3. Navigate to the **OAuth2** tab.
4. Add redirect URLs:
   - `http://localhost:3000/oauth/callback`
   - `http://localhost:3000/oauth/guild`
5. Save your changes.

### Available Scripts

- `pnpm dev` - Start development server.
- `pnpm dev:pwa` - Start development server with PWA support.
- `pnpm build` - Build for production.
- `pnpm preview` - Preview production build.
- `pnpm lint` - Run Oxlint & Oxfmt.
- `pnpm lint:fix` - Run Oxlint & Oxfmt and fix issues.
- `pnpm prisma:migrate:dev` - Create and apply a new migration in development.
- `pnpm prisma:migrate:dev:create` - Create a new migration in development.
- `pnpm prisma:migrate:diff` - Check for schema drift between migrations and
  schema (exits with error if differences found).
- `pnpm prisma:migrate:deploy` - Apply all pending migrations to the database.
- `pnpm prisma:migrate:status` - Check the status of migrations.
- `pnpm prisma:migrate:resolve` - Mark a migration as applied or rolled back.
- `pnpm prisma:push` - Push the Prisma schema to the database without generating
  a migration.
- `pnpm prisma:seed` - Seed the database with initial data.
- `pnpm prisma:studio` - Open Prisma Studio for database management.
- `pnpm prisma:generate` - Generate Prisma client.
- `pnpm prisma:generate:watch` - Watch for changes and regenerate Prisma client.
- `pnpm generate-pwa-icons` - Generate PWA icons and assets.
- `pnpm test` - Run all tests.
- `pnpm test:unit` - Run unit tests.
- `pnpm test:nuxt` - Run Nuxt environment tests.
- `pnpm test:browser` - Run browser tests with Playwright.
- `pnpm test:bench` - Run performance benchmarks.
- `pnpm typecheck` - Run TypeScript checks.

### Testing & Benchmarks

#### Running Tests

- `pnpm test` - Run all tests with Vitest
- `pnpm test:unit` - Run unit tests only (Node.js environment)
- `pnpm test:nuxt` - Run Nuxt component tests (Nuxt environment with browser)
- `pnpm test:browser` - Run full browser E2E tests with Playwright
- `pnpm test:bench` - Run performance benchmarks

#### Performance Benchmarks

WolfStar.rocks uses [CodSpeed](https://codspeed.io) for continuous performance
tracking. Benchmarks automatically run in CI on every commit and PR, with
results visible on the [CodSpeed dashboard][codspeed-link].

**Currently Benchmarked:**

- **`shared/utils/comparators.ts`**
  - Functions: `differenceArray`, `differenceMap`
  - Benchmark: `test/unit/shared/utils/comparators.bench.ts`
- **`server/utils/guildNameToAcronym.ts`**
  - Function: `guildNameToAcronym`
  - Benchmark: `test/unit/server/utils/guild-name-to-acronym.bench.ts`

**Adding New Benchmarks:**

1. Create a `.bench.ts` file under `test/unit/` mirroring the path of the code
   you're benchmarking (e.g., for `shared/utils/myUtil.ts`, create
   `test/unit/shared/utils/myUtil.bench.ts`)
2. Import the utility and Vitest's `bench()` function:
   ```typescript
   import { bench, describe } from "vitest";
   import { myUtility } from "../../../../shared/utils/myUtility";
   ```
3. Write benchmarks with descriptive names:
   ```typescript
   describe("myUtility benchmarks", () => {
     bench("small dataset (10 items)", () => {
       myUtility(smallData);
     });
     bench("large dataset (1000 items)", () => {
       myUtility(largeData);
     });
   });
   ```
4. Run locally: `pnpm test:bench`
5. CI will automatically track performance when you open a PR

### Development Guidelines

- Follow the existing code style and conventions.
- Write clear, descriptive commit messages.
- Add tests for new features.
- Update documentation as needed.
- Ensure all CI checks pass.

### Development Tools

- **Nuxt 4** - Vue.js framework
- **TypeScript** - Type safety
- **Oxlint** - Code linting
- **Oxfmt** - Code formatting
- **Prisma** - Database ORM
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Tailwind CSS component library
- **NuxtUI** - Components

### AI Development Assistant

- **Custom GitHub Copilot Agent** - Specialized WolfStar development agent with
  Context7 MCP integration (see `.github/agents/wolfstar-dev-agent.md`).
- **Autonomous Problem-Solving** - Beast Mode with iterative refinement.
- **Real-time Documentation** - Up-to-date library docs via Context7.
- **Quality First** - Integrated Oxlint, Sentry, and testing workflows.

</div>

<div id="️-local-development">

## ⌨️ Local Development

Refer to [CONTRIBUTING.md][contributing-link] for detailed setup instructions.

</div>

<div id="-online-development">

## 💻 Online Development

Click any of the buttons below to start a new development environment to demo or
contribute to the codebase without having to install anything on your machine:

<div align="center">

[![Open in VS Code](https://img.shields.io/badge/Open%20in-VS%20Code-blue?logo=visualstudiocode)](https://vscode.dev/github/wolfstar-project/wolfstar.rocks)
[![Open in GitHub1s](https://img.shields.io/badge/Open%20in-GitHub1s-blue?logo=github)](https://github1s.com/wolfstar-project/wolfstar.rocks)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/wolfstar-project/wolfstar.rocks)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/wolfstar-project/wolfstar.rocks)
[![Edit in Codesandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/wolfstar-project/wolfstar.rocks)
[![Open in Codeanywhere](https://codeanywhere.com/img/open-in-codeanywhere-btn.svg)](https://app.codeanywhere.com/#https://github.com/wolfstar-project/wolfstar.rocks)
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/wolfstar-project/wolfstar.rocks)

</div>

</div>

<div id="️-contributing">

## 🤝 Contributing

Thank you to all the people who already contributed to WolfStar.rocks! Please
make sure to read the [Contributing Guide][contributing-link] before making a
pull request.

<a href="https://github.com/wolfstar-project/wolfstar.rocks/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=wolfstar-project/wolfstar.rocks" alt="Project contributors" />
</a>

</div>

<div id="️-sponsor">

## ❤️ Sponsor

If you like WolfStar and want to support the project, consider making a
donation. Every contribution helps to maintain and improve the bot.

[![Support on Ko-fi](https://img.shields.io/badge/Support%20on%20Ko--fi-ff5e5b?style=for-the-badge&logo=ko-fi&logoColor=white)][ko-fi-link]
[![Support on Patreon](https://img.shields.io/badge/Support%20on%20Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)][patreon-link]
[![Sponsor on GitHub](https://img.shields.io/badge/Sponsor%20on%20GitHub-ffcb47?style=for-the-badge&logo=github&logoColor=white)][github-sponsor-link]

Thank you for your support!

</div>

<!-- LINK GROUP -->

---

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

---

<summary><h4>📝 License</h4>

Copyright © 2024 [WolfStar][profile-link]. <br /> This project is
[Apache 2.0](./LICENSE) licensed.

<!-- LINK GROUP -->

[ko-fi-link]: https://ko-fi.com/redstar071
[patreon-link]: https://www.patreon.com/RedStar071
[github-sponsor-link]: https://github.com/sponsors/wolfstar-project
[wolfstar-invite-link]: https://invite.wolfstar.rocks
[server-invite-link]: https://join.wolfstar.rocks
[discord-embed-image]:
  https://discord.com/api/guilds/830481105261821952/embed.png
[glitch]: https://glitch.com
[heroku]: https://heroku.com
[back-to-top]:
  https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square
[commit-check-link]:
  https://github.com/wolfstar-project/wolfstar.rocks/actions/workflows/commit-check.yml
[commit-check-shield]:
  https://github.com/wolfstar-project/wolfstar.rocks/actions/workflows/commit-check.yml/badge.svg
[blog]: https://blog.wolfstar.rocks
[contributing-link]:
  https://github.com/wolfstar-project/.github/blob/main/.github/CONTRIBUTING.md
[codecov-link]: https://codecov.io/gh/wolfstar-project/wolfstar.rocks
[codecov-shield]:
  https://img.shields.io/codecov/c/github/wolfstar-project/wolfstar.rocks?labelColor=black&style=flat-square&logo=codecov&logoColor=white
[codespaces-link]: https://codespaces.new/wolfstar-project/wolfstar.rocks
[codespaces-shield]: https://github.com/codespaces/badge.svg
[discord-link]: https://join.wolfstar.rocks
[discord-shield]:
  https://img.shields.io/discord/830481105261821952?color=5865F2&label=discord&labelColor=black&logo=discord&logoColor=white&style=flat-square
[discord-shield-badge]:
  https://img.shields.io/discord/1127171173982154893?color=5865F2&label=discord&labelColor=black&logo=discord&logoColor=white&style=for-the-badge
[github-contributors-link]:
  https://github.com/wolfstar-project/wolfstar.rocks/graphs/contributors
[github-contributors-shield]:
  https://img.shields.io/github/contributors/wolfstar-project/wolfstar.rocks?color=c4f042&labelColor=black&style=flat-square
[github-forks-link]:
  https://github.com/wolfstar-project/wolfstar.rocks/network/members
[github-forks-shield]:
  https://img.shields.io/github/forks/wolfstar-project/wolfstar.rocks?color=8ae8ff&labelColor=black&style=flat-square
[github-issues-link]: https://github.com/wolfstar-project/wolfstar.rocks/issues
[github-issues-shield]:
  https://img.shields.io/github/issues/wolfstar-project/wolfstar.rocks?color=ff80eb&labelColor=black&style=flat-square
[github-license-link]:
  https://github.com/wolfstar-project/wolfstar.rocks/blob/main/LICENSE
[github-license-shield]:
  https://img.shields.io/badge/license-apache%202.0-white?labelColor=black&style=flat-square
[github-project-link]:
  https://github.com/wolfstar-project/wolfstar.rocks/projects
[github-release-link]:
  https://github.com/wolfstar-project/wolfstar.rocks/releases
[github-release-shield]:
  https://img.shields.io/github/v/release/wolfstar-project/wolfstar.rocks?color=369eff&labelColor=black&logo=github&style=flat-square
[github-releasedate-link]:
  https://github.com/wolfstar-project/wolfstar.rocks/releases
[github-releasedate-shield]:
  https://img.shields.io/github/release-date/wolfstar-project/wolfstar.rocks?labelColor=black&style=flat-square
[github-stars-link]:
  https://github.com/wolfstar-project/wolfstar.rocks/network/stargazers
[github-stars-shield]:
  https://img.shields.io/github/stars/wolfstar-project/wolfstar.rocks?color=ffcb47&labelColor=black&style=flat-square
[issues-link]:
  https://img.shields.io/github/issues/wolfstar-project/wolfstar.rocks.svg?style=flat
[netlify-status-shield]:
  https://api.netlify.com/api/v1/badges/80592647-d7bf-49b3-b82c-d0a3b3d7b3d0/deploy-status
[netlify-status-link]:
  https://app.netlify.com/projects/wolfstar-rocks-et34281/deploys
[official-site]: https://wolfstar.rocks
[codspeed-link]:
  https://codspeed.io/wolfstar-project/wolfstar.rocks?utm_source=badge
[codspeed-shield]:
  https://img.shields.io/endpoint?url=https://codspeed.io/badge.json
[pr-welcome-link]: https://github.com/wolfstar-project/wolfstar.rocks/pulls
[pr-welcome-shield]:
  https://img.shields.io/badge/🤯_pr_welcome-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
[profile-link]: https://github.com/wolfstar-project
[share-linkedin-shield]:
  https://img.shields.io/badge/-share%20on%20linkedin-black?labelColor=black&logo=linkedin&logoColor=white&style=flat-square
[share-linkedin-link]: https://linkedin.com/feed
[share-reddit-shield]:
  https://img.shields.io/badge/-share%20on%20reddit-black?labelColor=black&logo=reddit&logoColor=white&style=flat-square
[share-reddit-link]:
  https://www.reddit.com/submit?title=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20WolfStar%20-%20A%20powerful%20bot%20designed%20to%20enhance%20your%20server%20experience.%20%23bot%20%23server%20%23openAI&url=https%3A%2F%2Fgithub.com%2Fwolfstar-project%2Fwolfstar
[share-telegram-shield]:
  https://img.shields.io/badge/-share%20on%20telegram-black?labelColor=black&logo=telegram&logoColor=white&style=flat-square
[share-telegram-link]:
  https://t.me/share/url?text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20WolfStar%20-%20A%20powerful%20bot%20designed%20to%20enhance%20your%20server%20experience.%20%23bot%20%23server%20%23openAI&url=https%3A%2F%2Fgithub.com%2Fwolfstar-project%2Fwolfstar
[share-whatsapp-shield]:
  https://img.shields.io/badge/-share%20on%20whatsapp-black?labelColor=black&logo=whatsapp&logoColor=white&style=flat-square
[share-whatsapp-link]:
  https://api.whatsapp.com/send?text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20WolfStar%20-%20A%20powerful%20bot%20designed%20to%20enhance%20your%20server%20experience.%20https%3A%2F%2Fgithub.com%2Fwolfstar-project%2Fwolfstar%20%23bot%20%23server%20%23openAI
[share-x-shield]:
  https://img.shields.io/badge/-share%20on%20x-black?labelColor=black&logo=x&logoColor=white&style=flat-square
[share-x-link]:
  https://x.com/intent/tweet?hashtags=bot%2Cserver%2CopenAI&text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20WolfStar%20-%20A%20powerful%20bot%20designed%20to%20enhance%20your%20server%20experience.&url=https%3A%2F%2Fgithub.com%2Fwolfstar-project%2Fwolfstar
[invite-link]: https://invite.wolfstar.rocks
