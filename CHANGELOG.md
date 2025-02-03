# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0-alpha.66] - 2025-02-03

### 🚜 Refactor

- *(handlers)* Add batching logic to `queue.sendBatch`

## [1.0.0-alpha.65] - 2025-01-31

### 🚀 Features

- *(handlers)* Add retry logic to starter pack updates

## [1.0.0-alpha.64] - 2025-01-31

### 🐛 Bug Fixes

- *(starter-pack-handler)* Prevent updates with no voters

### 🚜 Refactor

- *(warpcast)* Simplify request payload structures

## [1.0.0-alpha.63] - 2025-01-26

### ⚙️ Miscellaneous Tasks

- *(config)* Add `LOG_LEVEL` variable to `vars`

## [1.0.0-alpha.62] - 2025-01-26

### 🚀 Features

- *(warpcast)* Add `StarterPack` interface
- *(warpcast)* Add `connectedAccounts` to user type
- *(warpcast)* Add `PATCH` method to `HttpRequestMethod`
- *(warpcast)* Add `getUserByFid` to fetch user by FID
- *(warpcast)* Add `getStarterPacks` function
- *(warpcast)* Add `getStarterPackUsers` function
- *(warpcast)* Add `getStarterPack` function
- *(warpcast)* Add `createStarterPack` function
- *(warpcast)* Add `updateStarterPack` function
- *(handlers)* Add `starterPackHandler` for starter packs
- *(scheduled-handler)* Add `starterPackHandler` to scheduler

### 🐛 Bug Fixes

- *(cache-handler)* Correct time range calculation
- *(scheduled-handler)* Adjust `starterPackHandler` timing

### 🚜 Refactor

- *(warpcast)* Simplify `getUserByUsername` implementation
- *(logger)* Update configuration based on env

## [1.0.0-alpha.61] - 2025-01-24

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.60] - 2025-01-21

### 🚜 Refactor

- *(scheduled-handler)* Replace `console.log` with `logger`

### ⚙️ Miscellaneous Tasks

- *(deploy)* Remove deploy workflow
- *(config)* Disable `workers_dev` in `wrangler.toml`

## [1.0.0-alpha.59] - 2025-01-21

### 🚀 Features

- *(logger)* Add `asObject` option to logger configuration

### ⚙️ Miscellaneous Tasks

- *(build)* Remove unused test step in GitHub Actions
- *(husky)* Comment out `pnpm test` in pre-commit hook

## [1.0.0-alpha.58] - 2025-01-20

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.57] - 2025-01-15

### 🐛 Bug Fixes

- *(cache-handler)* Adjust time range calculation to 3 years

## [1.0.0-alpha.56] - 2025-01-15

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.55] - 2025-01-10

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.54] - 2025-01-07

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.53] - 2025-01-04

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.52] - 2024-12-25

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.51] - 2024-12-19

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.50] - 2024-12-11

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.49] - 2024-12-09

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.48] - 2024-12-03

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.47] - 2024-11-23

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies (#429)

## [1.0.0-alpha.46] - 2024-10-29

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.45] - 2024-10-16

### 🚀 Features

- *(warpcast)* Add `getChannelFollowers` function
- *(warpcast)* Update `Bio` and `ViewerContext` interfaces
- *(warpcast)* Add `getChannelUsers` to fetch channel users
- *(services)* Add `canSendDirectCasts` and `hasUploadedInboxKeys`
- *(warpcast)* Extend `getUserByUsername` result object
- *(handlers)* Add responder tracking to KV store

## [1.0.0-alpha.44] - 2024-10-15

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.43] - 2024-10-15

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.42] - 2024-10-13

### ⚙️ Miscellaneous Tasks

- *(config)* Enable Workers Logs in `wrangler.toml`

## [1.0.0-alpha.41] - 2024-10-01

### 🚀 Features

- *(cache-handler)* Add debug logs for fetching data
- *(logger)* Add custom logging utility
- *(events-handler)* Integrate logging with `logger`
- *(handlers)* Add logging to direct casts handler
- *(proposal-handler)* Add logging for proposal process
- *(reminder-handler)* Add logging to reminder process

### 🚜 Refactor

- *(cache-handler)* Replace `Promise.all` with `for` loop
- *(cache-handler)* Implement `logger` for better logging
- *(channel-handler)* Replace `logDebug` with `logger`
- *(cache-handler)* Improve logging messages
- *(events-handler)* Use `cacheKey` for consistency
- *(queue-handler)* Integrate `logger` for logging

## [1.0.0-alpha.40] - 2024-10-01

### 🚀 Features

- *(warpcast)* Add `cast` function for creating new casts

### 🚜 Refactor

- *(cache-handler)* Modularize data fetching functions
- *(cache-handler)* Streamline cache key usage
- *(cache-handler)* Optimize data fetching logic

