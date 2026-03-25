---
number: 5929
title: 500 Server Error when querying Nuxt UI MCP tools
type: bug
state: closed
created: 2026-01-24
url: "https://github.com/nuxt/ui/issues/5929"
reactions: 16
comments: 4
labels: "[bug, documentation, v4, p2-medium]"
---

# 500 Server Error when querying Nuxt UI MCP tools

### Environment

 - MCP Server: nuxt-ui  
 - MCP Config:
<img width="651" height="227" alt="Image" src="https://github.com/user-attachments/assets/b86a60a4-2bc5-480f-b87b-5ee37897e681" />

### Is this bug related to Nuxt or Vue?

Vue

### Package

v4.x

### Version

v4.4

### Reproduction

Ask claude code to use the MCP server.

  1. Call any MCP tool (e.g., `list-components` or `get-component`)                      
  2. Observe the 500 error response   

### Description

All MCP tools are returning 500 Server Error when attempting to query the Nuxt UI documentation.

### Additional context

<img width="1529" height="237" alt="Image" src="https://github.com/user-attachments/assets/4428bdb8-56f3-47c6-8b16-715a66321162" />

### Error Details                                                                       
                                                                                         
  [POST]                                                                                 
  "/__nuxt_content/docs/query?v=v3.5.0--Ht7nVR8Lj1j1xJexCWz2MaUzCP-zpmoRwGDR4DKRgho": 500
   Server Error 

---

## Top Comments

**@benjamincanac** [maintainer] (+4):

Should be fixed!

**@benjamincanac** [maintainer]:

Indeed, it seems to be an upstream issue with latest `@nuxt/content` in production. @farnabaz @HugoRCD are you aware of this?

**@HugoRCD** [maintainer]:

@benjamincanac I'm not aware of that, I'll look into it, but maybe downgrade `@nuxt/content` as a workaround in the meantime?