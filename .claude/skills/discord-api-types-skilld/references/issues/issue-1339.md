---
number: 1339
title: Missing types in APIAuditLogChange union type
type: bug
state: closed
created: 2025-08-17
url: "https://github.com/discordjs/discord-api-types/issues/1339"
reactions: 0
comments: 0
labels: "[bug]"
---

# Missing types in APIAuditLogChange union type

### Issue description

I tried to filter the `safety_alerts_channel_id` key, but it seems that `APIAuditLogChangeKeySafetyAlertsChannelId` is not present in `APIAuditLogChange`


`APIAuditLogChangeKeySnowflake` is also missing, but I think this one is excluded on purpose as it would override all keys with `key: string` and break the discriminated union

### Code sample

```typescript
const change: APIAuditLogChange = {
  key: "safety_alerts_channel_id", // Error: Type '"safety_alerts_channel_id"' is not assignable to type '"$add" | "$remove" | "actions" | "afk_channel_id" | "afk_timeout" | "allow" | "application_id" | "archived" | "asset" | "auto_archive_duration" | "available" | "available_tags" | ... 75 more ... | "widget_enabled"'.ts(2322)
  new_value: "123",
  old_value: "456",
};
```
...