### ⚡ Performance

- *(cache-handler)* Parallelize data fetching

## [1.0.0-alpha.39] - 2024-09-28

### 🚀 Features

- *(services)* Add timestamp filter for `getFeedItems`
- *(channel-handler)* Add `getRecentFeedItems` function
- *(channel-handler)* Add debug logging
- *(channel-handler)* Add user like check before recasting

### 🚜 Refactor

- *(warpcast)* Rename optional param in `getFeedItems`

## [1.0.0-alpha.38] - 2024-09-27

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.37] - 2024-09-20

### 🚀 Features

- *(warpcast)* Enhance `filter` with new options
- *(warpcast)* Expand category types in `getDirectCastConversations`
- *(handlers)* Add message handling to `directCastsHandler`

### 🚜 Refactor

- *(handlers)* Rename `subscribersHandler` to `handleSubscribers`
- *(channel-handler)* Rename channel handler functions

## [1.0.0-alpha.36] - 2024-09-18

### 🚀 Features

- *(scheduled-handler)* Add `channelHandler` to cron jobs

### 🐛 Bug Fixes

- *(reminder-handler)* Correct timestamp conversion

### 🚜 Refactor

- *(scheduled-handler)* Remove 30-min cron job

## [1.0.0-alpha.35] - 2024-09-18

### 🐛 Bug Fixes

- *(reminder-handler)* Handle undefined `endBlockTimestamp`

### 🚜 Refactor

- *(events-handler)* Rename `farcasterUsers` to `farcasterVoters`

## [1.0.0-alpha.34] - 2024-09-15

### 🧪 Testing

- *(index)* Add `@ts-expect-error` for testing purposes

### ⚙️ Miscellaneous Tasks

- *(cache-handler)* Import `luxon` and update `startBlock`
- *(vitest)* Rename config file to TypeScript

## [1.0.0-alpha.33] - 2024-09-14

### ⚙️ Miscellaneous Tasks

- *(config)* Comment out `smart` mode in `placement`

## [1.0.0-alpha.32] - 2024-09-14

### 🚀 Features

- *(queue-handler)* Add exponential backoff for retries
- *(handlers)* Add events handler for scheduled notifications
- *(lilnouns)* Add `fetchVoters` function to retrieve voters
- *(cache)* Integrate Farcaster voters caching

### 🐛 Bug Fixes

- *(queue-handler)* Adjust retry backoff delay
- *(queue-handler)* Add error handling for failed casts
- *(cache-handler)* Remove debug `console.log` statement
- *(cache-handler)* Update `startBlock` calculation

### 🚜 Refactor

- *(queue-handler)* Improve code readability and formatting
- *(reminder-handler)* Rename `farcasterDelegates` to `farcasterVoters`

### ⚙️ Miscellaneous Tasks

- *(config)* Enable smart placement in `wrangler.toml`

## [1.0.0-alpha.31] - 2024-09-11

### 🚀 Features

- *(reminder-handler)* Batch process direct cast messages

### 🎨 Styling

- *(proposal-handler)* Fix object formatting inconsistencies

## [1.0.0-alpha.30] - 2024-09-11

### 🚀 Features

- *(handlers)* Add `queueHandler` to process queue messages
- *(handlers)* Add direct cast task processing

### 🎨 Styling

- *(lint-staged)* Reorder `prettier` and `eslint` tasks

### ⚙️ Miscellaneous Tasks

- *(queue)* Enable `lilnouns-mod` producer and consumer
- *(workers)* Add `QUEUE` to `Env` interface

## [1.0.0-alpha.29] - 2024-09-05

### 🚜 Refactor

- *(handlers)* Use `try/await` syntax for `sendDirectCast`

## [1.0.0-alpha.28] - 2024-09-05

### 🚀 Features

- *(scheduled-handler)* Add new daily 14:00 cron job

## [1.0.0-alpha.27] - 2024-09-05

### 🚀 Features

- *(proposal-handler)* Add reminder for close to deadline

### 🚜 Refactor

- *(handlers)* Extract `toRelativeTime` function
- *(proposal-handler)* Replace `await` with `then` for `sendDirectCast`

## [1.0.0-alpha.26] - 2024-09-05

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.25] - 2024-09-01

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.24] - 2024-08-28

### ⚙️ Miscellaneous Tasks

- *(docs)* Update badge URLs in `README.md`

## [1.0.0-alpha.23] - 2024-08-28

### 🚀 Features

- *(lilnouns)* Add `getNounsForAddress` to fetch Nouns by address

### 📚 Documentation

- Create a new `LICENSE` file
- *(readme)* Add experimental phase warning

## [1.0.0-alpha.22] - 2024-08-13

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.21] - 2024-08-10

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

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
