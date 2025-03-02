### 2.0.1

Fixes

- Rendering issues on various websites caused by rampant content scripts (they weren't contained to their respective pages)

# 2.0.0

Features

- Now supports different LLM families! Currently supported LLM providers are :
  - ChatGPT
  - Deepseek
  - Claude
  - Mistral
- More LLM providers will be added in the future, missing features such as autosave (or history save for Mistral's Le Chat) will be added soon

Fixes

- The pin is back on ChatGPT! 


## 1.11.0

Features

- Canvas support

Fixes

- Various save bugs

## 1.10.0

Features

- Save progress bar

Fixes

- The pin is back!

### 1.9.1

Fixes

- Only saving the last opened conversation when using ChatGPT accross multiple tabs, now saves the current active conversation

## 1.9.0

Features

- Eco-friendly mode
- Open saved page in Notion
- KaTeX notation support

Fixes

- Improper handling of prompts with multiple line jumps
- Edge case where save would fail on a brand new conversation

### 1.8.4

Fixes

- Being prompted to refresh the page over and over when trying to save an individual answer
- Rare issue with very long paragraphs (>2000 words) causing the save to fail

### 1.8.3

Fixes

- Save error when saving to a database that doesn't have tags
- Impossibility to save an individual answer

### 1.8.2

Fixes

- Save error when saving a complete chat
- Rare case where save would fail until the user refreshes the page

Misc

- Refactored the storage logic to be more fool-proof

### 1.8.1

Fixes

- Fixed overall broken extension issue caused by a major update in ChatGPT's frontend

Misc

- Extension now solely relies on OpenAI's backend for saving, in hopes of it being more resilient to future changes from OpenAI
- A refactor is on it's way to scrape off all code that was related to past extension's logic

## 1.8.0

Features

- Complete conversation history save (premium)
- More comprehensive support of code interpreter & dall-e
- Japanese locale support

Fixes

- Autosave is back & more resilient than ever
- Many small fixes

### 1.7.1

Fixes

- Broken individual chat save because of a change in ChatGPT's frontend

## 1.7.0

Features

- Improved support of code interpreter

Fixes

- Truncated save when using ChatGPT code interpreter
- Failing save when answer includes a table in specific cases
- Failing save when ChatGPT returns a downloadable file

### 1.6.2

Misc

- Added a redirect to an onInstalled page on first extension install

### 1.6.1

Fixes

- 1.6.0 made the extension unusable because of an artefact of the refactoring process that shouldn't have been commited, this release fixes that

## 1.6.0

Features

- Can now save from a context menu (right click on the page)

Fixes

- Fixed the "Receiving end does not exist" error
- Various small fixes

Misc

- Started refactoring the codebase to make it more maintainable & easier to document

### 1.5.2

Fixes

- Fixed two rare bugs that caused saving to fail

Misc

- Updated the sponsor (is now a prompt to leave a rating)
- I've been busy with a few urgent matters lately, will try to make a new feature release every 2 weeks for the next 2 months

### 1.5.1

Fixes

- Free trial for autosave can be activated without going on Gumroad & entering payment info

## 1.5.0

Features

- New autosave feature (on premium subscription)
- Added a $2/month premium subscription to support the extension's development
  Please take note that the majority of future features (including important ones) will be available to all nontheless, and previously premium features may become free in the future as more things are added

Fixes

- Fixed a bug where the extension would crash when in the settings popup
- More robust handling of errors
- Clearer error messages
- Small visual & typo fixes

## 1.4.0

Features

- More control over the generated page's title when saving an individual answer (conversation title, prompt, or custom)
- More control over saving conflicts (choose between overwriting, appending, or renaming current conversation)

Fixes

- Sponsored image when saving an individual answer now redirects properly
- Refactored the saving logic to be more customizable (thus the new features) and less monolithic

### 1.3.6

Fixes

- Pin icon & individual saving now works again (was broken by a change to ChatGPT's frontend)

### 1.3.5

Misc

- Added sponsored content in non instrusive spots (post successful save, the extension DOES NOT collect any data for this, more info in the FAQ)
- Updated the type definition for "ToBeSaved"

### 1.3.4

Fixes

- Targets the new ChatGPT url, and should now be future-proof in that regard

Misc

- Bump lockfile version to 6.0

### 1.3.3

Fixes

- Handles very, very long prompts properly
- Makes less API calls when saving a conversation
- Handles the "no database found" case in a clearer way

Misc

- Hides the saved prompt under a toggle heading by default

### 1.3.2

Fixes

- Syntax highlighting finally works as expected in the generated Notion page
- New generated page icon (previous link was dead)

### 1.3.1

Fixes

- No longer fails to save individual answers when generating headers & table of contents

Misc

- Pin icon now matches the color theme

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
