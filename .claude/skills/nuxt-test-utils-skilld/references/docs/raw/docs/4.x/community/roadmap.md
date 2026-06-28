# Roadmap

> Nuxt is constantly evolving, with new features and modules being added all the time.

<read-more to="/blog">

See our blog for the latest framework and ecosystem announcements.

</read-more>

## Status Reports

<read-more to="https://github.com/nuxt/nuxt/issues/13653" icon="i-simple-icons-github" target="_blank">

Documentation Progress

</read-more>

<read-more to="https://github.com/nuxt/nuxt/discussions/16119" icon="i-simple-icons-github" target="_blank">

Rendering Optimizations: Today and Tomorrow

</read-more>

<read-more to="https://github.com/nuxt/image/discussions/563" icon="i-simple-icons-github" target="_blank">

Nuxt Image: Performance and Status

</read-more>

## Roadmap

In roadmap below are some features we are planning or working on at the moment.

<tip>

Check Discussions and RFCs for more upcoming features and ideas.

</tip>

<table>
<thead>
  <tr>
    <th>
      Milestone
    </th>
    
    <th>
      Expected date
    </th>
    
    <th>
      Notes
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      SEO & PWA
    </td>
    
    <td>
      2025
    </td>
    
    <td>
      <a href="https://github.com/nuxt/nuxt/discussions/18395" rel="nofollow">
        nuxt/nuxt#18395
      </a>
    </td>
    
    <td>
      Migrating from <a href="https://github.com/nuxt-community/pwa-module" rel="nofollow">
        nuxt-community/pwa-module
      </a>
      
       for built-in SEO utils and service worker support
    </td>
  </tr>
  
  <tr>
    <td>
      Assets
    </td>
    
    <td>
      2025
    </td>
    
    <td>
      <a href="https://github.com/nuxt/nuxt/discussions/22012" rel="nofollow">
        nuxt/nuxt#22012
      </a>
    </td>
    
    <td>
      Allow developers and modules to handle loading third-party assets.
    </td>
  </tr>
  
  <tr>
    <td>
      Translations
    </td>
    
    <td>
      -
    </td>
    
    <td>
      <a href="https://github.com/nuxt/nuxt.com/issues/1711" rel="nofollow">
        nuxt/nuxt.com#1711
      </a>
    </td>
    
    <td>
      A collaborative project for a stable translation process for Nuxt docs. Currently pending for ideas and documentation tooling support.
    </td>
  </tr>
</tbody>
</table>

## Core Modules Roadmap

In addition to the Nuxt framework, there are modules that are vital for the ecosystem. Their status will be updated below.

<table>
<thead>
  <tr>
    <th>
      Module
    </th>
    
    <th>
      Status
    </th>
    
    <th>
      Nuxt Support
    </th>
    
    <th>
      Repository
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Auth Utils
    </td>
    
    <td>
      Planned
    </td>
    
    <td>
      4.x, 5.x
    </td>
    
    <td>
      <code>
        nuxt/auth-utils
      </code>
      
       to be announced
    </td>
    
    <td>
      The temporary repository <a href="https://github.com/atinux/nuxt-auth-utils" rel="nofollow">
        atinux/nuxt-auth-utils
      </a>
      
       is available while awaiting its official integration into Nuxt via RFC.
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="https://github.com/nuxt/a11y" rel="nofollow">
        a11y
      </a>
    </td>
    
    <td>
      Public Alpha
    </td>
    
    <td>
      3.x, 4.x
    </td>
    
    <td>
      <a href="https://github.com/nuxt/a11y" rel="nofollow">
        nuxt/a11y
      </a>
      
      .
    </td>
    
    <td>
      Real-time accessibility feedback and automated testing in your browser during development (see <a href="https://github.com/nuxt/nuxt/issues/23255" rel="nofollow">
        nuxt/nuxt#23255
      </a>
      
      ).
    </td>
  </tr>
</tbody>
</table>

## Release Cycle

Since January 2023, we've adopted a consistent release cycle for Nuxt, following semver. We aim for major framework releases every year, with an expectation of patch releases every week or so and minor releases every month or so. They should never contain breaking changes except within options clearly marked as `experimental`.

We are planning a slight variation from this plan for Nuxt 4 and Nuxt 5. Nuxt 4 will be a stability-focused release containing all `compatibilityVersion: 4` features, and will be followed shortly by Nuxt 5 which will include an upgrade to Nitro v3 and additional changes.

This approach separates breaking changes into manageable phases, allowing for better ecosystem testing and smoother migrations.

