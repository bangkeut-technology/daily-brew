# Changelog

## [1.36.1](https://github.com/bangkeut-technology/daily-brew/compare/v1.36.0...v1.36.1) (2026-04-24)


### Bug Fixes

* Play Store badge icon and ajv dependency resolution ([ff89b03](https://github.com/bangkeut-technology/daily-brew/commit/ff89b03fda6bb67efe6149217119fe2b20560932))

## [1.36.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.35.1...v1.36.0) (2026-04-23)


### Features

* **support:** add image upload to support feedback form ([b027d6a](https://github.com/bangkeut-technology/daily-brew/commit/b027d6a3fa202ae833fe1726dd5821df4cfb9d98))
* **support:** add name and subject fields to support feedback form ([fc592c0](https://github.com/bangkeut-technology/daily-brew/commit/fc592c0606fa4da7e6caa0e965f11b17fa8ffccf))


### Bug Fixes

* **deps:** resolve ajv version conflict for webpack build ([1452497](https://github.com/bangkeut-technology/daily-brew/commit/14524974b87bf807ec8fea511a98491241e5fd50))

## [1.35.1](https://github.com/bangkeut-technology/daily-brew/compare/v1.35.0...v1.35.1) (2026-04-11)


### Bug Fixes

* **oauth:** use correct canonicalizeEmail() method in OAuthAuthenticationService ([d4ce0e5](https://github.com/bangkeut-technology/daily-brew/commit/d4ce0e54bb78e912eb2f4105a581587932a1cd50))

## [1.35.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.34.0...v1.35.0) (2026-04-11)


### Features

* **frontend:** add App Store download badge to landing, footer, and auth pages ([703254c](https://github.com/bangkeut-technology/daily-brew/commit/703254c0b86f4e6a0d55b5a0c2f22aa3aa0ec6aa))


### Bug Fixes

* **logging:** add action_level to fingers_crossed monolog handler ([ab1e883](https://github.com/bangkeut-technology/daily-brew/commit/ab1e8835e09fb17cb1d13d5f4c616ddd7af6c6b4))

## [1.34.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.33.2...v1.34.0) (2026-04-11)


### Features

* **account:** add `customName` to `AccountUser` and refactor current account handling ([2449080](https://github.com/bangkeut-technology/daily-brew/commit/2449080f3fe1977f7f5432362206888275e705ef))
* **account:** add evaluation-related entities and associations to `Account` ([5d22046](https://github.com/bangkeut-technology/daily-brew/commit/5d22046044e12688aa7100b3d378d0bf0cc75b70))
* **account:** add evaluation-related entities and associations to `Account` ([d50e713](https://github.com/bangkeut-technology/daily-brew/commit/d50e7130112dcd4c4389e949712037af3698397a))
* **account:** extend `Account` with attendance and employee associations ([7a10716](https://github.com/bangkeut-technology/daily-brew/commit/7a10716b8346e2af6c1445b5bbcd984625c64d2c))
* **account:** introduce `AccountUser` entity and associations ([411d618](https://github.com/bangkeut-technology/daily-brew/commit/411d618b78b6a59479b9f8915948832a6ba42559))
* **account:** introduce `AccountUser` entity and associations ([5f881db](https://github.com/bangkeut-technology/daily-brew/commit/5f881db09974b0bf479cae89cff5726f21f4af80))
* **account:** refactor `AccountUser` entity and update attendance batch handling ([33213cc](https://github.com/bangkeut-technology/daily-brew/commit/33213cc05b58330fdb7fd6ff58053fa8d24ec0ee))
* add abstract repository, workspace QR check-in, and reusable formatting utilities ([4a8d581](https://github.com/bangkeut-technology/daily-brew/commit/4a8d581a045e37daa2bfc184f8aa2055b886d538))
* add account deletion functionality and enhance authentication flow ([6889dc0](https://github.com/bangkeut-technology/daily-brew/commit/6889dc04656118d4aae6d886ccaf7d3fbb7ea1bd))
* add account deletion page and seed reviewer command ([ca4b6c1](https://github.com/bangkeut-technology/daily-brew/commit/ca4b6c120695b97a3184c463030d072fb183ba3b))
* add app logos and favicons for branding ([7748a1e](https://github.com/bangkeut-technology/daily-brew/commit/7748a1e572c80abe9c6936f32d9269f77a8d43c6))
* add billing toggle (monthly/annual) and dynamic pricing updates ([9bb9135](https://github.com/bangkeut-technology/daily-brew/commit/9bb91351bc79311871e19dd491e1b4092f460e75))
* add CI/CD pipeline with automated versioning and deployment ([b5267d0](https://github.com/bangkeut-technology/daily-brew/commit/b5267d0c37fca0183b692ac754b4f71cb89c8a3f))
* add contact email support and update dependencies ([2318bac](https://github.com/bangkeut-technology/daily-brew/commit/2318bacaf66a926c4e28e282758f492f0242652e))
* add dev-exclusive toggle plan endpoint and dashboard updates ([71ff7ce](https://github.com/bangkeut-technology/daily-brew/commit/71ff7ce8ebb4a68e52cabcd808e4cc6a7eb7e87e))
* add DTOs for structured entity data and guided tour for new users ([0730f45](https://github.com/bangkeut-technology/daily-brew/commit/0730f45ce3213bd3db987609d7b2f61b452585bc))
* add employee-user linking enhancements and improve workspace settings ([5d71e2e](https://github.com/bangkeut-technology/daily-brew/commit/5d71e2e173500f821e976177d5c4dd35fd1dd277))
* add Gantt chart support for employee evaluations ([650ecaa](https://github.com/bangkeut-technology/daily-brew/commit/650ecaaf0131ded80faad3f0d708c671d997bc63))
* add leave overlap validation, partial leave support, and UI enhancements ([8b5185c](https://github.com/bangkeut-technology/daily-brew/commit/8b5185c335c64d448469632418c7890e5997970e))
* add leave requests functionality and `cn` utility integration ([98025be](https://github.com/bangkeut-technology/daily-brew/commit/98025be1f5adf114f92be0800f9aa66c2153381d))
* add logging to Paddle webhook handling and subscription processing ([2930f28](https://github.com/bangkeut-technology/daily-brew/commit/2930f28d54df397637f576216c5ab0c8b549fc56))
* add overlapping validations for leave requests and closures ([44f2d68](https://github.com/bangkeut-technology/daily-brew/commit/44f2d68561d10e8a94ab0c92982d7f1fee2b074f))
* add paid leave management and attendance event handling ([d9323f0](https://github.com/bangkeut-technology/daily-brew/commit/d9323f0623f20a20159d4a9bea36934c98e90402))
* add PrivacyPolicyDialog and TermsAndConditionsDialog components ([5b333f5](https://github.com/bangkeut-technology/daily-brew/commit/5b333f5dcaca319af0b0a1be12101c5650f62c66))
* add push and email notifications for key events, daily summaries, and UI updates ([c3d23c0](https://github.com/bangkeut-technology/daily-brew/commit/c3d23c000fb0521f2e3c0dd28837d16d41a1fe5b))
* add PWA support and improve field accessibility ([9c35a4e](https://github.com/bangkeut-technology/daily-brew/commit/9c35a4e1c04bff2def6ade3362fc949e718bd208))
* add settings page route ([c391833](https://github.com/bangkeut-technology/daily-brew/commit/c391833e472fdb7b45e5b307c3f00fc0652058c2))
* add support for cancelling leave requests and enhance UI/UX ([7b09447](https://github.com/bangkeut-technology/daily-brew/commit/7b09447961cedb716ac80024bba7e75051a125d1))
* add timezone handling and improve check-in/check-out accuracy ([01d70d4](https://github.com/bangkeut-technology/daily-brew/commit/01d70d4e879706ab73801a8f678a7ded79c56460))
* add user registration event handling and subscriber ([372c83e](https://github.com/bangkeut-technology/daily-brew/commit/372c83e8f790a0c11016108b6eeb7041ecb7f0ae))
* **api-tokens:** introduce API token support for external integrations (e.g., BasilBook) ([570c0ed](https://github.com/bangkeut-technology/daily-brew/commit/570c0ed95a7eea4d42a6aa330b5fda285609f18d))
* **api:** add response interceptors for JWT handling and error retries ([8539105](https://github.com/bangkeut-technology/daily-brew/commit/85391059c7201f7849629d04a3d79e210a65dcd9))
* **api:** add WorkspaceInviteController with enhanced invite management ([aa689c6](https://github.com/bangkeut-technology/daily-brew/commit/aa689c65157e2fd84975dfd4b2090a790aa6f4d2))
* **api:** introduce structured error handling and workspace invite management ([6ad0ded](https://github.com/bangkeut-technology/daily-brew/commit/6ad0ded8f9acab5d5d913268ca2290265f902d2a))
* **assets:** add `Logo` component and SVG support ([11ec7f0](https://github.com/bangkeut-technology/daily-brew/commit/11ec7f0c1698d4b412e23967551a9bd0f58b626f))
* **attendance:** add `findUpcomingStatus` method and enhance upcoming attendance management ([17d91aa](https://github.com/bangkeut-technology/daily-brew/commit/17d91aab109f2b47318bcac58bb75f472eb5b2b3))
* **attendance:** add `getExistDatesByEmployeeAndPeriod` method and enhance attendance batch handling ([b4c8009](https://github.com/bangkeut-technology/daily-brew/commit/b4c80093ab8bcdd184ec06d12ddb2b3d588710d0))
* **attendance:** add `getExistDatesByEmployeeAndPeriod` method and enhance attendance batch handling ([873fa2f](https://github.com/bangkeut-technology/daily-brew/commit/873fa2f1bb4699ae71e26f33dd77169725f45ea3))
* **attendance:** add action buttons for view and edit in AttendanceBatchDataTable ([636eb01](https://github.com/bangkeut-technology/daily-brew/commit/636eb01e1ba743fe1d91d16f2d17642b1113fb68))
* **attendance:** add AttendanceBatch form and controller ([8882f99](https://github.com/bangkeut-technology/daily-brew/commit/8882f991e18015fb315e78e68122d46c83d3215c))
* **attendance:** add components for batch management and improve sign-in functionality ([2c07db3](https://github.com/bangkeut-technology/daily-brew/commit/2c07db3fc98e31c20fc61e2719bea8937ae0e042))
* **attendance:** add default employee selection and improve batch form handling ([2cc080b](https://github.com/bangkeut-technology/daily-brew/commit/2cc080b21e8b6f6d9d4c42022f9f4d41272b6aab))
* **attendance:** add delete functionality for attendance batches ([becb6c7](https://github.com/bangkeut-technology/daily-brew/commit/becb6c7d9402c8f9865afd9b9f7da89500b7747b))
* **attendance:** add dependencies and constructor to AttendanceBatchController ([fbc8ea5](https://github.com/bangkeut-technology/daily-brew/commit/fbc8ea5bd7521c48b45a8efe704f63ebfff21ef4))
* **attendance:** add duplicate attendance check and improve repository methods ([ac20606](https://github.com/bangkeut-technology/daily-brew/commit/ac20606e9237158b40827f3143033404cfab69a3))
* **attendance:** add edit functionality to AttendanceDialog ([cf6f63e](https://github.com/bangkeut-technology/daily-brew/commit/cf6f63e602b3462a65ab1b3eafb2fbedfc19aba5))
* **attendance:** add employee association to attendance batches ([60bfa55](https://github.com/bangkeut-technology/daily-brew/commit/60bfa55f141e69b7e0f4a9e8e363a82dbd3674e2))
* **attendance:** add employee selection to batch creation ([4e1e986](https://github.com/bangkeut-technology/daily-brew/commit/4e1e986706f648d16ec2b67d4a2f9025265ad430))
* **attendance:** add forward refs for dialogs and enhance QuickActions component ([6de91a6](https://github.com/bangkeut-technology/daily-brew/commit/6de91a6790ba78659e8fef63f45d8ede398851f3))
* **attendance:** add leave type support and automate paid/unpaid leave assignment ([f66db78](https://github.com/bangkeut-technology/daily-brew/commit/f66db78c5e35254f343341c2f3c7e546de2f87e1))
* **attendance:** add new employee attendance validation with detailed checks ([a9b40fa](https://github.com/bangkeut-technology/daily-brew/commit/a9b40fa60dd69784086d58cecdb450487c1b644c))
* **attendance:** add NewAttendanceDialog and QuickActions components ([1ac5926](https://github.com/bangkeut-technology/daily-brew/commit/1ac59269a1a1413d60e93a27c75ae01261ae8ada))
* **attendance:** add onDeleted handler for batch deletion ([51de3f1](https://github.com/bangkeut-technology/daily-brew/commit/51de3f1e86ff4dbe5d1d816379f5b487f669040c))
* **attendance:** add remaining paid leave calculation and rename `findStatus` to `findType` ([d9dfee9](https://github.com/bangkeut-technology/daily-brew/commit/d9dfee94297729cf8a5ad860899698dce5b92d21))
* **attendance:** add upcoming attendance batches feature ([c9fce73](https://github.com/bangkeut-technology/daily-brew/commit/c9fce732b3d09f2d0290130fee6d78c4e713a21a))
* **attendance:** add update functionality and enhance event handling ([57ff030](https://github.com/bangkeut-technology/daily-brew/commit/57ff0305cecc34eada4cadd4aa3e1b180846ae7a))
* **attendance:** add user association and period validation in `AttendanceBatch` workflows ([625a632](https://github.com/bangkeut-technology/daily-brew/commit/625a632fe60403485243d30a457b0fbe45a8af6f))
* **attendance:** enhance attendance and batch handling ([7b1fa58](https://github.com/bangkeut-technology/daily-brew/commit/7b1fa58b3d0b582cec281f4123cd18122907c105))
* **attendance:** enhance attendance data handling and update dependencies ([10e9416](https://github.com/bangkeut-technology/daily-brew/commit/10e941699b8ccc5b30c80e619fec3dd469e38b0d))
* **attendance:** enhance attendance flow with response and query changes ([c006e8e](https://github.com/bangkeut-technology/daily-brew/commit/c006e8e7aa63ba2dc916a1abf274681ebf228865))
* **attendance:** enhance AttendanceBatch features and introduce event handling ([a11781b](https://github.com/bangkeut-technology/daily-brew/commit/a11781bcc557f13267bd6609c1d23ec6d744fe65))
* **attendance:** enhance AttendanceBatch handling and improve repository methods ([8d2ed74](https://github.com/bangkeut-technology/daily-brew/commit/8d2ed74a681d7a6cf8903a1e51a9fc24faf8f343))
* **attendance:** enhance AttendanceBatch responses with localized messages and disable CSRF protection ([8008a28](https://github.com/bangkeut-technology/daily-brew/commit/8008a28784d6bcb2c10c06a295f5f67e10dadf04))
* **attendance:** enhance batch handling with new attendance methods ([1db09e5](https://github.com/bangkeut-technology/daily-brew/commit/1db09e56f3243605e625ac9edef38d8bc6432094))
* **attendance:** enhance batch management and add new components ([342a83d](https://github.com/bangkeut-technology/daily-brew/commit/342a83dee12bc5ae11eda8439c21407a4cc9a1fa))
* **attendance:** enhance batch management and add new components ([4567d98](https://github.com/bangkeut-technology/daily-brew/commit/4567d988e23f4e609baecdc85885feb6212949b4))
* **attendance:** enhance upcoming attendance batches feature ([7a15a9a](https://github.com/bangkeut-technology/daily-brew/commit/7a15a9a9802e99fda1ec12c61e8d93f093ca673b))
* **attendance:** extend `AttendanceBatch` response context to include `employee` and `user` data ([5e5472b](https://github.com/bangkeut-technology/daily-brew/commit/5e5472b0ede4de5700f0b4cbc90f3814798e1ead))
* **attendance:** implement `AttendanceBatch` support and refactor entity accessors ([d4d38f7](https://github.com/bangkeut-technology/daily-brew/commit/d4d38f77a3a6e7ed63a04566b65ecd6784f42822))
* **attendance:** integrate `fetchUpcomingAttendances` in `UpcomingLeaves` component ([d9e6b90](https://github.com/bangkeut-technology/daily-brew/commit/d9e6b90f03debd96c88c5703931523d66a759452))
* **attendance:** introduce `AttendanceBatch` entity and relationships ([600cc13](https://github.com/bangkeut-technology/daily-brew/commit/600cc1366a84f2eae3ad1c80541fb25b1a87354b))
* **attendance:** optimize batch management methods in repository and subscriber ([53c65de](https://github.com/bangkeut-technology/daily-brew/commit/53c65dee838286e2bd6101ab0411dfc20aa0b551))
* **attendance:** refactor and enhance attendance handling logic ([7ed1eac](https://github.com/bangkeut-technology/daily-brew/commit/7ed1eaca6cf85b7bf7d227686dc8326c51a3e56d))
* **attendance:** refactor attendance batch pages and translations ([addeca1](https://github.com/bangkeut-technology/daily-brew/commit/addeca103dfde0db42c9dd789ef978ac66f6aa8f))
* **attendance:** refactor attendance batches and improve UI components ([091bb60](https://github.com/bangkeut-technology/daily-brew/commit/091bb600cd3903757359e8f7671d56a02323c246))
* **attendance:** refactor date handling in AttendanceBatchSubscriber ([f862195](https://github.com/bangkeut-technology/daily-brew/commit/f862195c5a3b84ab32cdf9c40f0cd937bd6c2673))
* **attendance:** refactor parameter names and improve type handling ([a56a1fd](https://github.com/bangkeut-technology/daily-brew/commit/a56a1fdf96a2de5a6d50e310582c08500e324b8c))
* **attendance:** remove employee filter from upcoming attendance batches ([05eb31b](https://github.com/bangkeut-technology/daily-brew/commit/05eb31b63bd1dda57c4e06da3e5597513616160e))
* **attendance:** remove unused routes and improve translations ([d5cb355](https://github.com/bangkeut-technology/daily-brew/commit/d5cb355f2b8a01a573a4610e8ca6c9b29986e857))
* **attendance:** rename event and update leave cycle rebalancing logic ([730e4bf](https://github.com/bangkeut-technology/daily-brew/commit/730e4bf8393f2090c5f9796d418e0b54bc771c55))
* **attendance:** replace react-query with router loader for batch pages ([ac8a77a](https://github.com/bangkeut-technology/daily-brew/commit/ac8a77a6fc9ed9ffeb6342d968410dfa4ff6a9a2))
* **attendance:** reset form values when reopening AttendanceDialog in edit mode ([b2271b1](https://github.com/bangkeut-technology/daily-brew/commit/b2271b1a09016bae88b032939b4b0dccaf6d31ca))
* **auth:** enhance Apple Sign-In support and update session settings ([34567b7](https://github.com/bangkeut-technology/daily-brew/commit/34567b7859d02d63492aaf4fe0988091e214918f))
* **auth:** enhance logout flow with secure cookies and form-based submission ([6d770d6](https://github.com/bangkeut-technology/daily-brew/commit/6d770d62b25f53e7cd1cf21b245b7159304a1100))
* **authentication:** add demo role management in context ([f7d4eb5](https://github.com/bangkeut-technology/daily-brew/commit/f7d4eb5f15d98cc5adbdd9b3a54525036c11ba89))
* **authentication:** refactor authentication flow and add workspace support ([4a82b62](https://github.com/bangkeut-technology/daily-brew/commit/4a82b626b929f40719d269922b46c827b74db793))
* **authentication:** refactor authentication hooks and context ([4d610d0](https://github.com/bangkeut-technology/daily-brew/commit/4d610d0c3256f4c5355d3d00008094b8f6755c80))
* **authentication:** update authentication hooks to use state management ([3c5540e](https://github.com/bangkeut-technology/daily-brew/commit/3c5540ea9e5c8e28d2b54eff41673d864a67a0ba))
* **auth:** improve logout functionality with secure cookies and refactored frontend logic ([35170a2](https://github.com/bangkeut-technology/daily-brew/commit/35170a2e2ceb9c94c1a36a283cee137435c32ef8))
* **auth:** rename authentication actions for clarity ([67035e9](https://github.com/bangkeut-technology/daily-brew/commit/67035e9ead7c31d8033e95479b43d53fe5d520ab))
* **buttons:** add className prop to DeleteEmployeeButton for custom styling ([70854c5](https://github.com/bangkeut-technology/daily-brew/commit/70854c5eafadcdcd56ddaf13448a3e801132e5f2))
* capture and store Apple user's first and last name during authentication ([49fd969](https://github.com/bangkeut-technology/daily-brew/commit/49fd96933fe95a7d95eca76ade4d6c64e611511f))
* **check-in:** implement device verification for enhanced security ([5ef29be](https://github.com/bangkeut-technology/daily-brew/commit/5ef29be988435c8dfde854d034a6bc8a5341b6ca))
* **ci:** add Node.js 22 support to workflows ([85d8082](https://github.com/bangkeut-technology/daily-brew/commit/85d80827ca006966ca1165e344bd06a41ea53885))
* **components:** add `Logo` component usage and improve not-found handling ([d83bd33](https://github.com/bangkeut-technology/daily-brew/commit/d83bd33fd2a71fcac91d2b983c01fe35c89c4c9f))
* **components:** enhance not-found handling and route configuration ([4c74fc9](https://github.com/bangkeut-technology/daily-brew/commit/4c74fc979ecdb5193321a34d9584cbc5170518b6))
* **config:** enhance session security and proxy handling in framework configuration ([532d501](https://github.com/bangkeut-technology/daily-brew/commit/532d501c3ed7a80c0afa28574f67266a35314698))
* **config:** enhance session security and update Apple OAuth settings ([fa45688](https://github.com/bangkeut-technology/daily-brew/commit/fa45688d92114282d2adea6aae033b432c0d027a))
* **config:** increase maximum cache file size for service worker to 15MB ([7ed9e0b](https://github.com/bangkeut-technology/daily-brew/commit/7ed9e0b11431e4fffc34ae77c0a135c8756d93fe))
* **dashboard:** enhance Manager and Owner views with role-specific features ([5428341](https://github.com/bangkeut-technology/daily-brew/commit/54283415ad6edccd9e4fd89a516164242d418679))
* **demo:** add context and provider for demo session state management ([46a1e1d](https://github.com/bangkeut-technology/daily-brew/commit/46a1e1d6bd3b58fea3ea03ff516f806d883e461d))
* **demo:** add demo session setup and handling ([b6f082a](https://github.com/bangkeut-technology/daily-brew/commit/b6f082ae23bf499bc3ae6d4b12ec8afa227c4dc9))
* **demo:** add DemoPill component and integrate into AppSidebar ([87370bd](https://github.com/bangkeut-technology/daily-brew/commit/87370bd12f427b20a26e9f6abda67616d9a27f69))
* **demo:** enhance demo session handling ([f8d4aaf](https://github.com/bangkeut-technology/daily-brew/commit/f8d4aafe535f4ed6f9f14bc3a8398062b7524894))
* **demo:** enhance demo session hooks with state and dispatch access ([7a3de23](https://github.com/bangkeut-technology/daily-brew/commit/7a3de23df8f418106d752ccfe25786a724affc6b))
* **demo:** enhance demo session management and cleanup ([e9b8b89](https://github.com/bangkeut-technology/daily-brew/commit/e9b8b892e617f01d6307f51ee46dfbc8b821ca07))
* **demo:** enhance demo session management and user creation ([9a0afb0](https://github.com/bangkeut-technology/daily-brew/commit/9a0afb0358f7136e2e17a7c6f5504fe0692fe451))
* **demo:** enhance demo session management and user creation ([8c5d86b](https://github.com/bangkeut-technology/daily-brew/commit/8c5d86b3afa613b03273f4db9b774331e3fb8e47))
* **demo:** enhance demo session management with new status and reset endpoints ([d75dad4](https://github.com/bangkeut-technology/daily-brew/commit/d75dad41f54b808313d8cbe14aa195cc35772508))
* **demo:** implement demo session management with user and organization seeding ([2fd59f1](https://github.com/bangkeut-technology/daily-brew/commit/2fd59f1668a9e22df06d138fbf34c9f5b49227c5))
* **demo:** implement user-related data deletion in demo session cleanup ([a035d25](https://github.com/bangkeut-technology/daily-brew/commit/a035d25e8debbac53704a6c1c40b7e71319d70ab))
* **demo:** rename `DemoController` to `DemoSessionController` and add rate limiting ([eb1aeca](https://github.com/bangkeut-technology/daily-brew/commit/eb1aeca5fd14c57847e5849745189dcb98aa32fd))
* **demo:** update demo session types and context dispatch ([7bb121c](https://github.com/bangkeut-technology/daily-brew/commit/7bb121c60c0dd6761b23ecb60b14587607fecec8))
* **dev:** add Gantt chart API and enhance attendance handling ([67858ef](https://github.com/bangkeut-technology/daily-brew/commit/67858ef401cf6572d33618a6a5cf009a2fcc3df3))
* **dev:** add new attendance form and update related components ([c7af642](https://github.com/bangkeut-technology/daily-brew/commit/c7af642a99b395abe6d0b6bc95a8d81bf5913600))
* **dev:** add status filter to attendance query ([06c4af2](https://github.com/bangkeut-technology/daily-brew/commit/06c4af2e6acaed74482402d0edb1bd70508483da))
* **dev:** add translations to attendance-gantt and refactor variable naming ([52aec54](https://github.com/bangkeut-technology/daily-brew/commit/52aec54e54d4c7112fbde52c18056fb7f810aeb3))
* **dev:** extend attendance filtering and improve query handling ([f0b0edd](https://github.com/bangkeut-technology/daily-brew/commit/f0b0edd28a237689bc115974c6753b7cc286d6ef))
* **dev:** modularize authentication and update routing ([b9e1381](https://github.com/bangkeut-technology/daily-brew/commit/b9e138100369c157e52e12e2ca3b598bb9fcf193))
* **dev:** modularize layout and refactor footer ([6cc47ac](https://github.com/bangkeut-technology/daily-brew/commit/6cc47ac5f091403269b7036484a030e451cc9b21))
* **dev:** modularize layout and refactor footer ([b622fd6](https://github.com/bangkeut-technology/daily-brew/commit/b622fd6e5491603798553aee571fd25c378658d2))
* **dev:** refactor employee handling and simplify date usage ([e77927f](https://github.com/bangkeut-technology/daily-brew/commit/e77927f16f1042206cd0b9fcd88b6748cbc7deff))
* **dev:** refactor sign-up page and update dependencies ([6ed1d6b](https://github.com/bangkeut-technology/daily-brew/commit/6ed1d6b88c5c953e022a186ebb62f04d1b01496b))
* **dev:** update attendance components and improve employee handling ([1fb0428](https://github.com/bangkeut-technology/daily-brew/commit/1fb042829f7002128d25b90dc36ee3f9176b9d81))
* **dev:** update attendance dialog and fix routing inconsistencies ([d61bc19](https://github.com/bangkeut-technology/daily-brew/commit/d61bc1989847d8a228b499d5666625b2445da756))
* **dev:** update attendance dialog and fix routing inconsistencies ([80b2caf](https://github.com/bangkeut-technology/daily-brew/commit/80b2caff870cd814b5e5ec30ea24d8b6832853cb))
* **dev:** update attendance filtering and dependencies ([fa47ac4](https://github.com/bangkeut-technology/daily-brew/commit/fa47ac45f0d0429d87e0bd34f5a6bb5b81f61f26))
* **dev:** update authentication flow and add remember me functionality ([a1c6939](https://github.com/bangkeut-technology/daily-brew/commit/a1c6939c42a01c89f452edb929f5ecd9bf4fda60))
* **dev:** update packages and refactor evaluation components ([1f83762](https://github.com/bangkeut-technology/daily-brew/commit/1f83762cdd4cd504994942679ec3bf759d0a715b))
* **dev:** update routes, enhance employee components & dependencies ([eebc9aa](https://github.com/bangkeut-technology/daily-brew/commit/eebc9aaa48d8e05d1c0a5b2febc72a802f2d093b))
* **dev:** use `Link` component for navigation in Pricing and Hero components ([3e7f5f6](https://github.com/bangkeut-technology/daily-brew/commit/3e7f5f624d304908aad5a7c018d8bd92be8c60ba))
* **dto:** add EmployeeDTO and AttendanceDTO with entity mapping ([8adbeaf](https://github.com/bangkeut-technology/daily-brew/commit/8adbeaf334872f7c4573c50f8cd75a43a114a6a3))
* **dto:** enhance EmployeeDTO and AttendanceDTO with new properties and mapping updates ([ae4cc58](https://github.com/bangkeut-technology/daily-brew/commit/ae4cc58139f8f941afcb542ff7f51d9078e5d7c7))
* **dto:** introduce DTOs and integrate them in API responses ([3547dfb](https://github.com/bangkeut-technology/daily-brew/commit/3547dfb27048d5a30d2457bf893355d31165b190))
* **dto:** update DTOs with constructors, immutability, and entity mapping ([21e2d8d](https://github.com/bangkeut-technology/daily-brew/commit/21e2d8d63c2fcf8baf137be9abf04899b548b531))
* **employee-data-table:** integrate navigation for employee details ([4d3c436](https://github.com/bangkeut-technology/daily-brew/commit/4d3c436ac45abd277384ec4cde8b5768caa1d7c3))
* **employee-delete:** improve delete confirmation button and update react-hooks dependency ([1d35a1b](https://github.com/bangkeut-technology/daily-brew/commit/1d35a1b3fd9b24a2248be9e87b5783f62bc001d7))
* **employee:** make evaluation templates optional in EmployeeFormType ([94a4cd4](https://github.com/bangkeut-technology/daily-brew/commit/94a4cd43b565556ecfb2b795cf2f5c935a5792cb))
* **employees:** add delete employee functionality with confirmation modal ([25b71aa](https://github.com/bangkeut-technology/daily-brew/commit/25b71aa556cef7134e4d2fb1c2d24570713b2ab8))
* **employees:** enable row click navigation in employee table ([8d8b68f](https://github.com/bangkeut-technology/daily-brew/commit/8d8b68f28979250eaed71508f033f8d930304feb))
* **employees:** enable row click navigation in employee table ([a2658b1](https://github.com/bangkeut-technology/daily-brew/commit/a2658b1aea670d04fd2a586763695b227e9d8fbf))
* **employees:** enhance search form and improve picker components ([a91af49](https://github.com/bangkeut-technology/daily-brew/commit/a91af4977a6c58b074282ae8b88f6e94e0c6e02f))
* enhance attendance handling and update dependencies ([369e36d](https://github.com/bangkeut-technology/daily-brew/commit/369e36d6952c0eebc6f3c1c6422fb11a2104ff87))
* enhance employee evaluation handling and Gantt API ([16f3018](https://github.com/bangkeut-technology/daily-brew/commit/16f3018922ef78bc9ae0ddac5cc4e428f2bc91f7))
* enhance geofencing logic and restrict non-owner data visibility ([39d3ff9](https://github.com/bangkeut-technology/daily-brew/commit/39d3ff92465a060fdd0acaea4183cb82d52660cb))
* enhance leave request management and UI with partial-day support and status updates ([016bc90](https://github.com/bangkeut-technology/daily-brew/commit/016bc904cfb4746882e3b742cf4de855b0400777))
* enhance leave request management and UI with partial-day support and status updates ([2233919](https://github.com/bangkeut-technology/daily-brew/commit/2233919aa3509c6180bef2f17222edac70f492e3))
* enhance terms and sign-up pages ([7c8258b](https://github.com/bangkeut-technology/daily-brew/commit/7c8258bc4abbc82ff27618944fbf7a5f67827e8e))
* **entity, ui:** add `Groups` mapping to entities and implement `FullScreenLoader` component ([f3b4692](https://github.com/bangkeut-technology/daily-brew/commit/f3b469284bb97132991a38969a1742be9858c8fd))
* **env:** add `TRUSTED_PROXIES` to environment configuration for proxy handling ([6d70073](https://github.com/bangkeut-technology/daily-brew/commit/6d70073e647564770ba4b7f95370762f9dde9ffe))
* **errors:** add translation for invalid employee salary information ([b8a77e6](https://github.com/bangkeut-technology/daily-brew/commit/b8a77e63b5baa4f5598ae57b9ffc865c9cf11d36))
* **evaluation:** refactor `EvaluationTemplateCriteria` constructor ([ecdaa4d](https://github.com/bangkeut-technology/daily-brew/commit/ecdaa4d9bba1974d9fd69143fe00b37bb0d00715))
* **evaluations:** add histories data table, refine UI, and enhance repository ([b0d25b8](https://github.com/bangkeut-technology/daily-brew/commit/b0d25b886f4698b713c60186117c3e532fb550ce))
* **evaluations:** add putEmployeeEvaluation and update EvaluationTemplateCriterias ([57304b6](https://github.com/bangkeut-technology/daily-brew/commit/57304b611a5b74f7acff42d43a2bfd073124bf97))
* **evaluations:** add recent evaluations API endpoint ([67f7f41](https://github.com/bangkeut-technology/daily-brew/commit/67f7f411a31a267b04c24ef5d847986affa2b8ec))
* **evaluations:** enhance evaluation flow and add new controller ([b45f709](https://github.com/bangkeut-technology/daily-brew/commit/b45f709a1ecb1539af5bd900b9f1ced3beb28d54))
* **evaluations:** enhance histories UI and translation updates ([211f716](https://github.com/bangkeut-technology/daily-brew/commit/211f716c814f70fcdc900d0b516100efa3f0d9ce))
* **evaluations:** enhance repository and API filters ([7d71c1f](https://github.com/bangkeut-technology/daily-brew/commit/7d71c1fb41fa32e2cc883196754dcd0aab252734))
* **evaluations:** integrate recent evaluations in console layout ([d535320](https://github.com/bangkeut-technology/daily-brew/commit/d5353209488eaea2477eecbb39f4f4486f0722b4))
* **evaluations:** refactor evaluatedAt logic and enhance evaluation flow ([1d2947c](https://github.com/bangkeut-technology/daily-brew/commit/1d2947c14d2938bd3a7266fdd1c4aac371e57d76))
* **evaluations:** streamline history UI and remove redundant code ([01452e8](https://github.com/bangkeut-technology/daily-brew/commit/01452e82d698905b3ed6413b6700c4333133878c))
* **evaluation:** update unique constraints and add cascade delete for evaluation templates ([2e38741](https://github.com/bangkeut-technology/daily-brew/commit/2e38741a8f6c2ffd73abfa2534ad05368f2a8329))
* extend DTOs to include employee scores ([3c80e3d](https://github.com/bangkeut-technology/daily-brew/commit/3c80e3dc6efd4f4393e75123b3c66a37d3d6282b))
* extract and reuse `LeaveRequestModal` in shared components ([2e4afa0](https://github.com/bangkeut-technology/daily-brew/commit/2e4afa0c58832621878f8bd4116ff83e19a1c176))
* **glossary:** update and expand localization entries for attendance and evaluations ([498110b](https://github.com/bangkeut-technology/daily-brew/commit/498110bfe3512cabe4cc086344fe1d159a165579))
* **hero:** update "View demo" button to "Try the Demo" ([dfd3d88](https://github.com/bangkeut-technology/daily-brew/commit/dfd3d883f6f99bfb22f02b6e457f4950cd4ce90e))
* implement notification and email systems for closures, summaries, leave requests, and shifts ([66aeee7](https://github.com/bangkeut-technology/daily-brew/commit/66aeee737b6481ee86beb84b2d8d5c317b36436d))
* implement settings management and improve metrics ([b1f4ba9](https://github.com/bangkeut-technology/daily-brew/commit/b1f4ba9c41cbd2afa0fd766aaf8f008ae40d9164))
* implement soft account deletion with comprehensive cleanup ([6e04cf9](https://github.com/bangkeut-technology/daily-brew/commit/6e04cf967250917f6de0f774a0ca89cfff8b2302))
* improve accessibility and scrolling for dialogs ([adfa965](https://github.com/bangkeut-technology/daily-brew/commit/adfa965256181fe06f2cb1beebdf34cf916bc223))
* introduce shared UI components for date, time, and select inputs ([1c60bf0](https://github.com/bangkeut-technology/daily-brew/commit/1c60bf002070feee093ed679f22c39b25346ae7e))
* **jwt-auth:** set default token cookie lifetime to 30 days ([7c9ffff](https://github.com/bangkeut-technology/daily-brew/commit/7c9ffff9e029ab5f3bccc44d895338756b20d23f))
* **landing:** redesign sections for better clarity and engagement ([f671002](https://github.com/bangkeut-technology/daily-brew/commit/f6710026ff5c2a9628865ae36918da6e7cccc560))
* **landing:** redesign sections for better clarity and engagement ([c507526](https://github.com/bangkeut-technology/daily-brew/commit/c50752699c698e5cf0e806624f13d53fd05065e3))
* **landing:** redesign sections for better clarity and engagement ([8a6cd8e](https://github.com/bangkeut-technology/daily-brew/commit/8a6cd8e5c7927ccd25e07f8b7ea611747abf3297))
* **logging:** add error logging for uncaught exceptions in ExceptionSubscriber ([7d9d47e](https://github.com/bangkeut-technology/daily-brew/commit/7d9d47e13f3bcb6f4d8fc0b890097fb9cc7d27ef))
* **logging:** configure rotating file handlers for improved log management ([7facfb8](https://github.com/bangkeut-technology/daily-brew/commit/7facfb8a298b22fab1dc19107236d644063a8b00))
* **logging:** integrate Monolog for improved logging configuration across environments ([2c5e712](https://github.com/bangkeut-technology/daily-brew/commit/2c5e71288a2c5c5964e743e5b4eff869d24dc3c8))
* **maintenance:** add maintenance mode page and automate activation during deployment ([6e4ee8e](https://github.com/bangkeut-technology/daily-brew/commit/6e4ee8edb2ce06706e10ad6a6d7b62e2784b9962))
* **manage:** add allowed IPs management functionality ([0fbd1f2](https://github.com/bangkeut-technology/daily-brew/commit/0fbd1f24b4c736265ef358e5784a1389add22fe9))
* **managers:** introduce manager role and role promotion ([a3cdd65](https://github.com/bangkeut-technology/daily-brew/commit/a3cdd65ea1efde473f26bb0b84d758e47c11da52))
* **metrics:** enhance attendance and employee metric tracking ([a06df3a](https://github.com/bangkeut-technology/daily-brew/commit/a06df3a8a8cc4ed302a6b0d822be13322c7e75a8))
* **metrics:** enhance attendance and employee metric tracking ([e02e74f](https://github.com/bangkeut-technology/daily-brew/commit/e02e74fe20400bce4b02e44136edaf1d32264820))
* **metrics:** enhance metrics functionality and modularize recent evaluations ([bc310c7](https://github.com/bangkeut-technology/daily-brew/commit/bc310c70bfdad757e0b62b5a51c73794a87c0662))
* **metrics:** update metric property names and enhance type safety ([922aa36](https://github.com/bangkeut-technology/daily-brew/commit/922aa3631d9be1790a2518d5ddb09605c05c6c9c))
* **migration:** add auth_code column to daily_brew_users table ([52f590e](https://github.com/bangkeut-technology/daily-brew/commit/52f590ecc83096457b139a17df507883a67b25a1))
* **migration:** add migration for workspace invite support and update invite logic ([e58b1c6](https://github.com/bangkeut-technology/daily-brew/commit/e58b1c61a45c7d0a78261c4aa9f0ddd46479b03a))
* **migrations:** add leave type column and update index names ([10158d9](https://github.com/bangkeut-technology/daily-brew/commit/10158d92d694f1ac5b7544e7e9c899fd7f5f81a1))
* **notifications:** add Telegram notification channel (Espresso) ([407eed3](https://github.com/bangkeut-technology/daily-brew/commit/407eed3fac6929e16f535cac709ce73714a1b7ed))
* **notifications:** add Telegram notification channel (Espresso) ([c6978c5](https://github.com/bangkeut-technology/daily-brew/commit/c6978c52592f915af5feff2fdd6af742e68283dc))
* **oauth, ui:** add `findByOAuth` support and update routes for consistent naming ([c5e372a](https://github.com/bangkeut-technology/daily-brew/commit/c5e372acefeb945cb13495b80bebeaadeb8221f0))
* **oauth:** add abstract OAuth connect controller and provider-specific implementations ([ba9acec](https://github.com/bangkeut-technology/daily-brew/commit/ba9aceccd670ad8a029e5d185758ffaff7d934f7))
* **oauth:** add request handling and logging for invalid state errors ([0c068fb](https://github.com/bangkeut-technology/daily-brew/commit/0c068fb5b17052b588ba893ffc03ddb82e0bdb1e))
* **oauth:** implement stateless OAuth state handling using cookies ([5088a63](https://github.com/bangkeut-technology/daily-brew/commit/5088a632d77e9c6454d327b542fd5a8c4d41bac5))
* **onboarding:** enhance role selection with skip option and refactor sign-in flow ([01dcc7b](https://github.com/bangkeut-technology/daily-brew/commit/01dcc7bd7a8a7c7d1f91e221ca7857ba72defb81))
* **payroll:** remove `#[Groups]` mappings, add employee linkage, and enhance DTOs and UI ([a1eda98](https://github.com/bangkeut-technology/daily-brew/commit/a1eda98421a7eb8fbc1c6f9974f19980585dea3b))
* **payslip:** add API endpoint for listing employee payslips by year ([f1e84cb](https://github.com/bangkeut-technology/daily-brew/commit/f1e84cbd21efcbc3a43d9191c6c9d222ebd49f55))
* **payslip:** add API endpoint for listing employee payslips by year ([f1d3115](https://github.com/bangkeut-technology/daily-brew/commit/f1d3115a3034e14f286d8ee5725833d64e286ea5))
* **payslip:** add API endpoint for listing employee payslips by year ([edf721e](https://github.com/bangkeut-technology/daily-brew/commit/edf721ee1f1fb86464f86b9634275e588a138db4))
* **profile:** add profile management routes and components ([8a5aac2](https://github.com/bangkeut-technology/daily-brew/commit/8a5aac2bed34c45f6bdd3504642eadfad3c1fa56))
* **PWA:** add service worker and web app manifest for offline support and improved UX ([fd2df67](https://github.com/bangkeut-technology/daily-brew/commit/fd2df6702d2dfe9d92c344bee702621df3e3fe92))
* remove unused migrations ([1fd2b95](https://github.com/bangkeut-technology/daily-brew/commit/1fd2b95e8b6e962773bc799799bca8b81b6c0339))
* **repository:** add `findByUserWithoutWorkspace` method across repositories ([8e476ea](https://github.com/bangkeut-technology/daily-brew/commit/8e476ea0d98f8d045096060daedac3d9f576121a))
* **repository:** add attendance status counting and summary methods ([533cd1b](https://github.com/bangkeut-technology/daily-brew/commit/533cd1b151840b9d21e1a3a142bde3814e6475f7))
* revamp subscription plans and enhance QR check-in system ([bcd0e98](https://github.com/bangkeut-technology/daily-brew/commit/bcd0e98651e18f76aa8b7d7f56d6b97df880621b))
* **roles:** add role details page and employee retrieval functionality ([1779a8c](https://github.com/bangkeut-technology/daily-brew/commit/1779a8c5842517d02154d097d62ebb7c3f58af47))
* **roles:** add role management endpoints and update localization ([342a099](https://github.com/bangkeut-technology/daily-brew/commit/342a0998a101593669d2e687c8c700c2916fec32))
* **roles:** add RolesPage route component for role management ([cadb833](https://github.com/bangkeut-technology/daily-brew/commit/cadb833e49c1fc408603813bd049a7de51892411))
* **roles:** associate roles with users and update unique constraints ([8b7f90d](https://github.com/bangkeut-technology/daily-brew/commit/8b7f90d2adf00f3e77252da6f77760f1bc4f88aa))
* **roles:** enhance role management by associating roles with users ([33d3da8](https://github.com/bangkeut-technology/daily-brew/commit/33d3da819d1d3aca1378a91107c6cba5282bf57e))
* **roles:** enhance role management with CRUD operations ([8019cde](https://github.com/bangkeut-technology/daily-brew/commit/8019cde33dbbef8f7e43af597a7eb59b7154f8f9))
* **routes:** add "How it works" page and SEO meta management ([110ebe1](https://github.com/bangkeut-technology/daily-brew/commit/110ebe157e2a0f78982c114ad80261004b60f1ec))
* **routes:** add demo, roles, and manager check-in card components ([319bbe1](https://github.com/bangkeut-technology/daily-brew/commit/319bbe1ec781328bd497266cac47ca265566ce46))
* **routes:** modularize landing page components and update imports ([dbd6b57](https://github.com/bangkeut-technology/daily-brew/commit/dbd6b57739e047e1c19ca384cc3c9942982db7b5))
* **routes:** restructure attendance paths and update sidebar ([570a33f](https://github.com/bangkeut-technology/daily-brew/commit/570a33f8516453484c8fef2dd88b9745cdaf877c))
* **routes:** simplify FAQ and pricing pages ([9958d06](https://github.com/bangkeut-technology/daily-brew/commit/9958d068eb4384d1a08ccb18ebee087c5323ee2e))
* **security:** add OAuth route exemption to security rules ([a49e297](https://github.com/bangkeut-technology/daily-brew/commit/a49e29764f08772edaec4eecacd3d68254bea0ce))
* **security:** add public access for `/demo/start` route ([0b48fbb](https://github.com/bangkeut-technology/daily-brew/commit/0b48fbbcefb01cca49d2dbea173932b451b37878))
* **security:** add user context support and enhance SPA rendering with user data ([311dace](https://github.com/bangkeut-technology/daily-brew/commit/311daceec3c439cae0aa94a107f773f002744f0e))
* **security:** integrate 2FA using `scheb/2fa-bundle` and improve authentication hooks ([9974003](https://github.com/bangkeut-technology/daily-brew/commit/997400338460f87b7213f1ffcf36f1c39bef67c1))
* **security:** refactor routes in SecurityController ([2301ad3](https://github.com/bangkeut-technology/daily-brew/commit/2301ad3aff26ff6cf0ee33998fd9a4dc91c8557b))
* **seed-reviewer:** add `--fresh` option and implement reviewer data purge ([11bf3f7](https://github.com/bangkeut-technology/daily-brew/commit/11bf3f72bdf09d1a69bfa3f20fb5c7c48fd0d178))
* **seo:** add `robots.txt`, `sitemap.xml`, and meta tags for improved SEO across pages ([802e701](https://github.com/bangkeut-technology/daily-brew/commit/802e7015d91b8def3cd2d69e78a48981d5b240b1))
* **settings, support:** add workspace deletion and dynamic FAQs support ([edf52dc](https://github.com/bangkeut-technology/daily-brew/commit/edf52dc0b6e90ccc38579f399b5f38f99f3cca94))
* **settings:** enforce minimum geofencing radius of 50m and improve validation UX ([32704e1](https://github.com/bangkeut-technology/daily-brew/commit/32704e1f6b6a700432adae093c2b2bdc9dd04bb0))
* **settings:** enhance settings management and introduce attendance rate calculations ([ab2a0d5](https://github.com/bangkeut-technology/daily-brew/commit/ab2a0d5fd5aea7aa9b6f386733323c8b3d5c2fc9))
* **settings:** implement settings management and update translations ([4824565](https://github.com/bangkeut-technology/daily-brew/commit/482456519c5f089198b3daeff9bbe2e92bcac9e7))
* **settings:** integrate workspace support into settings fetch and update logic ([10ff5c4](https://github.com/bangkeut-technology/daily-brew/commit/10ff5c45904f5e5f52dd9054d68b8d1dfd2f44cc))
* **settings:** rename `Setting` to `UserSetting` for improved clarity ([3ae6ed5](https://github.com/bangkeut-technology/daily-brew/commit/3ae6ed57674c2a181b16925d9f3509c3c9faac66))
* **shared, service-worker:** add branded gradient component for "BasilBook" and integrate custom service worker setup ([70dda52](https://github.com/bangkeut-technology/daily-brew/commit/70dda52a20da78f107b2e2fd7928f3d4129667ef))
* **shift:** add `ShiftAttendanceService` for shift-based attendance type detection ([9ab0f87](https://github.com/bangkeut-technology/daily-brew/commit/9ab0f87d06acf89d40561e0a1d29d9719c8d971d))
* **shift:** implement shift management UI and ISO day enum ([87f953d](https://github.com/bangkeut-technology/daily-brew/commit/87f953da65f80e4c5515fe047fbf5513b1f3fce3))
* **sidebar:** enhance Sidebar layout and structure ([995a996](https://github.com/bangkeut-technology/daily-brew/commit/995a9964736213ecbffed8a2f8308615e7f9d0d9))
* **sign-up:** improve password field UI and add auto-complete attributes ([57623f6](https://github.com/bangkeut-technology/daily-brew/commit/57623f6d60b90a0b329a1247465ec47cec4150eb))
* **sign-up:** modularize signup form and add password strength indicator ([5133f04](https://github.com/bangkeut-technology/daily-brew/commit/5133f04ce551f65104d9040dfeff1329d3a0c2ef))
* support Apple iOS client ID for token verification ([da10542](https://github.com/bangkeut-technology/daily-brew/commit/da105424cea8de908ad43d71a2a3f0eab9dcbc4e))
* **support:** introduce feedback and Mailgun inbound controllers with new SupportDock integration ([1ae449a](https://github.com/bangkeut-technology/daily-brew/commit/1ae449a228dcf58133a11165e7df18f56153e812))
* **ui:** add `Container` component and center content in demo layout ([2b55160](https://github.com/bangkeut-technology/daily-brew/commit/2b55160f84f1d6df0b0623f26d6844923fbfe786))
* **ui:** add AttendanceListPage with filters, table, and search integration ([941c02a](https://github.com/bangkeut-technology/daily-brew/commit/941c02a6562af68cc2d135ae7151c813cc49081c))
* **ui:** add Attendances route and update dashboard links ([08007f3](https://github.com/bangkeut-technology/daily-brew/commit/08007f3ed21610bd2cb2263093af61f6f92f8c19))
* **ui:** add AttendanceStatusPicker and enhance EmployeeStatusPicker integration ([56091c3](https://github.com/bangkeut-technology/daily-brew/commit/56091c3831cbba45b2a7876d518bf8bebfd4cf25))
* **ui:** add DatePicker for evaluatedAt in EmployeeEvaluationButton ([fc1cd35](https://github.com/bangkeut-technology/daily-brew/commit/fc1cd35bfeda0818e66df537390017bfb33d4aa0))
* **ui:** add DateRangePicker and build EvaluationsHistoryPage UI ([3653aa8](https://github.com/bangkeut-technology/daily-brew/commit/3653aa88c20f333542aad19163241dc660dda9e8))
* **ui:** add evaluation date details and update dependencies ([49307ab](https://github.com/bangkeut-technology/daily-brew/commit/49307ab8c5f030a5e243e7db0c1ffb8aba5fec9b))
* **ui:** add new landing page components and framer-motion dependency ([ff1d5a9](https://github.com/bangkeut-technology/daily-brew/commit/ff1d5a9da998cf57992f8804f2078536eb8ba113))
* **ui:** add reusable components for enhanced UI composition ([6218305](https://github.com/bangkeut-technology/daily-brew/commit/621830527c4b57e79178b761924172d2c017fb50))
* **ui:** add reusable Gantt components and enhance dashboard with stubs ([2719280](https://github.com/bangkeut-technology/daily-brew/commit/27192805701807b83776fcae84cb1eef82434aba))
* **ui:** add WorkspaceSelectorModal component and enhance workspace handling ([86c4f82](https://github.com/bangkeut-technology/daily-brew/commit/86c4f826c49eaf5c43b4b66391ce39555162b282))
* **ui:** enhance attendance features and update dependencies ([eae5470](https://github.com/bangkeut-technology/daily-brew/commit/eae5470e57d382e7d1a1eddebecd1cf594f0371c))
* **ui:** enhance employee evaluation components and update dependencies ([7c360d5](https://github.com/bangkeut-technology/daily-brew/commit/7c360d51a3c6575a48d086c04b84f4e424fcd815))
* **ui:** implement AttendancesPage with interactive monthly view and employee attendance management ([9ec121c](https://github.com/bangkeut-technology/daily-brew/commit/9ec121c31822ca37830a0a7af04d7bcc82e7b7b6))
* **ui:** improve UX for header, pickers, and sign-in/up routes ([0e24be9](https://github.com/bangkeut-technology/daily-brew/commit/0e24be95f82ba5d164adf3b4c623b177c5128b8c))
* **ui:** refactor Gantt components and optimize sidebar/menu translations ([3937f7f](https://github.com/bangkeut-technology/daily-brew/commit/3937f7fabac62297627c4a9cf3fa08cf22be7649))
* **ui:** refactor Gantt components and update routing ([8be660e](https://github.com/bangkeut-technology/daily-brew/commit/8be660efdf772bc2d35a103f2b74d504e7041632))
* **ui:** refactor MetricCard & enhance i18n usage in dashboard ([8333765](https://github.com/bangkeut-technology/daily-brew/commit/8333765280fd9f26153c13c903f667bf7f7f0d84))
* **ui:** replace DatePicker with DatePickerControl and enhance EmployeeSelect component ([bfb974e](https://github.com/bangkeut-technology/daily-brew/commit/bfb974e7ddc7c3dc623c1af5f2489413aa51b05d))
* **ui:** restructure routes and enhance sidebar navigation ([7e49ad0](https://github.com/bangkeut-technology/daily-brew/commit/7e49ad0c80517be662eb6333ba1e9c8c874434b5))
* **ui:** update evaluation history route and refactor sidebar ([2b7928d](https://github.com/bangkeut-technology/daily-brew/commit/2b7928da8488d599fa030289aeb45b8a50b2d85e))
* **ui:** update glossary and button labels for evaluations and employees ([82ccfea](https://github.com/bangkeut-technology/daily-brew/commit/82ccfea15877afad583953cabb3e2921487ad172))
* update `daily_brew_subscriptions` schema and enhance UI components ([3f12a06](https://github.com/bangkeut-technology/daily-brew/commit/3f12a06c1414b17533323e7c341eb34e6f2e5b60))
* update dependencies and improve sidebar functionality ([687b220](https://github.com/bangkeut-technology/daily-brew/commit/687b220b0819f90be6cf54ef9f3afaf63141a368))
* **user:** enhance workspace creation and token generation logic ([7952830](https://github.com/bangkeut-technology/daily-brew/commit/795283057cdcf67b26b557e486ff441dedd6dfd5))
* **user:** link user to workspace during creation ([80b91ad](https://github.com/bangkeut-technology/daily-brew/commit/80b91adf833cb49c76d179a68dd23d6e2d3daf21))
* **workspace:** add `AccountDeletionService` and implement user account deletion flow ([64628af](https://github.com/bangkeut-technology/daily-brew/commit/64628afa29189111952a430e405764d54a8f997e))
* **workspace:** add `findByPublicIdAndUser` method and improve invite handling ([a8cad7b](https://github.com/bangkeut-technology/daily-brew/commit/a8cad7b41019855359091e254814818332aac629))
* **workspace:** add migration for workspace support and update entity associations ([e19fcac](https://github.com/bangkeut-technology/daily-brew/commit/e19fcac8e98509d82b9c8d6815301d15d7fbadea))
* **workspace:** add plan support in WorkspaceBootstrapCommand and update FK constraints ([8aa3340](https://github.com/bangkeut-technology/daily-brew/commit/8aa3340728be0a3697e9dede216369f25ce48614))
* **workspace:** add soft delete support and implement member management ([3051666](https://github.com/bangkeut-technology/daily-brew/commit/3051666cc4598a958722c995625179e755af0c4f))
* **workspace:** add soft delete support for workspaces and users ([b4461eb](https://github.com/bangkeut-technology/daily-brew/commit/b4461eb54f37a28c0c69dde5e82e2a395c5011ab))
* **workspace:** enhance workspace association and repository functionality ([f7965d7](https://github.com/bangkeut-technology/daily-brew/commit/f7965d791bb6ba076294e5906a952ecac8071fac))
* **workspace:** implement workspace invite voter and enhance invite management ([95c2665](https://github.com/bangkeut-technology/daily-brew/commit/95c2665d35d42960996a548ffb92cd15bc7136b2))
* **workspace:** implement workspace leave request and member management ([8cce9ed](https://github.com/bangkeut-technology/daily-brew/commit/8cce9edd2daaa8c9bbb986866fb91c76bdae4441))
* **workspace:** implement workspace support and enhance entity associations ([113365f](https://github.com/bangkeut-technology/daily-brew/commit/113365f35325f94007ae0517ad8455ebf44b0de8))
* **workspace:** implement workspace switcher functionality in UI and API ([2aceef9](https://github.com/bangkeut-technology/daily-brew/commit/2aceef99568f82df261c57ac2dc03caaf6596ae9))
* **workspace:** refactor `Account` to `Workspace` and update related entities ([941c1b1](https://github.com/bangkeut-technology/daily-brew/commit/941c1b1d8cbc5d516f0f3e0a423f14ec9369bd3d))
* **workspace:** remove workspace association from `EvaluationTemplateCriteria` and add image upload support ([ece091b](https://github.com/bangkeut-technology/daily-brew/commit/ece091b63e200c5bba94a6b9da4ad2ff88dc529a))
* **workspaces:** add timezone support when creating a workspace ([f45ba5d](https://github.com/bangkeut-technology/daily-brew/commit/f45ba5dbd27a791f79f856a551423145d128dfba))
* **workspaces:** add timezone support when creating a workspace ([de51b3f](https://github.com/bangkeut-technology/daily-brew/commit/de51b3f87adec752e36438a909a9f33cc49086af))
* **workspaces:** enhance timezone handling across services and documentation ([249e2e3](https://github.com/bangkeut-technology/daily-brew/commit/249e2e3d435fa43700c784011a4eb37798b72cb9))


### Bug Fixes

* **attendance:** ensure `pill` state is nullable and conditionally render pill element ([00824e5](https://github.com/bangkeut-technology/daily-brew/commit/00824e5e679790d2b59c352fd286dd83e182dfec))
* **attendance:** handle duplicate batch label validation logic ([be82c42](https://github.com/bangkeut-technology/daily-brew/commit/be82c42dfbb0a1cff92e300ad6151e5aacaa2fe3))
* **attendance:** handle invalid attendance request and clean up unused variable ([8cb24d0](https://github.com/bangkeut-technology/daily-brew/commit/8cb24d08cb7fa7199bf2f45718247f02ae662ea4))
* **attendance:** remove unused imports and improve code readability ([261ec2c](https://github.com/bangkeut-technology/daily-brew/commit/261ec2cef088565fa91dfec4d0460f85ebadf0c9))
* **buttons:** improve deletion handling and update dependencies ([f36965a](https://github.com/bangkeut-technology/daily-brew/commit/f36965aa4eeca21971b9fce7847bf298d8018c11))
* **demo:** rename demo session table and indexes ([7256358](https://github.com/bangkeut-technology/daily-brew/commit/725635845726ca9c5708e7c80059610501db2964))
* **deploy:** add migrations to deploy pipeline and remove dead getSource() call ([09cf4a9](https://github.com/bangkeut-technology/daily-brew/commit/09cf4a9300117366e61d9b4cc1ba5fdfce353f8f))
* **pricing:** remove unnecessary dollar sign for plan monthly pricing display ([9fa84e3](https://github.com/bangkeut-technology/daily-brew/commit/9fa84e34a8372cc4eef0680fb73e1ceb73531e54))
* **readme:** remove quoted comments from Mermaid ERD for GitHub compatibility ([2f5d25c](https://github.com/bangkeut-technology/daily-brew/commit/2f5d25c685da8fe9ca67bb0c8a87a39250ea1230))
* refine leave request validations and UI enhancements ([570a455](https://github.com/bangkeut-technology/daily-brew/commit/570a455ef9bbc3291fae2d9101ec4d35251122bb))
* **ui:** update import paths for AttendanceGantt and KpiGantt components ([1388af1](https://github.com/bangkeut-technology/daily-brew/commit/1388af10da97f22fab879dd63c2f63c7d5727df8))
* **ui:** update import paths for AttendanceGantt and KpiGantt components ([5ec8ac3](https://github.com/bangkeut-technology/daily-brew/commit/5ec8ac39b6d48db547402bbb351910f46c1dad2c))
* update OAuth callback navigation to use `/console/dashboard` route ([b21d15a](https://github.com/bangkeut-technology/daily-brew/commit/b21d15aab75f7f1627e48ae12ec39912b496ffed))
* **user:** update `Vich` import to use `Attribute` instead of `Annotation` ([7ccc616](https://github.com/bangkeut-technology/daily-brew/commit/7ccc6168b8f9cbd87ae9ec367f247d423c97966e))

## [1.33.2](https://github.com/bangkeut-technology/daily-brew/compare/v1.33.1...v1.33.2) (2026-04-11)


### Bug Fixes

* **deploy:** add migrations to deploy pipeline and remove dead getSource() call ([09cf4a9](https://github.com/bangkeut-technology/daily-brew/commit/09cf4a9300117366e61d9b4cc1ba5fdfce353f8f))

## [1.33.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.32.4...v1.33.0) (2026-04-09)


### Features

* **notifications:** add Telegram notification channel (Espresso) ([407eed3](https://github.com/bangkeut-technology/daily-brew/commit/407eed3fac6929e16f535cac709ce73714a1b7ed))
* **notifications:** add Telegram notification channel (Espresso) ([c6978c5](https://github.com/bangkeut-technology/daily-brew/commit/c6978c52592f915af5feff2fdd6af742e68283dc))

## [1.32.4](https://github.com/bangkeut-technology/daily-brew/compare/v1.32.3...v1.32.4) (2026-04-07)


### Bug Fixes

* **readme:** remove quoted comments from Mermaid ERD for GitHub compatibility ([2f5d25c](https://github.com/bangkeut-technology/daily-brew/commit/2f5d25c685da8fe9ca67bb0c8a87a39250ea1230))

## [1.31.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.30.2...v1.31.0) (2026-04-03)


### Features

* **settings, support:** add workspace deletion and dynamic FAQs support ([edf52dc](https://github.com/bangkeut-technology/daily-brew/commit/edf52dc0b6e90ccc38579f399b5f38f99f3cca94))

## [1.30.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.29.0...v1.30.0) (2026-04-02)


### Features

* **shared, service-worker:** add branded gradient component for "BasilBook" and integrate custom service worker setup ([70dda52](https://github.com/bangkeut-technology/daily-brew/commit/70dda52a20da78f107b2e2fd7928f3d4129667ef))

## [1.29.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.28.0...v1.29.0) (2026-04-02)


### Features

* **api-tokens:** introduce API token support for external integrations (e.g., BasilBook) ([570c0ed](https://github.com/bangkeut-technology/daily-brew/commit/570c0ed95a7eea4d42a6aa330b5fda285609f18d))

## [1.28.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.27.2...v1.28.0) (2026-04-02)


### Features

* **security:** add user context support and enhance SPA rendering with user data ([311dace](https://github.com/bangkeut-technology/daily-brew/commit/311daceec3c439cae0aa94a107f773f002744f0e))


### Bug Fixes

* **attendance:** ensure `pill` state is nullable and conditionally render pill element ([00824e5](https://github.com/bangkeut-technology/daily-brew/commit/00824e5e679790d2b59c352fd286dd83e182dfec))

## [1.27.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.26.0...v1.27.0) (2026-04-01)


### Features

* **workspaces:** enhance timezone handling across services and documentation ([249e2e3](https://github.com/bangkeut-technology/daily-brew/commit/249e2e3d435fa43700c784011a4eb37798b72cb9))

## [1.26.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.25.0...v1.26.0) (2026-04-01)


### Features

* **workspaces:** add timezone support when creating a workspace ([f45ba5d](https://github.com/bangkeut-technology/daily-brew/commit/f45ba5dbd27a791f79f856a551423145d128dfba))

## [1.25.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.24.2...v1.25.0) (2026-04-01)


### Features

* **workspaces:** add timezone support when creating a workspace ([de51b3f](https://github.com/bangkeut-technology/daily-brew/commit/de51b3f87adec752e36438a909a9f33cc49086af))

## [1.24.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.23.0...v1.24.0) (2026-04-01)


### Features

* **dashboard:** enhance Manager and Owner views with role-specific features ([5428341](https://github.com/bangkeut-technology/daily-brew/commit/54283415ad6edccd9e4fd89a516164242d418679))
* **managers:** introduce manager role and role promotion ([a3cdd65](https://github.com/bangkeut-technology/daily-brew/commit/a3cdd65ea1efde473f26bb0b84d758e47c11da52))
* **routes:** add demo, roles, and manager check-in card components ([319bbe1](https://github.com/bangkeut-technology/daily-brew/commit/319bbe1ec781328bd497266cac47ca265566ce46))

## [1.23.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.22.0...v1.23.0) (2026-04-01)


### Features

* **jwt-auth:** set default token cookie lifetime to 30 days ([7c9ffff](https://github.com/bangkeut-technology/daily-brew/commit/7c9ffff9e029ab5f3bccc44d895338756b20d23f))
* **landing:** redesign sections for better clarity and engagement ([f671002](https://github.com/bangkeut-technology/daily-brew/commit/f6710026ff5c2a9628865ae36918da6e7cccc560))
* **landing:** redesign sections for better clarity and engagement ([c507526](https://github.com/bangkeut-technology/daily-brew/commit/c50752699c698e5cf0e806624f13d53fd05065e3))
* **landing:** redesign sections for better clarity and engagement ([8a6cd8e](https://github.com/bangkeut-technology/daily-brew/commit/8a6cd8e5c7927ccd25e07f8b7ea611747abf3297))

## [1.22.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.21.0...v1.22.0) (2026-04-01)


### Features

* add account deletion page and seed reviewer command ([ca4b6c1](https://github.com/bangkeut-technology/daily-brew/commit/ca4b6c120695b97a3184c463030d072fb183ba3b))
* **onboarding:** enhance role selection with skip option and refactor sign-in flow ([01dcc7b](https://github.com/bangkeut-technology/daily-brew/commit/01dcc7bd7a8a7c7d1f91e221ca7857ba72defb81))
* **routes:** add "How it works" page and SEO meta management ([110ebe1](https://github.com/bangkeut-technology/daily-brew/commit/110ebe157e2a0f78982c114ad80261004b60f1ec))
* **seed-reviewer:** add `--fresh` option and implement reviewer data purge ([11bf3f7](https://github.com/bangkeut-technology/daily-brew/commit/11bf3f72bdf09d1a69bfa3f20fb5c7c48fd0d178))

## [1.21.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.20.0...v1.21.0) (2026-03-31)


### Features

* **oauth:** implement stateless OAuth state handling using cookies ([5088a63](https://github.com/bangkeut-technology/daily-brew/commit/5088a632d77e9c6454d327b542fd5a8c4d41bac5))

## [1.20.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.19.0...v1.20.0) (2026-03-31)


### Features

* **logging:** configure rotating file handlers for improved log management ([7facfb8](https://github.com/bangkeut-technology/daily-brew/commit/7facfb8a298b22fab1dc19107236d644063a8b00))

## [1.19.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.18.0...v1.19.0) (2026-03-31)


### Features

* **oauth:** add request handling and logging for invalid state errors ([0c068fb](https://github.com/bangkeut-technology/daily-brew/commit/0c068fb5b17052b588ba893ffc03ddb82e0bdb1e))

## [1.18.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.17.0...v1.18.0) (2026-03-31)


### Features

* **config:** enhance session security and update Apple OAuth settings ([fa45688](https://github.com/bangkeut-technology/daily-brew/commit/fa45688d92114282d2adea6aae033b432c0d027a))

## [1.17.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.16.0...v1.17.0) (2026-03-31)


### Features

* enhance geofencing logic and restrict non-owner data visibility ([39d3ff9](https://github.com/bangkeut-technology/daily-brew/commit/39d3ff92465a060fdd0acaea4183cb82d52660cb))
* **settings:** enforce minimum geofencing radius of 50m and improve validation UX ([32704e1](https://github.com/bangkeut-technology/daily-brew/commit/32704e1f6b6a700432adae093c2b2bdc9dd04bb0))

## [1.16.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.15.0...v1.16.0) (2026-03-31)


### Features

* **auth:** enhance Apple Sign-In support and update session settings ([34567b7](https://github.com/bangkeut-technology/daily-brew/commit/34567b7859d02d63492aaf4fe0988091e214918f))

## [1.15.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.14.0...v1.15.0) (2026-03-31)


### Features

* add push and email notifications for key events, daily summaries, and UI updates ([c3d23c0](https://github.com/bangkeut-technology/daily-brew/commit/c3d23c000fb0521f2e3c0dd28837d16d41a1fe5b))

## [1.14.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.13.0...v1.14.0) (2026-03-31)


### Features

* **ui:** add WorkspaceSelectorModal component and enhance workspace handling ([86c4f82](https://github.com/bangkeut-technology/daily-brew/commit/86c4f826c49eaf5c43b4b66391ce39555162b282))

## [1.13.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.12.0...v1.13.0) (2026-03-31)


### Features

* **security:** add OAuth route exemption to security rules ([a49e297](https://github.com/bangkeut-technology/daily-brew/commit/a49e29764f08772edaec4eecacd3d68254bea0ce))

## [1.12.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.11.1...v1.12.0) (2026-03-31)


### Features

* implement notification and email systems for closures, summaries, leave requests, and shifts ([66aeee7](https://github.com/bangkeut-technology/daily-brew/commit/66aeee737b6481ee86beb84b2d8d5c317b36436d))

## [1.10.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.9.0...v1.10.0) (2026-03-30)


### Features

* add logging to Paddle webhook handling and subscription processing ([2930f28](https://github.com/bangkeut-technology/daily-brew/commit/2930f28d54df397637f576216c5ab0c8b549fc56))

## [1.9.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.8.0...v1.9.0) (2026-03-30)


### Features

* add billing toggle (monthly/annual) and dynamic pricing updates ([9bb9135](https://github.com/bangkeut-technology/daily-brew/commit/9bb91351bc79311871e19dd491e1b4092f460e75))

## [1.8.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.7.0...v1.8.0) (2026-03-30)


### Features

* add abstract repository, workspace QR check-in, and reusable formatting utilities ([4a8d581](https://github.com/bangkeut-technology/daily-brew/commit/4a8d581a045e37daa2bfc184f8aa2055b886d538))
* add dev-exclusive toggle plan endpoint and dashboard updates ([71ff7ce](https://github.com/bangkeut-technology/daily-brew/commit/71ff7ce8ebb4a68e52cabcd808e4cc6a7eb7e87e))
* add employee-user linking enhancements and improve workspace settings ([5d71e2e](https://github.com/bangkeut-technology/daily-brew/commit/5d71e2e173500f821e976177d5c4dd35fd1dd277))
* add leave overlap validation, partial leave support, and UI enhancements ([8b5185c](https://github.com/bangkeut-technology/daily-brew/commit/8b5185c335c64d448469632418c7890e5997970e))
* add leave requests functionality and `cn` utility integration ([98025be](https://github.com/bangkeut-technology/daily-brew/commit/98025be1f5adf114f92be0800f9aa66c2153381d))
* add overlapping validations for leave requests and closures ([44f2d68](https://github.com/bangkeut-technology/daily-brew/commit/44f2d68561d10e8a94ab0c92982d7f1fee2b074f))
* add support for cancelling leave requests and enhance UI/UX ([7b09447](https://github.com/bangkeut-technology/daily-brew/commit/7b09447961cedb716ac80024bba7e75051a125d1))
* add timezone handling and improve check-in/check-out accuracy ([01d70d4](https://github.com/bangkeut-technology/daily-brew/commit/01d70d4e879706ab73801a8f678a7ded79c56460))
* enhance leave request management and UI with partial-day support and status updates ([016bc90](https://github.com/bangkeut-technology/daily-brew/commit/016bc904cfb4746882e3b742cf4de855b0400777))
* enhance leave request management and UI with partial-day support and status updates ([2233919](https://github.com/bangkeut-technology/daily-brew/commit/2233919aa3509c6180bef2f17222edac70f492e3))
* extract and reuse `LeaveRequestModal` in shared components ([2e4afa0](https://github.com/bangkeut-technology/daily-brew/commit/2e4afa0c58832621878f8bd4116ff83e19a1c176))
* introduce shared UI components for date, time, and select inputs ([1c60bf0](https://github.com/bangkeut-technology/daily-brew/commit/1c60bf002070feee093ed679f22c39b25346ae7e))
* revamp subscription plans and enhance QR check-in system ([bcd0e98](https://github.com/bangkeut-technology/daily-brew/commit/bcd0e98651e18f76aa8b7d7f56d6b97df880621b))
* update `daily_brew_subscriptions` schema and enhance UI components ([3f12a06](https://github.com/bangkeut-technology/daily-brew/commit/3f12a06c1414b17533323e7c341eb34e6f2e5b60))


### Bug Fixes

* refine leave request validations and UI enhancements ([570a455](https://github.com/bangkeut-technology/daily-brew/commit/570a455ef9bbc3291fae2d9101ec4d35251122bb))
* update OAuth callback navigation to use `/console/dashboard` route ([b21d15a](https://github.com/bangkeut-technology/daily-brew/commit/b21d15aab75f7f1627e48ae12ec39912b496ffed))

## [1.7.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.6.0...v1.7.0) (2026-03-30)


### Features

* capture and store Apple user's first and last name during authentication ([49fd969](https://github.com/bangkeut-technology/daily-brew/commit/49fd96933fe95a7d95eca76ade4d6c64e611511f))
* support Apple iOS client ID for token verification ([da10542](https://github.com/bangkeut-technology/daily-brew/commit/da105424cea8de908ad43d71a2a3f0eab9dcbc4e))

## [1.6.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.5.0...v1.6.0) (2026-03-29)


### Features

* add account deletion functionality and enhance authentication flow ([6889dc0](https://github.com/bangkeut-technology/daily-brew/commit/6889dc04656118d4aae6d886ccaf7d3fbb7ea1bd))
* implement soft account deletion with comprehensive cleanup ([6e04cf9](https://github.com/bangkeut-technology/daily-brew/commit/6e04cf967250917f6de0f774a0ca89cfff8b2302))

## [1.5.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.4.0...v1.5.0) (2026-03-29)


### Features

* add CI/CD pipeline with automated versioning and deployment ([b5267d0](https://github.com/bangkeut-technology/daily-brew/commit/b5267d0c37fca0183b692ac754b4f71cb89c8a3f))

## [1.4.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.3.1...v1.4.0) (2026-03-29)


### Features

* **maintenance:** add maintenance mode page and automate activation during deployment ([6e4ee8e](https://github.com/bangkeut-technology/daily-brew/commit/6e4ee8edb2ce06706e10ad6a6d7b62e2784b9962))

## [1.3.0](https://github.com/bangkeut-technology/daily-brew/compare/v1.2.0...v1.3.0) (2026-03-29)


### Features

* **logging:** add error logging for uncaught exceptions in ExceptionSubscriber ([7d9d47e](https://github.com/bangkeut-technology/daily-brew/commit/7d9d47e13f3bcb6f4d8fc0b890097fb9cc7d27ef))

## [1.2.0](https://github.com/bangkeut-technology/daily-brew/compare/1.1.1...v1.2.0) (2026-03-29)


### Features

* **account:** add `customName` to `AccountUser` and refactor current account handling ([2449080](https://github.com/bangkeut-technology/daily-brew/commit/2449080f3fe1977f7f5432362206888275e705ef))
* **account:** add evaluation-related entities and associations to `Account` ([5d22046](https://github.com/bangkeut-technology/daily-brew/commit/5d22046044e12688aa7100b3d378d0bf0cc75b70))
* **account:** add evaluation-related entities and associations to `Account` ([d50e713](https://github.com/bangkeut-technology/daily-brew/commit/d50e7130112dcd4c4389e949712037af3698397a))
* **account:** extend `Account` with attendance and employee associations ([7a10716](https://github.com/bangkeut-technology/daily-brew/commit/7a10716b8346e2af6c1445b5bbcd984625c64d2c))
* **account:** introduce `AccountUser` entity and associations ([411d618](https://github.com/bangkeut-technology/daily-brew/commit/411d618b78b6a59479b9f8915948832a6ba42559))
* **account:** introduce `AccountUser` entity and associations ([5f881db](https://github.com/bangkeut-technology/daily-brew/commit/5f881db09974b0bf479cae89cff5726f21f4af80))
* **account:** refactor `AccountUser` entity and update attendance batch handling ([33213cc](https://github.com/bangkeut-technology/daily-brew/commit/33213cc05b58330fdb7fd6ff58053fa8d24ec0ee))
* add app logos and favicons for branding ([7748a1e](https://github.com/bangkeut-technology/daily-brew/commit/7748a1e572c80abe9c6936f32d9269f77a8d43c6))
* add DTOs for structured entity data and guided tour for new users ([0730f45](https://github.com/bangkeut-technology/daily-brew/commit/0730f45ce3213bd3db987609d7b2f61b452585bc))
* **api:** add response interceptors for JWT handling and error retries ([8539105](https://github.com/bangkeut-technology/daily-brew/commit/85391059c7201f7849629d04a3d79e210a65dcd9))
* **api:** add WorkspaceInviteController with enhanced invite management ([aa689c6](https://github.com/bangkeut-technology/daily-brew/commit/aa689c65157e2fd84975dfd4b2090a790aa6f4d2))
* **api:** introduce structured error handling and workspace invite management ([6ad0ded](https://github.com/bangkeut-technology/daily-brew/commit/6ad0ded8f9acab5d5d913268ca2290265f902d2a))
* **assets:** add `Logo` component and SVG support ([11ec7f0](https://github.com/bangkeut-technology/daily-brew/commit/11ec7f0c1698d4b412e23967551a9bd0f58b626f))
* **attendance:** add action buttons for view and edit in AttendanceBatchDataTable ([636eb01](https://github.com/bangkeut-technology/daily-brew/commit/636eb01e1ba743fe1d91d16f2d17642b1113fb68))
* **attendance:** add components for batch management and improve sign-in functionality ([2c07db3](https://github.com/bangkeut-technology/daily-brew/commit/2c07db3fc98e31c20fc61e2719bea8937ae0e042))
* **attendance:** add default employee selection and improve batch form handling ([2cc080b](https://github.com/bangkeut-technology/daily-brew/commit/2cc080b21e8b6f6d9d4c42022f9f4d41272b6aab))
* **attendance:** add delete functionality for attendance batches ([becb6c7](https://github.com/bangkeut-technology/daily-brew/commit/becb6c7d9402c8f9865afd9b9f7da89500b7747b))
* **attendance:** add edit functionality to AttendanceDialog ([cf6f63e](https://github.com/bangkeut-technology/daily-brew/commit/cf6f63e602b3462a65ab1b3eafb2fbedfc19aba5))
* **attendance:** add employee association to attendance batches ([60bfa55](https://github.com/bangkeut-technology/daily-brew/commit/60bfa55f141e69b7e0f4a9e8e363a82dbd3674e2))
* **attendance:** add employee selection to batch creation ([4e1e986](https://github.com/bangkeut-technology/daily-brew/commit/4e1e986706f648d16ec2b67d4a2f9025265ad430))
* **attendance:** add forward refs for dialogs and enhance QuickActions component ([6de91a6](https://github.com/bangkeut-technology/daily-brew/commit/6de91a6790ba78659e8fef63f45d8ede398851f3))
* **attendance:** add leave type support and automate paid/unpaid leave assignment ([f66db78](https://github.com/bangkeut-technology/daily-brew/commit/f66db78c5e35254f343341c2f3c7e546de2f87e1))
* **attendance:** add new employee attendance validation with detailed checks ([a9b40fa](https://github.com/bangkeut-technology/daily-brew/commit/a9b40fa60dd69784086d58cecdb450487c1b644c))
* **attendance:** add NewAttendanceDialog and QuickActions components ([1ac5926](https://github.com/bangkeut-technology/daily-brew/commit/1ac59269a1a1413d60e93a27c75ae01261ae8ada))
* **attendance:** add onDeleted handler for batch deletion ([51de3f1](https://github.com/bangkeut-technology/daily-brew/commit/51de3f1e86ff4dbe5d1d816379f5b487f669040c))
* **attendance:** add remaining paid leave calculation and rename `findStatus` to `findType` ([d9dfee9](https://github.com/bangkeut-technology/daily-brew/commit/d9dfee94297729cf8a5ad860899698dce5b92d21))
* **attendance:** add upcoming attendance batches feature ([c9fce73](https://github.com/bangkeut-technology/daily-brew/commit/c9fce732b3d09f2d0290130fee6d78c4e713a21a))
* **attendance:** add update functionality and enhance event handling ([57ff030](https://github.com/bangkeut-technology/daily-brew/commit/57ff0305cecc34eada4cadd4aa3e1b180846ae7a))
* **attendance:** enhance attendance and batch handling ([7b1fa58](https://github.com/bangkeut-technology/daily-brew/commit/7b1fa58b3d0b582cec281f4123cd18122907c105))
* **attendance:** enhance attendance flow with response and query changes ([c006e8e](https://github.com/bangkeut-technology/daily-brew/commit/c006e8e7aa63ba2dc916a1abf274681ebf228865))
* **attendance:** enhance AttendanceBatch handling and improve repository methods ([8d2ed74](https://github.com/bangkeut-technology/daily-brew/commit/8d2ed74a681d7a6cf8903a1e51a9fc24faf8f343))
* **attendance:** enhance AttendanceBatch responses with localized messages and disable CSRF protection ([8008a28](https://github.com/bangkeut-technology/daily-brew/commit/8008a28784d6bcb2c10c06a295f5f67e10dadf04))
* **attendance:** enhance batch handling with new attendance methods ([1db09e5](https://github.com/bangkeut-technology/daily-brew/commit/1db09e56f3243605e625ac9edef38d8bc6432094))
* **attendance:** enhance batch management and add new components ([342a83d](https://github.com/bangkeut-technology/daily-brew/commit/342a83dee12bc5ae11eda8439c21407a4cc9a1fa))
* **attendance:** enhance batch management and add new components ([4567d98](https://github.com/bangkeut-technology/daily-brew/commit/4567d988e23f4e609baecdc85885feb6212949b4))
* **attendance:** enhance upcoming attendance batches feature ([7a15a9a](https://github.com/bangkeut-technology/daily-brew/commit/7a15a9a9802e99fda1ec12c61e8d93f093ca673b))
* **attendance:** extend `AttendanceBatch` response context to include `employee` and `user` data ([5e5472b](https://github.com/bangkeut-technology/daily-brew/commit/5e5472b0ede4de5700f0b4cbc90f3814798e1ead))
* **attendance:** implement `AttendanceBatch` support and refactor entity accessors ([d4d38f7](https://github.com/bangkeut-technology/daily-brew/commit/d4d38f77a3a6e7ed63a04566b65ecd6784f42822))
* **attendance:** optimize batch management methods in repository and subscriber ([53c65de](https://github.com/bangkeut-technology/daily-brew/commit/53c65dee838286e2bd6101ab0411dfc20aa0b551))
* **attendance:** refactor attendance batch pages and translations ([addeca1](https://github.com/bangkeut-technology/daily-brew/commit/addeca103dfde0db42c9dd789ef978ac66f6aa8f))
* **attendance:** refactor attendance batches and improve UI components ([091bb60](https://github.com/bangkeut-technology/daily-brew/commit/091bb600cd3903757359e8f7671d56a02323c246))
* **attendance:** refactor date handling in AttendanceBatchSubscriber ([f862195](https://github.com/bangkeut-technology/daily-brew/commit/f862195c5a3b84ab32cdf9c40f0cd937bd6c2673))
* **attendance:** remove employee filter from upcoming attendance batches ([05eb31b](https://github.com/bangkeut-technology/daily-brew/commit/05eb31b63bd1dda57c4e06da3e5597513616160e))
* **attendance:** replace react-query with router loader for batch pages ([ac8a77a](https://github.com/bangkeut-technology/daily-brew/commit/ac8a77a6fc9ed9ffeb6342d968410dfa4ff6a9a2))
* **attendance:** reset form values when reopening AttendanceDialog in edit mode ([b2271b1](https://github.com/bangkeut-technology/daily-brew/commit/b2271b1a09016bae88b032939b4b0dccaf6d31ca))
* **auth:** enhance logout flow with secure cookies and form-based submission ([6d770d6](https://github.com/bangkeut-technology/daily-brew/commit/6d770d62b25f53e7cd1cf21b245b7159304a1100))
* **authentication:** add demo role management in context ([f7d4eb5](https://github.com/bangkeut-technology/daily-brew/commit/f7d4eb5f15d98cc5adbdd9b3a54525036c11ba89))
* **authentication:** refactor authentication flow and add workspace support ([4a82b62](https://github.com/bangkeut-technology/daily-brew/commit/4a82b626b929f40719d269922b46c827b74db793))
* **authentication:** refactor authentication hooks and context ([4d610d0](https://github.com/bangkeut-technology/daily-brew/commit/4d610d0c3256f4c5355d3d00008094b8f6755c80))
* **authentication:** update authentication hooks to use state management ([3c5540e](https://github.com/bangkeut-technology/daily-brew/commit/3c5540ea9e5c8e28d2b54eff41673d864a67a0ba))
* **auth:** improve logout functionality with secure cookies and refactored frontend logic ([35170a2](https://github.com/bangkeut-technology/daily-brew/commit/35170a2e2ceb9c94c1a36a283cee137435c32ef8))
* **auth:** rename authentication actions for clarity ([67035e9](https://github.com/bangkeut-technology/daily-brew/commit/67035e9ead7c31d8033e95479b43d53fe5d520ab))
* **buttons:** add className prop to DeleteEmployeeButton for custom styling ([70854c5](https://github.com/bangkeut-technology/daily-brew/commit/70854c5eafadcdcd56ddaf13448a3e801132e5f2))
* **check-in:** implement device verification for enhanced security ([5ef29be](https://github.com/bangkeut-technology/daily-brew/commit/5ef29be988435c8dfde854d034a6bc8a5341b6ca))
* **components:** add `Logo` component usage and improve not-found handling ([d83bd33](https://github.com/bangkeut-technology/daily-brew/commit/d83bd33fd2a71fcac91d2b983c01fe35c89c4c9f))
* **components:** enhance not-found handling and route configuration ([4c74fc9](https://github.com/bangkeut-technology/daily-brew/commit/4c74fc979ecdb5193321a34d9584cbc5170518b6))
* **config:** enhance session security and proxy handling in framework configuration ([532d501](https://github.com/bangkeut-technology/daily-brew/commit/532d501c3ed7a80c0afa28574f67266a35314698))
* **config:** increase maximum cache file size for service worker to 15MB ([7ed9e0b](https://github.com/bangkeut-technology/daily-brew/commit/7ed9e0b11431e4fffc34ae77c0a135c8756d93fe))
* **demo:** add context and provider for demo session state management ([46a1e1d](https://github.com/bangkeut-technology/daily-brew/commit/46a1e1d6bd3b58fea3ea03ff516f806d883e461d))
* **demo:** add demo session setup and handling ([b6f082a](https://github.com/bangkeut-technology/daily-brew/commit/b6f082ae23bf499bc3ae6d4b12ec8afa227c4dc9))
* **demo:** add DemoPill component and integrate into AppSidebar ([87370bd](https://github.com/bangkeut-technology/daily-brew/commit/87370bd12f427b20a26e9f6abda67616d9a27f69))
* **demo:** enhance demo session handling ([f8d4aaf](https://github.com/bangkeut-technology/daily-brew/commit/f8d4aafe535f4ed6f9f14bc3a8398062b7524894))
* **demo:** enhance demo session hooks with state and dispatch access ([7a3de23](https://github.com/bangkeut-technology/daily-brew/commit/7a3de23df8f418106d752ccfe25786a724affc6b))
* **demo:** enhance demo session management and cleanup ([e9b8b89](https://github.com/bangkeut-technology/daily-brew/commit/e9b8b892e617f01d6307f51ee46dfbc8b821ca07))
* **demo:** enhance demo session management and user creation ([9a0afb0](https://github.com/bangkeut-technology/daily-brew/commit/9a0afb0358f7136e2e17a7c6f5504fe0692fe451))
* **demo:** enhance demo session management and user creation ([8c5d86b](https://github.com/bangkeut-technology/daily-brew/commit/8c5d86b3afa613b03273f4db9b774331e3fb8e47))
* **demo:** enhance demo session management with new status and reset endpoints ([d75dad4](https://github.com/bangkeut-technology/daily-brew/commit/d75dad41f54b808313d8cbe14aa195cc35772508))
* **demo:** implement demo session management with user and organization seeding ([2fd59f1](https://github.com/bangkeut-technology/daily-brew/commit/2fd59f1668a9e22df06d138fbf34c9f5b49227c5))
* **demo:** implement user-related data deletion in demo session cleanup ([a035d25](https://github.com/bangkeut-technology/daily-brew/commit/a035d25e8debbac53704a6c1c40b7e71319d70ab))
* **demo:** rename `DemoController` to `DemoSessionController` and add rate limiting ([eb1aeca](https://github.com/bangkeut-technology/daily-brew/commit/eb1aeca5fd14c57847e5849745189dcb98aa32fd))
* **demo:** update demo session types and context dispatch ([7bb121c](https://github.com/bangkeut-technology/daily-brew/commit/7bb121c60c0dd6761b23ecb60b14587607fecec8))
* **dto:** introduce DTOs and integrate them in API responses ([3547dfb](https://github.com/bangkeut-technology/daily-brew/commit/3547dfb27048d5a30d2457bf893355d31165b190))
* **employee-data-table:** integrate navigation for employee details ([4d3c436](https://github.com/bangkeut-technology/daily-brew/commit/4d3c436ac45abd277384ec4cde8b5768caa1d7c3))
* **employee-delete:** improve delete confirmation button and update react-hooks dependency ([1d35a1b](https://github.com/bangkeut-technology/daily-brew/commit/1d35a1b3fd9b24a2248be9e87b5783f62bc001d7))
* **employees:** add delete employee functionality with confirmation modal ([25b71aa](https://github.com/bangkeut-technology/daily-brew/commit/25b71aa556cef7134e4d2fb1c2d24570713b2ab8))
* **employees:** enable row click navigation in employee table ([8d8b68f](https://github.com/bangkeut-technology/daily-brew/commit/8d8b68f28979250eaed71508f033f8d930304feb))
* **employees:** enable row click navigation in employee table ([a2658b1](https://github.com/bangkeut-technology/daily-brew/commit/a2658b1aea670d04fd2a586763695b227e9d8fbf))
* enhance attendance handling and update dependencies ([369e36d](https://github.com/bangkeut-technology/daily-brew/commit/369e36d6952c0eebc6f3c1c6422fb11a2104ff87))
* **entity, ui:** add `Groups` mapping to entities and implement `FullScreenLoader` component ([f3b4692](https://github.com/bangkeut-technology/daily-brew/commit/f3b469284bb97132991a38969a1742be9858c8fd))
* **env:** add `TRUSTED_PROXIES` to environment configuration for proxy handling ([6d70073](https://github.com/bangkeut-technology/daily-brew/commit/6d70073e647564770ba4b7f95370762f9dde9ffe))
* **errors:** add translation for invalid employee salary information ([b8a77e6](https://github.com/bangkeut-technology/daily-brew/commit/b8a77e63b5baa4f5598ae57b9ffc865c9cf11d36))
* **evaluation:** refactor `EvaluationTemplateCriteria` constructor ([ecdaa4d](https://github.com/bangkeut-technology/daily-brew/commit/ecdaa4d9bba1974d9fd69143fe00b37bb0d00715))
* **evaluation:** update unique constraints and add cascade delete for evaluation templates ([2e38741](https://github.com/bangkeut-technology/daily-brew/commit/2e38741a8f6c2ffd73abfa2534ad05368f2a8329))
* **glossary:** update and expand localization entries for attendance and evaluations ([498110b](https://github.com/bangkeut-technology/daily-brew/commit/498110bfe3512cabe4cc086344fe1d159a165579))
* **hero:** update "View demo" button to "Try the Demo" ([dfd3d88](https://github.com/bangkeut-technology/daily-brew/commit/dfd3d883f6f99bfb22f02b6e457f4950cd4ce90e))
* **logging:** integrate Monolog for improved logging configuration across environments ([2c5e712](https://github.com/bangkeut-technology/daily-brew/commit/2c5e71288a2c5c5964e743e5b4eff869d24dc3c8))
* **manage:** add allowed IPs management functionality ([0fbd1f2](https://github.com/bangkeut-technology/daily-brew/commit/0fbd1f24b4c736265ef358e5784a1389add22fe9))
* **migration:** add auth_code column to daily_brew_users table ([52f590e](https://github.com/bangkeut-technology/daily-brew/commit/52f590ecc83096457b139a17df507883a67b25a1))
* **migration:** add migration for workspace invite support and update invite logic ([e58b1c6](https://github.com/bangkeut-technology/daily-brew/commit/e58b1c61a45c7d0a78261c4aa9f0ddd46479b03a))
* **oauth, ui:** add `findByOAuth` support and update routes for consistent naming ([c5e372a](https://github.com/bangkeut-technology/daily-brew/commit/c5e372acefeb945cb13495b80bebeaadeb8221f0))
* **oauth:** add abstract OAuth connect controller and provider-specific implementations ([ba9acec](https://github.com/bangkeut-technology/daily-brew/commit/ba9aceccd670ad8a029e5d185758ffaff7d934f7))
* **payroll:** remove `#[Groups]` mappings, add employee linkage, and enhance DTOs and UI ([a1eda98](https://github.com/bangkeut-technology/daily-brew/commit/a1eda98421a7eb8fbc1c6f9974f19980585dea3b))
* **payslip:** add API endpoint for listing employee payslips by year ([f1e84cb](https://github.com/bangkeut-technology/daily-brew/commit/f1e84cbd21efcbc3a43d9191c6c9d222ebd49f55))
* **payslip:** add API endpoint for listing employee payslips by year ([f1d3115](https://github.com/bangkeut-technology/daily-brew/commit/f1d3115a3034e14f286d8ee5725833d64e286ea5))
* **payslip:** add API endpoint for listing employee payslips by year ([edf721e](https://github.com/bangkeut-technology/daily-brew/commit/edf721ee1f1fb86464f86b9634275e588a138db4))
* **profile:** add profile management routes and components ([8a5aac2](https://github.com/bangkeut-technology/daily-brew/commit/8a5aac2bed34c45f6bdd3504642eadfad3c1fa56))
* **PWA:** add service worker and web app manifest for offline support and improved UX ([fd2df67](https://github.com/bangkeut-technology/daily-brew/commit/fd2df6702d2dfe9d92c344bee702621df3e3fe92))
* **repository:** add `findByUserWithoutWorkspace` method across repositories ([8e476ea](https://github.com/bangkeut-technology/daily-brew/commit/8e476ea0d98f8d045096060daedac3d9f576121a))
* **roles:** add role details page and employee retrieval functionality ([1779a8c](https://github.com/bangkeut-technology/daily-brew/commit/1779a8c5842517d02154d097d62ebb7c3f58af47))
* **roles:** add role management endpoints and update localization ([342a099](https://github.com/bangkeut-technology/daily-brew/commit/342a0998a101593669d2e687c8c700c2916fec32))
* **roles:** add RolesPage route component for role management ([cadb833](https://github.com/bangkeut-technology/daily-brew/commit/cadb833e49c1fc408603813bd049a7de51892411))
* **roles:** associate roles with users and update unique constraints ([8b7f90d](https://github.com/bangkeut-technology/daily-brew/commit/8b7f90d2adf00f3e77252da6f77760f1bc4f88aa))
* **roles:** enhance role management by associating roles with users ([33d3da8](https://github.com/bangkeut-technology/daily-brew/commit/33d3da819d1d3aca1378a91107c6cba5282bf57e))
* **roles:** enhance role management with CRUD operations ([8019cde](https://github.com/bangkeut-technology/daily-brew/commit/8019cde33dbbef8f7e43af597a7eb59b7154f8f9))
* **security:** add public access for `/demo/start` route ([0b48fbb](https://github.com/bangkeut-technology/daily-brew/commit/0b48fbbcefb01cca49d2dbea173932b451b37878))
* **security:** integrate 2FA using `scheb/2fa-bundle` and improve authentication hooks ([9974003](https://github.com/bangkeut-technology/daily-brew/commit/997400338460f87b7213f1ffcf36f1c39bef67c1))
* **security:** refactor routes in SecurityController ([2301ad3](https://github.com/bangkeut-technology/daily-brew/commit/2301ad3aff26ff6cf0ee33998fd9a4dc91c8557b))
* **seo:** add `robots.txt`, `sitemap.xml`, and meta tags for improved SEO across pages ([802e701](https://github.com/bangkeut-technology/daily-brew/commit/802e7015d91b8def3cd2d69e78a48981d5b240b1))
* **settings:** integrate workspace support into settings fetch and update logic ([10ff5c4](https://github.com/bangkeut-technology/daily-brew/commit/10ff5c45904f5e5f52dd9054d68b8d1dfd2f44cc))
* **settings:** rename `Setting` to `UserSetting` for improved clarity ([3ae6ed5](https://github.com/bangkeut-technology/daily-brew/commit/3ae6ed57674c2a181b16925d9f3509c3c9faac66))
* **shift:** add `ShiftAttendanceService` for shift-based attendance type detection ([9ab0f87](https://github.com/bangkeut-technology/daily-brew/commit/9ab0f87d06acf89d40561e0a1d29d9719c8d971d))
* **shift:** implement shift management UI and ISO day enum ([87f953d](https://github.com/bangkeut-technology/daily-brew/commit/87f953da65f80e4c5515fe047fbf5513b1f3fce3))
* **ui:** add `Container` component and center content in demo layout ([2b55160](https://github.com/bangkeut-technology/daily-brew/commit/2b55160f84f1d6df0b0623f26d6844923fbfe786))
* **ui:** add reusable components for enhanced UI composition ([6218305](https://github.com/bangkeut-technology/daily-brew/commit/621830527c4b57e79178b761924172d2c017fb50))
* **user:** enhance workspace creation and token generation logic ([7952830](https://github.com/bangkeut-technology/daily-brew/commit/795283057cdcf67b26b557e486ff441dedd6dfd5))
* **user:** link user to workspace during creation ([80b91ad](https://github.com/bangkeut-technology/daily-brew/commit/80b91adf833cb49c76d179a68dd23d6e2d3daf21))
* **workspace:** add `AccountDeletionService` and implement user account deletion flow ([64628af](https://github.com/bangkeut-technology/daily-brew/commit/64628afa29189111952a430e405764d54a8f997e))
* **workspace:** add `findByPublicIdAndUser` method and improve invite handling ([a8cad7b](https://github.com/bangkeut-technology/daily-brew/commit/a8cad7b41019855359091e254814818332aac629))
* **workspace:** add migration for workspace support and update entity associations ([e19fcac](https://github.com/bangkeut-technology/daily-brew/commit/e19fcac8e98509d82b9c8d6815301d15d7fbadea))
* **workspace:** add plan support in WorkspaceBootstrapCommand and update FK constraints ([8aa3340](https://github.com/bangkeut-technology/daily-brew/commit/8aa3340728be0a3697e9dede216369f25ce48614))
* **workspace:** add soft delete support and implement member management ([3051666](https://github.com/bangkeut-technology/daily-brew/commit/3051666cc4598a958722c995625179e755af0c4f))
* **workspace:** add soft delete support for workspaces and users ([b4461eb](https://github.com/bangkeut-technology/daily-brew/commit/b4461eb54f37a28c0c69dde5e82e2a395c5011ab))
* **workspace:** enhance workspace association and repository functionality ([f7965d7](https://github.com/bangkeut-technology/daily-brew/commit/f7965d791bb6ba076294e5906a952ecac8071fac))
* **workspace:** implement workspace invite voter and enhance invite management ([95c2665](https://github.com/bangkeut-technology/daily-brew/commit/95c2665d35d42960996a548ffb92cd15bc7136b2))
* **workspace:** implement workspace leave request and member management ([8cce9ed](https://github.com/bangkeut-technology/daily-brew/commit/8cce9edd2daaa8c9bbb986866fb91c76bdae4441))
* **workspace:** implement workspace support and enhance entity associations ([113365f](https://github.com/bangkeut-technology/daily-brew/commit/113365f35325f94007ae0517ad8455ebf44b0de8))
* **workspace:** implement workspace switcher functionality in UI and API ([2aceef9](https://github.com/bangkeut-technology/daily-brew/commit/2aceef99568f82df261c57ac2dc03caaf6596ae9))
* **workspace:** refactor `Account` to `Workspace` and update related entities ([941c1b1](https://github.com/bangkeut-technology/daily-brew/commit/941c1b1d8cbc5d516f0f3e0a423f14ec9369bd3d))
* **workspace:** remove workspace association from `EvaluationTemplateCriteria` and add image upload support ([ece091b](https://github.com/bangkeut-technology/daily-brew/commit/ece091b63e200c5bba94a6b9da4ad2ff88dc529a))


### Bug Fixes

* **attendance:** handle duplicate batch label validation logic ([be82c42](https://github.com/bangkeut-technology/daily-brew/commit/be82c42dfbb0a1cff92e300ad6151e5aacaa2fe3))
* **buttons:** improve deletion handling and update dependencies ([f36965a](https://github.com/bangkeut-technology/daily-brew/commit/f36965aa4eeca21971b9fce7847bf298d8018c11))
* **demo:** rename demo session table and indexes ([7256358](https://github.com/bangkeut-technology/daily-brew/commit/725635845726ca9c5708e7c80059610501db2964))
* **user:** update `Vich` import to use `Attribute` instead of `Annotation` ([7ccc616](https://github.com/bangkeut-technology/daily-brew/commit/7ccc6168b8f9cbd87ae9ec367f247d423c97966e))
