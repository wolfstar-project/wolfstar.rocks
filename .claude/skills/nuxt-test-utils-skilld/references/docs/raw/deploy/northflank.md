# Northflank

> Deploy your Nuxt Application to Northflank infrastructure.

Nuxt supports deploying on Northflank with minimal configuration.

## Setup

1. Link your Git provider and create a new project in Northflank.
2. In your project, create a Service and connect it to your Nuxt repository.
3. Ensure your package.json includes a start script that runs the Nuxt production server.

```json [package.json]
{
  "scripts": {
    "start": "node .output/server/index.mjs"
  }
}
```

1. Click "Create Service" to build and deploy your Nuxt app.

<read-more target="_blank" to="https://northflank.com/docs">

For more information, refer to the **Northflank documentation**.

</read-more>
