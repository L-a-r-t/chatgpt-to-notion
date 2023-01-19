# ChatGPT to Notion
[ChatGPT to Notion](https://chrome.google.com/webstore/detail/chatgpt-to-notion/oojndninaelbpllebamcojkdecjjhcle) brings the cleverness of ChatGPT into your favorite app!

## Overview
For information about the extension itself more than the code behind it, check out [this notion page](https://theo-lartigau.notion.site/theo-lartigau/ChatGPT-to-Notion-af29d9538dca4493a15bb4ed0fde7f91). This extension was built using the [Plasmo framework](https://www.plasmo.com/) and Typescript. A simple Express server (hosted on a free Render webservice) that can be found on the "server" branch, it allows the secure long-term storage of Notion's access tokens.

## Motive
While some tools already exist to save a webpage to Notion, and some going as far as allowing the user to save the page's contents, these solutions fall short when trying to save a conversation with ChatGPT. As such, providing a specialized extension to do this work efficiently felt natural.

## Usage
On ChatGPT's page, you'll notice a new pin icon under each of its answers. You can use it to save specifically that answer and the related prompt to your Notion database of choice. If you want to save the whole discussion, you can do so from the extension popup.

You may link as many databases with the extension as you need to, and you can then choose which database to save your discussion at saving time. If a page with the same title already exists in the database, the newly saved content will be appended to the end of said page.

## Contribution
As this is my first time building a project that is open to contributions I will need a little time to sort things out and learn the best practices for great collaboration on GitHub. If you want to help (thanks!), please stay patient for a few days.

## Roadmap
These are the things that I plan to work on at some point. It might be a few weeks before these get implemented as I’m currently quite busy, but I hope to have the following (ranked by priority) done in the near future:

- [ ]  Saving to a page & not only to a database
- [ ]  Customize the page title upon saving
- [ ]  Add custom tags when saving
- [x]  Upgrade backend (free Render webservice, fixed by setting up a keepalive loop)
