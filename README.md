# notion-sdk-typescript-starter

This is a template repository for getting started with the [Notion SDK](https://github.com/makenotion/notion-sdk-js)
and [TypeScript](https://www.typescriptlang.org/).

To use this template, click the big green "Use this template" button in the upper-right corner. After some questions,
GitHub will create a new clone under your account, and then you can get started customizing.

## Features

- TypeScript for type checking.
- [Prettier](https://prettier.io/) for code formatting.
- A minimal GitHub Actions workflow that typechecks your code.
- [Dotenv](https://www.npmjs.com/package/dotenv) for configuring your Notion API token.
- [Dependabot](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuring-dependabot-version-updates)
  for ensuring your (and this template's!) dependencies are up to date.
- Our lovely Notion SDK!

## What to do after duplicating

1. Make sure you've [created a Notion integration](https://developers.notion.com/docs/getting-started) and have a secret Notion token.
2. Add your Notion token to a `.env` file at the root of this repository: `echo "NOTION_TOKEN=[your token here]" > .env`.
3. Run `npm install`.
4. Edit the `database_id` in `index.ts` from FIXME to be any database currently shared with your integration.
5. Run `npm start` to run the script.

Now you can head over to our [developer documentation](https://developers.notion.com/) for more information on using the Notion API!

## NPM Scripts

This template has a few built-in NPM scripts:

| Script              | Action                                                                                                                                                                          |
| - | - |
| `npm start`         | Run `index.ts`.                                                                                                                                                                 |
| `npm run typecheck` | Type check using the TypeScript compiler.                                                                                                                                       |
| `npm run format`    | Format using Prettier (also recommended: the [Prettier VS Code extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) if you're using VS code.) |
| `npm run build`     | Build JavaScript into the `dist/` directory. You normally shouldn't need this if you're using `npm start`.                                                                      |
