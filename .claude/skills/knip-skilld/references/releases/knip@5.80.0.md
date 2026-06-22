---
tag: "knip@5.80.0"
version: 5.80.0
published: 2026-01-05
name: Release 5.80.0
---

# Release 5.80.0

* Edit docs (d6f33a51)
* Only try to use tsconfig files if tsconfig.json exists (707c96db)
* Also create comment for commits that close an issue (3485d677)
* Plugin for Parcel (#1438) (24d81313) - thanks @AlexanderKaran!
* Edit "Knip for Editors & Agents" (e031018e)
* Timerify `hasRefsInFile` (#1435) (c6fa5e47)
* Fixes #1436 - Make stderr redirection platform-agnostic (#1437) (61305e74) - thanks @ClementValot!
* Refactor `isReferenced` and `hasStrictlyNsReferences` to better express intent (fa23a330)
* Fix up and reuse base graph objects in tests (ddc66932)
* Rename file node key to `importedBy`, and then some.. (cabee8e6)
* Refactor `hasStrictlyNsReferences` (resolve #1427) (0768c8a5)
* Replace entry symbol in trace output (circle → enter) (a7bc12b6)
* Add comments to module graph types (9971d476)
* Work + comment release script (e8486156)