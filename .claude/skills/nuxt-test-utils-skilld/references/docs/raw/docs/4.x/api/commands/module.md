# nuxt module

> Search and add modules to your Nuxt application with the command line.

Nuxt provides a few utilities to work with [Nuxt modules](/modules) seamlessly.

## nuxt module add

```bash [Terminal]
npx nuxt module add <MODULENAME> [--cwd=<directory>] [--logLevel=<silent|info|verbose>] [--skipInstall] [--skipConfig] [--dev]
```

<table>
<thead>
  <tr>
    <th>
      Argument
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        MODULENAME
      </code>
    </td>
    
    <td>
      Specify one or more modules to install by name, separated by spaces
    </td>
  </tr>
</tbody>
</table>

<table>
<thead>
  <tr>
    <th>
      Option
    </th>
    
    <th>
      Default
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        --cwd=<directory>
      </code>
    </td>
    
    <td>
      <code>
        .
      </code>
    </td>
    
    <td>
      Specify the working directory
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --logLevel=<silent|info|verbose>
      </code>
    </td>
    
    <td>
      
    </td>
    
    <td>
      Specify build-time log level
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --skipInstall
      </code>
    </td>
    
    <td>
      
    </td>
    
    <td>
      Skip npm install
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --skipConfig
      </code>
    </td>
    
    <td>
      
    </td>
    
    <td>
      Skip nuxt.config.ts update
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --dev
      </code>
    </td>
    
    <td>
      
    </td>
    
    <td>
      Install modules as dev dependencies
    </td>
  </tr>
</tbody>
</table>

The command lets you install [Nuxt modules](/modules) in your application with no manual work.

When running the command, it will:

- install the module as a dependency using your package manager
- add it to your [package.json](/docs/4.x/directory-structure/package) file
- update your [`nuxt.config`](/docs/4.x/directory-structure/nuxt-config) file

**Example:**

Installing the [`Pinia`](/modules/pinia) module

```bash [Terminal]
npx nuxt module add pinia
```

## nuxt module search

```bash [Terminal]
npx nuxt module search <QUERY> [--cwd=<directory>] [--nuxtVersion=<2|3>]
```

### Arguments

<table>
<thead>
  <tr>
    <th>
      Argument
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        QUERY
      </code>
    </td>
    
    <td>
      keywords to search for
    </td>
  </tr>
</tbody>
</table>

### Options

<table>
<thead>
  <tr>
    <th>
      Option
    </th>
    
    <th>
      Default
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        --cwd=<directory>
      </code>
    </td>
    
    <td>
      <code>
        .
      </code>
    </td>
    
    <td>
      Specify the working directory
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --nuxtVersion=<2|3>
      </code>
    </td>
    
    <td>
      
    </td>
    
    <td>
      Filter by Nuxt version and list compatible modules only (auto detected by default)
    </td>
  </tr>
</tbody>
</table>

The command searches for Nuxt modules matching your query that are compatible with your Nuxt version.

**Example:**

```bash [Terminal]
npx nuxt module search pinia
```



---

- Source
