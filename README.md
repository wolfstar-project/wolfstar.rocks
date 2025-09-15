# WolfStar.rocks

<div align="center"><a name="readme-top"></a>

<img src="https://github.com/WolfStarBot.png" width="15%" alt="WolfStar Logo">

# WolfStar.rocks

The official web dashboard for WolfStar, a powerful multi-purpose Discord
bot.<br/>

[Official Site][official-site] · [Blog][blog] · [WolfStar Invite
Link][invite-link] · [Support Server][discord-link] ·
[Feedback][github-issues-link]

<!-- SHIELD GROUP -->

[![Commit Check][commit-check-shield]][commit-check-link]
[![][github-release-shield]][github-release-link]
[![][github-releasedate-shield]][github-releasedate-link]<br/>
[![][discord-shield]][discord-link] [![][codecov-shield]][codecov-link]
[![][github-contributors-shield]][github-contributors-link]<br/>
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][github-license-shield]][github-license-link]<br>
[![][pr-welcome-shield]][pr-welcome-link]

**Share WolfStar Repository**

[![][share-linkedin-shield]][share-linkedin-link]
[![][share-reddit-shield]][share-reddit-link]
[![][share-telegram-shield]][share-telegram-link]
[![][share-whatsapp-shield]][share-whatsapp-link]
[![][share-x-shield]][share-x-link]

<sup>Pioneering the new age of server moderation management. Built for you, the
Super Admin.</sup>

</div>

<details>
<summary><kbd>Table of contents</kbd></summary>

#### TOC

- [👋🏻 Welcome to WolfStar.rocks](#-welcome-to-wolfstarrocks)
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
- **Multi-language Support**: Support for multiple languages (coming soon).
- **Dashboard Analytics**: View server statistics and bot usage metrics.

</div>

<div id="-self-hosting-wolfstarrocks-requirements">

## 🚀 Self-Hosting WolfStar.rocks Requirements

- **Node.js**: WolfStar.rocks is built on Node.js, so you will need to have
  Node.js (v20+) installed.
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
   - Duplicate `.env.example` and rename it to `.env`
   - Fill in all required environment variables
   - Configure Discord OAuth2 settings in your Discord Developer Portal

4. **Database Setup**
   - Ensure your WolfStar bot database is accessible
   - Run database migrations if needed

5. **Start the development server**
   ```bash
   pnpm dev
   ```

### Environment Variables

Copy `.env.example` to `.env` and configure the following:

```env
# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/wolfstar

# Optional: Sentry for error tracking
SENTRY_DSN=your_sentry_dsn
```

### Discord OAuth2 Configuration

1. Go to the
   [Discord Developer Portal](https://discord.com/developers/applications/)
2. Select your bot application
3. Navigate to the **OAuth2** tab
4. Add redirect URLs:
   - `http://localhost:3000/oauth/callback`
   - `http://localhost:3000/oauth/guild`
5. Save your changes

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm dev:pwa` - Start development server with PWA support
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript checks

### Development Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all CI checks pass

### Development Tools

- **Nuxt 4** - Vue.js framework
- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Prisma** - Database ORM
- **Tailwind CSS** - Styling
- **DaisyUI** - Styling
- **Shadcn** - Components

</div>

<div id="️-local-development">

## ⌨️ Local Development

Refer to [CONTRIBUTING.md][contributing-link] for detailed setup instructions.

</div>

<div id="-online-development" align="right">

## 💻 Online Development

Click any of the buttons below to start a new development environment to demo or
contribute to the codebase without having to install anything on your machine:

[![Open in VS Code](https://img.shields.io/badge/Open%20in-VS%20Code-blue?logo=visualstudiocode)](https://vscode.dev/github/wolfstar-project/wolfstar.rocks)
[![Open in GitHub1s](https://img.shields.io/badge/Open%20in-GitHub1s-blue?logo=github)](https://github1s.com/wolfstar-project/wolfstar.rocks)
[![Open in Glitch](https://img.shields.io/badge/Open%20in-Glitch-purple?logo=glitch)](https://glitch.com/edit/#!/import/github/wolfstar-project/wolfstar.rocks)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/wolfstar-project/wolfstar.rocks)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/wolfstar-project/wolfstar.rocks)
[![Edit in Codesandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/wolfstar-project/wolfstar.rocks)
[![Open in Repl.it](https://replit.com/badge/github/withastro/astro)](https://replit.com/github/wolfstar-project/wolfstar.rocks)
[![Open in Codeanywhere](https://codeanywhere.com/img/open-in-codeanywhere-btn.svg)](https://app.codeanywhere.com/#https://github.com/wolfstar-project/wolfstar.rocks)
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/wolfstar-project/wolfstar.rocks)

</div>

<div id="️-contributing">

## 🤝 Contributing

Thank you to all the people who already contributed to WolfStar.rocks! Please
make sure to read the [Contributing Guide][contributing-link] before making a
pull request.

<a href="https://github.com/wolfstar-project/wolfstar.rocks/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=wolfstar-project/wolfstar.rocks" />
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

[![][back-to-top]](#readme-top)

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
[discord-link]: https://discord.gg/gqAnRyUXG8
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
[official-site]: https://wolfstar.rocks
[pr-welcome-link]: https://github.com/wolfstar-project/wolfstar.rocks/pulls
[pr-welcome-shield]:
  https://img.shields.io/badge/🤯_pr_welcome-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
[profile-link]: https://github.com/wolfstar
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