### Ongoing Support for Nuxt

We commit to support each major version of Nuxt for a minimum of six months after the release of the next major version, and to providing an upgrade path for current users at that point.

### Current Packages

The current active version of Nuxt is **v4** which is available as `nuxt` on npm with the `latest` tag.

Nuxt 3 will continue to receive maintenance updates (bug fixes and security patches) until the end of July 2026.

Each active version has its own nightly releases which are generated automatically. For more about enabling the Nuxt nightly release channel, see [the nightly release channel docs](/docs/4.x/guide/going-further/nightly-release-channel).

<table>
<thead>
  <tr>
    <th>
      Release
    </th>
    
    <th>
      
    </th>
    
    <th>
      Initial release
    </th>
    
    <th>
      End Of Life
    </th>
    
    <th>
      Docs
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <strong>
        5.x
      </strong>
      
       (scheduled)
    </td>
    
    <td>
      
    </td>
    
    <td>
      Q1 2026 (estimated)
    </td>
    
    <td>
      TBA
    </td>
    
    <td>
      
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        4.x
      </strong>
      
       (stable)
    </td>
    
    <td>
      <a href="https://www.npmjs.com/package/nuxt?activeTab=versions">
        <img alt="Nuxt latest version" src="https://img.shields.io/npm/v/nuxt.svg?logo=nuxt&label=&style=flat&colorA=18181B&colorB=28CF8D" className="not-prose,h-5,w-auto" :zoom="false" />
      </a>
    </td>
    
    <td>
      2025-07-16
    </td>
    
    <td>
      6 months after 5.x release
    </td>
    
    <td>
      <a href="/docs/4.x/getting-started/introduction">
        nuxt.com
      </a>
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        3.x
      </strong>
      
       (maintenance)
    </td>
    
    <td>
      <a href="https://www.npmjs.com/package/nuxt?activeTab=versions">
        <img alt="Nuxt 3.x version" src="https://img.shields.io/npm/v/nuxt/3x.svg?logo=nuxt&label=&style=flat&colorA=18181B&colorB=28CF8D" className="not-prose,h-5,w-auto" :zoom="false" />
      </a>
    </td>
    
    <td>
      2022-11-16
    </td>
    
    <td>
      2026-07-31
    </td>
    
    <td>
      <a href="/docs/3.x/getting-started/introduction">
        nuxt.com
      </a>
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        2.x
      </strong>
      
       (unsupported)
    </td>
    
    <td>
      <a href="https://www.npmjs.com/package/nuxt?activeTab=versions">
        <img alt="Nuxt 2.x version" src="https://img.shields.io/npm/v/nuxt/2x.svg?logo=nuxt&label=&style=flat&colorA=18181B&colorB=28CF8D" className="not-prose,h-5,w-auto" :zoom="false" />
      </a>
    </td>
    
    <td>
      2018-09-21
    </td>
    
    <td>
      2024-06-30
    </td>
    
    <td>
      <a href="https://v2.nuxt.com/docs/get-started/installation/" rel="nofollow">
        v2.nuxt.com
      </a>
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        1.x
      </strong>
      
       (unsupported)
    </td>
    
    <td>
      <a href="https://www.npmjs.com/package/nuxt?activeTab=versions">
        <img alt="Nuxt 1.x version" src="https://img.shields.io/npm/v/nuxt/1x.svg?logo=nuxt&label=&style=flat&colorA=18181B&colorB=28CF8D" className="not-prose,h-5,w-auto" :zoom="false" />
      </a>
    </td>
    
    <td>
      2018-01-08
    </td>
    
    <td>
      2019-09-21
    </td>
    
    <td>
      
    </td>
  </tr>
</tbody>
</table>

### Support Status

<table>
<thead>
  <tr>
    <th>
      Status
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Unsupported
    </td>
    
    <td>
      This version is not maintained any more and will not receive security patches
    </td>
  </tr>
  
  <tr>
    <td>
      Maintenance
    </td>
    
    <td>
      This version will only receive security patches
    </td>
  </tr>
  
  <tr>
    <td>
      Stable
    </td>
    
    <td>
      This version is being developed for and will receive security patches
    </td>
  </tr>
  
  <tr>
    <td>
      Development
    </td>
    
    <td>
      This version could be unstable
    </td>
  </tr>
  
  <tr>
    <td>
      Scheduled
    </td>
    
    <td>
      This version does not exist yet but is planned
    </td>
  </tr>
</tbody>
</table>
