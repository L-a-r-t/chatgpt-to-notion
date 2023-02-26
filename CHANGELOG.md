## 1.3.0

Features

- Option to generate headings & table of contents or not upon saving
- Generated table of contents is now inside a toggleable block

Fixes

- Improved handling of code blocks
- Improved handling of errors (shows a message if the token is revoked by Notion, more links to the FAQ...)

Misc

- Extended the FAQ

### 1.2.4

Fixes

- Issue where saving a very long prompt (> 2000 characters) would fail

### 1.2.3

Fixes

- Now able to save long conversations in one batch

Misc

- Added a link to the FAQ in the extension's popup

### 1.2.2

Fixes

- More explainers related to extension usage
- Default tag option is now no tag
- Show an error message when saving fails (yes, that wasn't the case already)

Misc

- Enabled null type checking (wasn't enabled yet because it isn't supported yet by Plasmo & the Notion SDK)

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

- Refactored some logic into its own functions

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
