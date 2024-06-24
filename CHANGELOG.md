# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0-alpha.4] - 2024-06-24

### 🚀 Features

- *(warpcast)* Add support for liking a cast
- *(worker-config)* Add warpcast config variables
- *(warpcast)* Add `fetchRequest` function and related types
- *(warpcast)* Add `getCastLikes` function
- *(channel-handler)* Add conditions for liking content

### 🚜 Refactor

- Change import path for `scheduledHandler`
- *(handlers)* Use switch statement for cron schedule
- Move warpcast service types to separate file
- *(warpcast)* Reorder variables in `fetchFeedItems`
- *(channel-handler)* Use likeCast function instead of console log
- *(warpcast)* Simplify `likeCast` function
- Pass environment to `likeCast` function
- *(warpcast)* Remove unnecessary eslint disable comment
- *(warpcast)* Remove unnecessary eslint disable comment
- Use nullish coalescing in warpcast service
- *(warpcast)* Update API endpoint for like cast
- Remove `configs` module and access env vars directly
- Replace `fetchFeedItems` function with `getFeedItems`
- Change `getFeedItems` to arrow function in warpcast service

### 📚 Documentation

- *(warpcast)* Enhance the fetchRequest function documentation
- *(warpcast)* Add docs for method to fetch warpcast likes

### 🎨 Styling

- Set maximum line length

### ⚙️ Miscellaneous Tasks

- *(vitest)* Increase test timeout

## [1.0.0-alpha.3] - 2024-06-19

### 🚀 Features

- Add delegate fetching functionality to lilnouns service
- *(handlers)* Extract delegate fetching to a separate function
- *(warpcast)* Add multiple interfaces for warpcast service
- *(warpcast)* Add `fetchFeedItems` function
- *(handlers)* Add new `channelHandler` and integrate into `scheduledHandler`

### 🚜 Refactor

- Simplify condition in fetch accounts service
- Replace `fetchAccounts` with `fetchDelegates` for data collection
- *(index)* Extract scheduled function from default export
- *(handlers)* Move `scheduledHandler` to new handlers module
- *(handlers)* Add specific author and reaction count logging
- Replace `type` with `interface` for data structures in lilnouns services
- *(warpcast)* Change `FetchFeedItemsArgs` from type to interface
- Update formatting of `scheduledHandler` call in index
- *(warpcast)* Simplify return statement in `fetchFeedItems`
- *(warpcast)* Convert response status to string in `fetchFeedItems` error message
- Change `project` to `projectService` in eslint config

### 📚 Documentation

- Add `README.md` with project information and badges
- Add missing function documentation comments

### 🧪 Testing

- Add eslint disable line for empty interface in module
- Remove unnecessary eslint-disable comment in `cloudflare:test` module
- Change interface to type in env module
- Ignore `expect-expect` eslint rule for specific test

### ⚙️ Miscellaneous Tasks

- *(husky)* Add pre-commit hook to run tests
- *(scripts)* Add `prepare` script with husky
- *(husky)* Add lint-staged command to pre-commit hook
- Add lint-staged configuration for auto-formatting
- *(prettier)* Add `prettier-plugin-packagejson` to plugins
- *(lint-staged)* Add toml files to prettier formatting
- *(prettier)* Reorder and add prettier plugins
- *(tsconfig)* Enable paths option for module import shortcuts
- *(vitest)* Add resolve alias to vitest configuration
- *(eslint)* Switch eslint configuration to flat config
- *(eslint)* Add file and folder ignore patterns
- *(eslint)* Spread prettierConfig in eslint configuration
- *(scripts)* Add eslint to npm scripts
- *(eslint)* Enhance configurations for better linting
- *(eslint)* Add eslint-plugin-regexp to configuration
- *(eslint)* Add vitest plugin configuration
- *(eslint)* Simplify rule configurations and module imports
- *(vitest)* Remove unnecessary type definition in vitest configuration

## [1.0.0-alpha.2] - 2024-06-09

### 🚀 Features

- Add fetch accounts functionality for lilnouns service

### 🚜 Refactor

- Update scheduled function and remove unnecessary comments
- Update scheduled method to fetch accounts at specific interval
- Reorder import statements in fetch accounts
- Switch to `GraphQLClient` for improved error handling
- Update account fetching conditions in lilnouns service

### ⚙️ Miscellaneous Tasks

- Add module type in `package.json`
- Adjust `moduleResolution` strategy in tsconfig
- Enable kv namespace in worker configuration
- Add directives, types, and inputs for GraphQL
- Update cron job scheduling in `wrangler.toml`
- Modify test script in `package.json`

## [1.0.0-alpha.1] - 2024-06-08

### 🚜 Refactor

- Replace let with const in api fetch

### 📚 Documentation

- Enable custom issue templates and disable blank issues
- Add funding information

### 🎨 Styling

- Improve code readability across multiple files

### ⚙️ Miscellaneous Tasks

- Add build script to `package.json`
- Configure dependabot for project
- Add stale issue handler configuration
- Add build pipeline for continuous integration
- Add deployment workflow for GitHub Actions
- Add git flow workflow to GitHub actions
- Update git-cliff configurations for commit processing

## [1.0.0-alpha.0] - 2024-06-08

### 🚜 Refactor

- Rename variable in scheduled function and modify export

### 🧪 Testing

- Add declaration module for cloudflare test environment
- Add unit test for scheduled handler

### ⚙️ Miscellaneous Tasks

- Remove `package-lock.json` file
- Update `.editorconfig` to use space indentation
- Add `.npmrc` file with `save-exact` flag
- Add git-cliff configuration file
- Add test script and dependencies section in `package.json`
- Update typescript compiler options in `tsconfig.json`
- Add vitest worker config for wrangler
- Add nodejs compatibility flag in wrangler configuration
- Update prettier configuration
- Add ESLint configuration file with particular rules

<!-- generated by git-cliff -->
