# create nuxt

> The init command initializes a fresh Nuxt project.

```bash [Terminal]
npm create nuxt@latest [DIR] [--cwd=<directory>] [--logLevel=<silent|info|verbose>] [-t, --template] [-f, --force] [--offline] [--preferOffline] [--no-install] [--gitInit] [--shell] [--packageManager] [-M, --modules] [--no-modules] [--nightly]
```

The `create-nuxt` command initializes a fresh Nuxt project using unjs/giget.

## Arguments

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
        DIR=""
      </code>
    </td>
    
    <td>
      Project directory
    </td>
  </tr>
</tbody>
</table>

## Options

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
        -t, --template
      </code>
    </td>
    
    <td>
      
    </td>
    
    <td>
      Template name
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        -f, --force
      </code>
    </td>
    
    <td>
      
    </td>
    
    <td>
      Override existing directory
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --offline
      </code>
    </td>
    
    <td>
      
    </td>
    
    <td>
      Force offline mode
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --preferOffline
      </code>
    </td>
    
    <td>
      
    </td>
    
    <td>
      Prefer offline mode
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --no-install
      </code>
    </td>
    
    <td>
      
    </td>
    
    <td>
      Skip installing dependencies
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --gitInit
      </code>
    </td>
    
    <td>
      
    </td>
    
    <td>
      Initialize git repository
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --shell
      </code>
    </td>
    
    <td>
      
    </td>
    
    <td>
      Start shell after installation in project directory
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --packageManager
      </code>
    </td>
    
    <td>
      
    </td>
    
    <td>
      Package manager choice (npm, pnpm, yarn, bun)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        -M, --modules
      </code>
    </td>
    
    <td>
      
    </td>
    
    <td>
      Nuxt modules to install (comma separated without spaces)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --no-modules
      </code>
    </td>
    
    <td>
      
    </td>
    
    <td>
      Skip module installation prompt
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        --nightly
      </code>
    </td>
    
    <td>
      
    </td>
    
    <td>
      Use Nuxt nightly release channel (3x or latest)
    </td>
  </tr>
</tbody>
</table>

## Environment variables

- `NUXI_INIT_REGISTRY`: Set to a custom template registry. (learn more).

  - Default registry is loaded from nuxt/starter/templates



---

- Source
