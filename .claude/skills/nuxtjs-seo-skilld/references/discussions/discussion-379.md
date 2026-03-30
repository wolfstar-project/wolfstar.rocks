---
number: 379
title: Breadcrumbs on nested routes
category: "Q&A"
created: 2025-01-16
url: "https://github.com/harlan-zw/nuxt-seo/discussions/379"
upvotes: 1
comments: 0
answered: false
---

# Breadcrumbs on nested routes

Hey there,

lets assume I got these nested routes:


```
├── dashboard.vue
├── index.vue
├── project
│   ├── [project_id]
│   │   ├── index.vue
│   │   ├── team
│   │   │   └── index.vue
│   │   ├── team.vue
│   │   ├── task
│   │   │   ├── [task_id]
│   │   │   │   ├── index.vue
│   │   │   ├── [task_id].vue
│   │   │   └── index.vue
│   │   └── task.vue
│   ├── [project_id].vue
│   └── index.vue
├── project.vue
└── signup.vue

```

The goal is 

- to have a project overview that lists all projects 
- to have an overview of tasks and the team on the project overview page

So if I open `http://web.example.test/project/01JHJQ0SCSYEZCJRJ2YM0B2NGJ/task`, I can see the tasks that belong to the project.

That works nice. 

But in the breadcrumbs component, th...