### 1.2.1

Fixes

- Handle case where a database doesn't have a URL property (was broken by 1.2.0)
- Add an explainer when search couldn't find any databases
- Make the refresh function more robust

## 1.2.0

Features

- Support for page tags on saving

Fixes

- Clearer error message when a DB doesn't have an URL property
- Refreshes stored databases each time the background worker is launched (stays up to date w/ user's Notion workspace)

Misc

- Refactor some logic into its own functions

### 1.1.2

Fixes

- Don't save to databases that don't have an URL property
- Fix edge cases on Notion authentication
- Fix error occuring when no databses are in storage

### 1.1.1

Fixes

- Search uses DB title property's id instead of its name

## 1.1.0

Features

- Improved authentication management
- Improved database search

Fixes

- Saving relies on DB properties ids instead of their names

# 1.0.0

- Intial release
