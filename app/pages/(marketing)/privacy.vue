<template>
  <div class="content-fit py-10">
    <article class="prose">
      <!-- Header -->
      <header class="mb-12 mt-8">
        <div class="flex items-baseline justify-between gap-4 mb-6">
          <h1 class="font-bold text-base-content/80 text-4xl sm:text-5xl">
            WolfStar Privacy Policy
          </h1>
        </div>
        <p class="text-lg text-base-content/70 mb-4">
          Last updated and effective:
          <NuxtTime
            locale="en-US"
            :datetime="buildInfo.privacyPolicyDate"
            date-style="long"
            time-style="medium"
          />
        </p>
        <div class="space-y-2 text-sm text-base-content/60">
          <p>
            <span class="font-semibold">Owner and data controller:</span> WolfStar Project
          </p>
          <p>
            <span class="font-semibold">Contact email: </span>
            <NuxtLink to="mailto:contact@wolfstar.rocks" class="underline hover:opacity-80">
              contact@wolfstar.rocks
            </NuxtLink>
          </p>
        </div>
      </header>

      <!-- Content Sections -->
      <div class="prose prose-lg max-w-none space-y-12">
        <!-- Welcome Section -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Welcome to WolfStar Project
          </h2>
          <p class="text-base-content leading-relaxed">
            WolfStar Project provides a chat bot for the
            <NuxtLink to="https://discord.com/privacy" target="_blank" class="underline hover:opacity-70">
              Discord
            </NuxtLink> chat
            platform, (the "Bot"), a website that serves as a dashboard (the "Site")
            and various related services (collectively, the "Service(s)"). The
            Service is operated by WolfStar Project (the "Company", "we" or "us")
            for users of the Service ("you" or the "user(s)"). This privacy policy
            sets forth our policy with respect to information that is collected from
            visitors to the Site and users of the Bot and/or the Services. Under
            applicable law, WolfStar Project is the "data controller" of
            <NuxtLink to="https://discord.com/privacy" target="_blank" class="underline hover:opacity-70">
              Discord
            </NuxtLink> user data
            collected through the Services.
          </p>
        </section>

        <!-- Information We Collect -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Information we collect
          </h2>
          <p class="text-base-content leading-relaxed mb-4">
            When you interact with us through the Services, we may collect
            information from you, as further described below:
          </p>
          <p class="text-base-content leading-relaxed mb-4">
            <span class="font-semibold">Information You Provide:</span> We collect
            information from you when you voluntarily provide such information, such
            as when you use any of the Services. Information we collect may include
            but not be limited to usernames, Discord user data, or other
            content you send via the chat feature when interacting with the Bot.
          </p>
        </section>

        <!-- What Are Cookies -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            What are cookies?
          </h2>
          <p class="text-base-content leading-relaxed">
            Cookies are small text files stored on your device when you visit a website.
            Their purpose is to enhance your browsing experience by remembering certain
            preferences and settings.
          </p>
        </section>

        <!-- What Cookies Do We Use -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            What cookies do we use?
          </h2>
          <p class="text-base-content leading-relaxed mb-4">
            We only use essential technical cookies for purposes strictly necessary for the site's functionality. We do not use
            third-party advertising cookies.
          </p>
          <ul class="space-y-3 text-base-content list-none pl-0">
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                <span class="font-semibold">h3 (Session Cookie):</span> This is our secure session cookie. It stores the OAuth access token when you
                connect your Discord account. It is essential for maintaining your authenticated
                session. This cookie is HTTP-only and encrypted for your security.
              </span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                <span class="font-semibold">Sentry (error monitoring):</span> Sentry may set first‑party cookies or use local storage to persist session identifiers for error correlation and session replay. These identifiers are used only for debugging and are not used for advertising; personal data is masked where possible.
              </span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                <span class="font-semibold">Hosting provider cookies (Netlify):</span> Our hosting/CDN may set essential operational cookies (caching, routing, preview or identity/session features). These are infrastructure cookies required to deliver the site and are not used for advertising or cross‑site tracking.
              </span>
            </li>
          </ul>
        </section>

        <!-- Local Storage -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Local storage
          </h2>
          <p class="text-base-content leading-relaxed">
            In addition to session cookies, we use your browser's Local Storage to save your display preferences. This allows us to remember the theme
            (light/dark) and other settings you have selected, so you don't have to reconfigure them on each visit.
            This information is purely functional, stored only on your device, and contains no personal data nor is it used to track you. We use it exclusively to improve your experience on our website.
          </p>
        </section>

        <!-- Managing Cookies -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Managing cookies
          </h2>
          <p class="text-base-content leading-relaxed mb-4">
            You can configure your browser to accept, reject, or delete cookies according to
            your preferences. However, please note that rejecting essential cookies may prevent full access to the application.
          </p>
          <p class="text-base-content leading-relaxed mb-3">
            Below are links with instructions for cookie management in the most commonly
            used browsers:
          </p>
          <ul class="space-y-2 text-base-content list-none pl-0">
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <NuxtLink
                to="https://support.google.com/chrome/answer/95647?hl=en"
                target="_blank"
                class="underline hover:opacity-70"
              >
                Google Chrome
              </NuxtLink>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <NuxtLink
                to="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox"
                target="_blank"
                class="underline hover:opacity-70"
              >
                Mozilla Firefox
              </NuxtLink>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <NuxtLink
                to="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-168dab11-0753-043d-7c16-ede5947fc64d"
                target="_blank"
                class="underline hover:opacity-70"
              >
                Microsoft Edge
              </NuxtLink>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <NuxtLink
                to="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                target="_blank"
                class="underline hover:opacity-70"
              >
                Safari
              </NuxtLink>
            </li>
          </ul>
        </section>

        <!-- Analytics -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Analytics
          </h2>
          <p class="text-base-content leading-relaxed mb-4">
            We use Netlify Analytics to understand how visitors use our website. This helps us improve the user
            experience and identify issues.
          </p>
          <p class="text-base-content leading-relaxed mb-3">
            Netlify Analytics is designed with privacy in mind:
          </p>
          <ul class="space-y-2 text-base-content list-none pl-0">
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>It does not use cookies</span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>It does not collect personal identifiers</span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>It does not track users across websites</span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>All data is aggregated and anonymised</span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>Data is collected server-side, not from your browser</span>
            </li>
          </ul>
          <p class="text-base-content leading-relaxed mt-4">
            The only information collected includes: page URLs, referrer, country/region,
            device type, browser, and operating system. This data cannot be used to identify
            individual users. All analytics data is processed server-side by our hosting provider.
          </p>
        </section>

        <!-- Error Tracking -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Error tracking and monitoring
          </h2>
          <p class="text-base-content leading-relaxed mb-4">
            We use Sentry for error tracking and application monitoring. This helps us identify and fix bugs, improve performance, and ensure a better user experience.
          </p>
          <p class="text-base-content leading-relaxed mb-3">
            Sentry may collect the following information when errors occur:
          </p>
          <ul class="space-y-2 text-base-content list-none pl-0">
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>Error messages and stack traces</span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>Browser type and version</span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>Operating system</span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>IP address (anonymized)</span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>Page URL where the error occurred</span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>Session replay data (for 10% of sessions and 100% of sessions with errors)</span>
            </li>
          </ul>
          <p class="text-base-content leading-relaxed mt-4">
            Session replays capture user interactions (clicks, scrolls, navigation) to help us understand how errors occur. Personal information entered in forms is automatically masked. Sentry may set first‑party cookies or use local storage to correlate sessions for error reporting and session replay; these mechanisms are used solely for debugging and are not used for advertising. To opt out of session replay, contact us at <NuxtLink to="mailto:contact@wolfstar.rocks">contact@wolfstar.rocks</NuxtLink>. All data is processed in accordance with GDPR requirements and stored securely.
          </p>
        </section>

        <!-- Authenticated Users -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Authenticated users
          </h2>
          <p class="text-base-content leading-relaxed mb-4">
            When you connect your Discord account to WolfStar, we store your OAuth access token in a secure, HTTP-only,
            encrypted session cookie. This token is used solely to authenticate requests on your behalf and access your Discord guilds where WolfStar is installed.
          </p>
          <p class="text-base-content leading-relaxed mb-3">
            The information we collect from Discord includes:
          </p>
          <ul class="space-y-2 text-base-content list-none pl-0">
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>Discord User ID</span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>Username and discriminator</span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>Avatar</span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>List of guilds (servers) where you have permissions</span>
            </li>
          </ul>
          <p class="text-base-content leading-relaxed mt-4">
            We do not store your Discord password or credentials. We only access data necessary to provide the features you use. You can disconnect your account at any time from your profile page, which will delete your session and revoke our access.
          </p>
        </section>

        <!-- Data We Collect Automatically -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Data we collect automatically
          </h2>
          <p class="text-base-content leading-relaxed mb-4">
            When you interact with us through the Services, we automatically receive and store certain
            information to provide and improve our services:
          </p>
          <ul class="space-y-3 text-base-content list-none pl-0">
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                <span class="font-semibold">IP Address:</span> Used for security, rate limiting, and general location (country/region) for analytics. IP addresses are anonymized in analytics and error tracking.
              </span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                <span class="font-semibold">Device Information:</span> Browser type, operating system, device type, and screen resolution to optimize the user experience and identify compatibility issues.
              </span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                <span class="font-semibold">Usage Data:</span> Pages visited, time spent on pages, referrer URLs, and interaction patterns to understand how users navigate our services and improve functionality.
              </span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                <span class="font-semibold">Bot Interactions:</span> When using the Discord bot, we may collect message content, command usage, and server activity to provide bot functionality and improve features. This data is stored securely and used only for service provision.
              </span>
            </li>
          </ul>
        </section>

        <!-- Where Information is Processed -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Where information is processed
          </h2>
          <p class="text-base-content leading-relaxed">
            The Company is based in Italy and the Services are hosted in Germany
            (by Hetzner Online GmbH). No matter where you are located you consent to
            processing and transferring of your information in and to Germany,
            Italy, and other countries. The laws of Germany, Italy, and other
            countries governing data collection and use may not be as comprehensive
            or protective as the laws of the country where you live.
          </p>
        </section>

        <!-- Our Use of Your Information -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Our use of your information
          </h2>
          <p class="text-base-content leading-relaxed">
            We use the information you provide in a manner that is consistent with
            this Privacy Policy. If you provide information for a certain reason, we
            may use the information in connection with the reason for which it was
            provided. For instance, if you contact us by email, we will use the
            information you provide to answer your question or resolve your problem.
            Also, if you provide information in order to obtain access to the
            Services, we will use your information to provide you with access to
            such services and to monitor your use of such services. The Company and
            its subsidiaries and affiliates (the “Related Companies”) may also use
            your information collected through the Services to help us improve the
            content and functionality of the Services, to better understand our
            users and to improve the Services. The Company and its affiliates may
            use this information to contact you in the future to tell you about
            services we believe will be of interest to you. If we do so, each
            marketing communication we send you will contain instructions permitting
            you to "opt-out" of receiving future marketing communications. In
            addition, if at any time you wish not to receive any future marketing
            communications or you wish to have your name deleted from our mailing
            lists, please contact us as indicated below.
          </p>
        </section>

        <!-- Legal Bases -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Our legal bases for handling of your personal data
          </h2>
          <p class="text-base-content leading-relaxed mb-4">
            The laws in some jurisdictions require companies to tell you about the
            legal ground they rely on to use or disclose your personal data. To the
            extent those laws apply, our legal grounds are as follows:
          </p>
          <ul class="space-y-3 text-base-content list-none pl-0">
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                Users have given their consent for one or more specific purposes.
                Note: Under some legislations the Owner may be allowed to process
                Personal Data until the User objects to such processing ("opt-out"),
                without having to rely on consent or any other of the following legal
                bases. This, however, does not apply, whenever the processing of
                Personal Data is subject to European data protection law.
              </span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                Provision of Data is necessary for the performance of an agreement
                with the User and/or for any pre-contractual obligations thereof.
              </span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                Processing is necessary for compliance with a legal obligation to
                which the Owner is subject.
              </span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                Processing is related to a task that is carried out in the public
                interest or in the exercise of official authority vested in the Owner.
              </span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                Processing is necessary for the purposes of the legitimate interests
                pursued by the Owner or by a third party.
              </span>
            </li>
          </ul>
          <p class="text-base-content leading-relaxed mt-4">
            In any case, the Owner will gladly help to clarify the specific legal
            basis that applies to the processing, and in particular whether the
            provision of Personal Data is a statutory or contractual requirement, or
            a requirement necessary to enter into a contract.
          </p>
        </section>

        <!-- Our Disclosure of Your Information -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Our disclosure of your information
          </h2>
          <p class="text-base-content leading-relaxed mb-4">
            The Company is not in the business of selling your information. We
            consider this information to be a vital part of our relationship with
            you. There are, however, certain circumstances in which we may share
            your information with certain third parties, as set forth below:
          </p>
          <ul class="space-y-3 text-base-content list-none pl-0">
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                <span class="font-semibold text-base-content">Consent</span>: We may transfer your
                information with your consent.
              </span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                <span class="font-semibold text-base-content">Consultants and outside collaborators</span>:
                Like many businesses, we sometimes request the help of other companies
                or individuals to perform certain functions. Examples of such
                functions include accessing, modifying and adding to the open-source
                source code. In order to perform these functions they may require
                samples of any of the data stored by the Services. These people will
                however never have access to the full data and any data will always be
                anonymized where required.
              </span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                <span class="font-semibold text-base-content">Legal Requirements</span>: We may disclose
                your information if required to do so by law or in the good faith
                belief that such action is necessary to (i) comply with a legal
                obligation, (ii) protect and defend the rights or property of the
                Company or Related Companies, (iii) protect the personal safety of
                users of the Services or the public, or (iv) protect against legal
                liability.
              </span>
            </li>
          </ul>
        </section>

        <!-- Unsolicited Information -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Unsolicited information
          </h2>
          <p class="text-base-content leading-relaxed">
            You may provide us with ideas for new products or modifications to
            existing products, and other unsolicited submissions (collectively,
            “Unsolicited Information”). All Unsolicited Information shall be deemed
            to be non-confidential and we shall be free to reproduce, use, disclose,
            and distribute such Unsolicited Information to others without limitation
            or attribution.
          </p>
        </section>

        <!-- Children -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Children
          </h2>
          <p class="text-base-content leading-relaxed">
            Our Services are for users age 13 and over and we do not knowingly
            collect personal information from children under the age of 13. If you
            are a parent or guardian of a child under the age of 13 and believe he
            or she has disclosed personal information to us please contact us at
            <NuxtLink to="mailto:contact@wolfstar.rocks">
              contact@wolfstar.rocks
            </NuxtLink>. Note: In some countries, the age of digital consent is older than 13.
            If you are in those countries, you must be at least that age to use the
            Services. For example, for residents of the EEA, where processing of
            personal information is based on consent, WolfStar Project will not
            knowingly engage in that processing for users under the age of consent
            established by applicable data protection law. If we learn that we are
            engaged in that processing with such users, we will halt such processing
            and will take reasonable measures to promptly remove applicable
            information from our records.
          </p>
        </section>

        <!-- Links to Other Websites -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Links to other web sites
          </h2>
          <p class="text-base-content leading-relaxed">
            This Privacy Policy applies only to the Services. The Services may
            contain links to other web sites not operated or controlled by us (the
            “Third Party Sites”). The policies and procedures we described here do
            not apply to the Third Party Sites. The links from the Services do not
            imply that we endorse or have reviewed the Third Party Sites. We suggest
            contacting those sites directly for information on their privacy
            policies.
          </p>
        </section>

        <!-- Data Retention -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Data retention
          </h2>
          <p class="text-base-content leading-relaxed mb-4">
            We retain different types of data for different periods, based on the purpose of collection and legal requirements:
          </p>
          <ul class="space-y-3 text-base-content list-none pl-0">
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                <span class="font-semibold">Session Cookies:</span> Automatically deleted when you close your browser or after a period of inactivity (typically 7 days).
              </span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                <span class="font-semibold">Local Storage Preferences:</span> Remain on your device until you clear your browser data or manually reset preferences.
              </span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                <span class="font-semibold">Analytics Data:</span> Retained in aggregate form by Netlify and cannot be linked to individual users. Retained according to Netlify's data retention policy.
              </span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                <span class="font-semibold">Error Tracking Data:</span> Retained by Sentry for up to 90 days for debugging purposes, then automatically deleted.
              </span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                <span class="font-semibold">User Account Data:</span> Retained while your account is active and for a reasonable period after account deletion to comply with legal obligations.
              </span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>
                <span class="font-semibold">Backups:</span> Database backups are created regularly and automatically deleted after 7 days (168 hours).
              </span>
            </li>
          </ul>
          <p class="text-base-content leading-relaxed mt-4">
            We generally retain personal data for so long as it may be relevant to
            the purposes identified herein. To dispose of personal data, we may
            anonymize it, delete it or take other appropriate steps.
          </p>
        </section>

        <!-- Security -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Security
          </h2>
          <p class="text-base-content leading-relaxed">
            We take reasonable steps to protect the information provided via the
            Services from loss, misuse, and unauthorized access, disclosure,
            alteration, or destruction. However, no Internet or email transmission
            is ever fully secure or error free. In particular, email sent to or from
            the Services may not be secure. Therefore, you should take special care
            in deciding what information you send to us via email. Please keep this
            in mind when disclosing any information via the Internet.
          </p>
        </section>

        <!-- Your Data Rights and Choices -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Your data rights and choices
          </h2>
          <p class="text-base-content leading-relaxed mb-4">
            We believe that users should be treated equally no matter where they
            are, and so we are making the following options to control your data
            available to all users, regardless of their location.
          </p>
          <p class="text-base-content leading-relaxed mb-4">
            You have the right to:
          </p>
          <ul class="space-y-2 text-base-content list-none pl-0 mb-4">
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>Access information about what data we collect</span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>Clear your local storage and cookies at any time</span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>Disconnect your authenticated session</span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>Request deletion of your personal data</span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>Request a copy of your data</span>
            </li>
            <li class="flex items-start gap-3 leading-relaxed">
              <span class="text-base-content/50 shrink-0">&mdash;</span>
              <span>Request information about our data practices</span>
            </li>
          </ul>
          <p class="text-base-content leading-relaxed mb-4">
            Individuals in California, the European Economic Area, Canada, Costa
            Rica and some other jurisdictions have certain legal rights to obtain
            confirmation of whether we hold personal data about them, to access
            personal data we hold about them (including, in some cases, in portable
            form), and to obtain its correction, update, amendment or deletion in
            appropriate circumstances. They may also object to our uses or
            disclosures of personal data, to request a restriction on its
            processing, or withdraw any consent, though such actions typically will
            not have retroactive effect. They also will not affect our ability to
            continue processing data in lawful ways.
          </p>
          <ul class="space-y-3 text-base-content list-none pl-0">
            <li class="font-semibold text-base-content text-base">
              How can I access the personal data you have about me?
            </li>
          </ul>
          <p class="text-base-content leading-relaxed mb-4">
            If you would like to submit a data access request, you can do so by
            sending an email to
            <NuxtLink to="mailto:contact@wolfstar.rocks" class="underline hover:opacity-70">
              contact@wolfstar.rocks
            </NuxtLink>. Upon request we will start the process and provide you a link to
            access the personal data the Services has on you within 30 standard
            working days.
          </p>
          <ul class="space-y-3 text-base-content list-none pl-0">
            <li class="font-semibold text-base-content text-base">
              How do I correct, update, amend, or delete the personal data you have
              about me?
            </li>
          </ul>
          <p class="text-base-content leading-relaxed mb-4">
            You can request modifications to your data from us directly. Please
            write us at
            <NuxtLink to="mailto:contact@wolfstar.rocks" class="underline hover:opacity-70">
              contact@wolfstar.rocks
            </NuxtLink>
            with the words "Personal Data Request" in the subject or body of your
            message, along with an explanation of what data subject right you are
            seeking to exercise. For your protection, we may take steps to verify
            identity before responding to your request.
          </p>
        </section>

        <!-- EEA Representative -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Who is WolfStar Project's EEA representative?
          </h2>
          <p class="text-base-content leading-relaxed">
            As the Company is currently exclusively based within the EEA and the
            Company is of such a small size that we do not have the funds to for a
            registered EEA representative the Company will handle any data
            protection matters, pursuant to Article 27 of the General Data
            Protection Regulation (the "GDPR") of the European Economic Area (the
            "EEA") themselves. You can contact the Company through aforementioned
            means.
          </p>
        </section>

        <!-- California Privacy Rights -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Your California Privacy Rights
          </h2>
          <p class="text-base-content leading-relaxed mb-4">
            Consumers residing in California are afforded certain additional rights
            with respect to their personal information under the California Consumer
            Privacy Act or (“CCPA”) and the “Shine the Light” Law. If you are a
            California resident, this section applies to you.
          </p>
          <p class="font-semibold text-base-content text-base mb-2">
            California Consumer Privacy Act
          </p>
          <p class="text-base-content leading-relaxed mb-4">
            <span class="font-semibold">Our Collection and Use of Personal Information</span>: We collect the following categories of personal information: Discord
            User ID and profile information; internet or other network information (how you interact with
            the application, pages visited); location information (because your IP address may
            indicate your general location, but only country/region level); device and browser information; and other information that identifies
            or can be reasonably associated with you. For examples of the precise
            data points we collect and the sources of such collection, please see
            the sections above including "INFORMATION WE COLLECT", "WHAT COOKIES DO WE USE", "ANALYTICS", and "ERROR TRACKING AND MONITORING". We collect personal
            information for the business and commercial purposes described in “OUR
            USE OF YOUR INFORMATION” above.
          </p>
          <p class="text-base-content leading-relaxed mb-4">
            <span class="font-semibold">Disclosure of Personal Information</span>:
            may share your personal information with third parties as described in
            the “OUR DISCLOSURE OF YOUR INFORMATION” section above. We disclose the
            categories of personal information mentioned above for business or
            commercial purposes.
          </p>
          <p class="text-base-content leading-relaxed mb-4">
            <span class="font-semibold">No Sale of Personal Information</span>: The CCPA
            sets forth certain obligations for businesses that sell personal
            information. We do not sell the personal information of our users.
          </p>
          <p>
            <span class="font-bold">Exercising Your Consumer Rights</span>: If you
            are a California resident, you have the right to request (1) more
            information about the categories and specific pieces of personal
            information we have collected and disclosed for a business purpose in
            the last 12 months, (2) deletion of your personal information, and (3)
            to opt out of sales of your personal information, if applicable. Details
            on how to make these requests are in the “YOUR DATA RIGHTS AND CHOICES”
            section above. We will not discriminate against you if you exercise your
            rights under the CCPA.
          </p>
          <p class="text-base-content leading-relaxed mb-2">
            Requests Received: We received the following number of data requests
            between November 24, 2016 and July 20, 2020:
          </p>
          <p class="italic text-base-content/80">No requests to date</p>
        </section>

        <!-- Changes to Privacy Policy -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Changes to this Privacy Policy
          </h2>
          <p class="text-base-content leading-relaxed">
            We reserve the right to update or modify this Privacy Policy at any time
            and from time to time without prior notice. Please review this policy
            periodically, and especially before you provide any information. This
            Privacy Policy was last updated on the date indicated above. Your
            continued use of the Services after any changes or revisions to this
            Privacy Policy shall indicate your agreement with the terms of such
            revised Privacy Policy.
          </p>
        </section>

        <!-- Contact -->
        <section>
          <h2 class="uppercase text-lg tracking-wider text-base-content/60 mb-4">
            Contacting us
          </h2>
          <p class="text-base-content leading-relaxed">
            Please also feel free to contact us if you have any questions about this
            Privacy Policy or the information practices of the Services. You may
            contact us as follows:
            <NuxtLink to="mailto:contact@wolfstar.rocks">
              contact@wolfstar.rocks
            </NuxtLink>.
          </p>
        </section>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
useSeoMetadata({
  title: "Privacy Policy",
  description: "WolfStar Project's Privacy Policy - Learn how we collect, use, and protect your data",
  shouldOgImage: true,
});

const { buildInfo } = useAppConfig();
</script>
