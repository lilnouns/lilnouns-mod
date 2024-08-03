# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0-alpha.20] - 2024-08-03

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.19] - 2024-08-03

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.18] - 2024-08-02

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.17] - 2024-07-27

### 🚜 Refactor

- *(dayjs)* Remove `dayjs` library from codebase

## [1.0.0-alpha.16] - 2024-07-22

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.15] - 2024-07-17

### 🚜 Refactor

- *(proposal-handler)* Replace `dayjs` with `luxon` for time relative calculations

### 🎨 Styling

- *(warpcast)* Remove trailing commas and semicolons

## [1.0.0-alpha.14] - 2024-07-17

### 🚜 Refactor

- *(warpcast)* Use `first` from remeda to access error message
- *(cache-handler)* Optimize data handling with remeda methods
- *(cache-handler)* Streamline user data retrieval from farcaster
- *(direct-casts-handler)* Streamline subscribers update logic
- *(proposal-handler)* Optimize proposal and voter processing

## [1.0.0-alpha.13] - 2024-07-16

### 🐛 Bug Fixes

- *(cache-handler)* Remove unnecessary console.log

### 🚜 Refactor

- Centralize dayjs configuration in separate module
- Update import statement to match renamed file
- Update `getDirectCastConversations` function comments
- *(warpcast)* Update error handling in `fetchResponse`
- *(cache-handler)* Simplify data fetching and storage
- *(channel-handler)* Simplify retrieval and use of `farcasterUsers`
- *(proposal-handler)* Simplify user and subscriber fetching
- *(handlers)* Improve direct casts subscriber handling
- *(channel-handler)* Simplify `farcasterUsers` variable assignment

## [1.0.0-alpha.12] - 2024-07-14

### 🚀 Features

- *(lilnouns)* Add function to fetch votes by proposal
- *(ethereum)* Add `publicClient` and `getBlockTimestamp` function
- *(ethereum)* Add function to get current block number
- *(lilnouns)* Add function to fetch proposals from GraphQL
- *(ethereum)* Update `getBlockTimestamp` to handle latest block
- *(proposal-handler)* Implement proposal handling logic
- *(warpcast)* Add direct cast sending function
- *(proposal-handler)* Add direct cast message sending functionality
- *(scheduled-handler)* Add support for 30-minute intervals
- *(proposal-handler)* Add delay function from unicorn-magic
- *(proposal-handler)* Implement `sendDirectCast` call
- *(proposal-handler)* Add user verification and casting

### 🚜 Refactor

- Replace hardcoded api url with environment variable
- *(lilnouns)* Wrap `fetchDelegates` and `fetchAccounts` results in objects
- *(ethereum)* Parse block number to number type
- *(ethereum)* Replace global public client with a function
- *(direct-casts-handler)* Change subscribers type to object array
- *(scheduled-handler)* Add import for `cacheHandler`
- *(direct-casts-handler)* Filter out duplicate subscribers efficiently
- Reorder imports in scheduled-handler
- Update scheduled-handler to run `proposalHandler` every 5 minutes
- Update cron scheduling and handlers
- *(proposal-handler)* Remove admin specific logic
- *(proposal-handler)* Update proposal filter logic and remove direct cast

### 📚 Documentation

- Enhance jsdocs for `fetchDelegates` and `fetchAccounts` functions

### 🧪 Testing

- Update cron schedule in index spec
- Update cron expression in scheduled controller test

### ⚙️ Miscellaneous Tasks

- *(worker)* Add Alchemy API key to environment interface
- Ignore minor version updates for vitest
- *(deploy)* Add warpcast and alchemy API keys
- *(wrangler)* Update cron triggers schedule

## [1.0.0-alpha.11] - 2024-07-07

### 🚀 Features

- *(handlers)* Add `cacheHandler` to scheduled tasks
- *(channel-handler)* Add `nounsChannelHandler` function

### 🚜 Refactor

- *(channel-handler)* Replace main handler with `lilnounsChannelHandler`
- *(proposal-handler)* Simplify by removing unused code

## [1.0.0-alpha.10] - 2024-07-07

### 🚀 Features

- *(direct-casts-handler)* Add categories to `directCastsHandler`

## [1.0.0-alpha.9] - 2024-07-04

### ⚙️ Miscellaneous Tasks

- Update cron job schedule in wrangler configuration

## [1.0.0-alpha.8] - 2024-07-04

### 🚀 Features

- *(warpcast)* Add conversation interface and direct cast conversations retrieval
- *(direct-casts-handler)* Add new handler for direct casts
- *(scheduled-handler)* Add `directCastsHandler` to cron schedules
- *(warpcast)* Add message interface

### 🚜 Refactor

- *(warpcast)* Change order and optional status of parameters in `getDirectCastConversations`
- Update data logging in `directCastsHandler`
- *(direct-casts-handler)* Simplify import and update subscribers data
- *(direct-casts-handler)* Destructure participants from conversation
- *(scheduled-handler)* Update cron schedule calls

### 📚 Documentation

- Update `README` description and motivation
- *(direct-casts-handler)* Update comment for `directCastsHandler` function

## [1.0.0-alpha.7] - 2024-07-01

### 🚀 Features

- *(warpcast)* Implement recast function for warpcast service
- *(channel-handler)* Add recast functionality for feed items

### 🚜 Refactor

- *(channel-handler)* Improve readability of conditionals

## [1.0.0-alpha.6] - 2024-06-27

### 🚀 Features

- *(warpcast)* Add verification type and fetching function
- *(warpcast)* Add `getFollowers` function
- *(warpcast)* Enhance `getFollowers` function with pagination and limit args
- *(warpcast)* Add new function to fetch user following
- *(warpcast)* Add `getMe` function to retrieve user info
- *(warpcast)* Add `getUserByUsername` function
- *(warpcast)* Add `getUserByVerification` method
- *(warpcast)* Add `getCollectionOwners` function
- *(warpcast)* Add collection interface and user collection retrieval function

### 🚜 Refactor

- *(warpcast)* Change `fetchResponse` key type to unknown
- *(warpcast)* Simplify response handling
- *(warpcast)* Optimize fetch followers loop

### ⚙️ Miscellaneous Tasks

- *(build)* Replace Jest with Vitest for executing tests

## [1.0.0-alpha.5] - 2024-06-24

### 🧪 Testing

- Adjust cron timing in scheduling tests

### ⚙️ Miscellaneous Tasks

- *(deploy)* Enable warpcast access token in deployment workflows

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
