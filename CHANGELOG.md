# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.14](https://github.com/bluelovers/error-stack/compare/error-stack2@1.0.13...error-stack2@1.0.14) (2021-12-06)


### 🐛　Bug Fixes

* invalid "main" entry ([9dbaeab](https://github.com/bluelovers/error-stack/commit/9dbaeaba7d53cafad267059c71d44d1a4ce7dda5))





## [1.0.13](https://github.com/bluelovers/error-stack/compare/error-stack2@1.0.12...error-stack2@1.0.13) (2021-12-06)


### 🛠　Build System

* update tsdx ([1d26382](https://github.com/bluelovers/error-stack/commit/1d263825597dfdc0f46c388b2f85b82d890cca4d))





## [1.0.12](https://github.com/bluelovers/error-stack/compare/error-stack2@1.0.11...error-stack2@1.0.12) (2021-08-22)

**Note:** Version bump only for package error-stack2





## [1.0.11](https://github.com/bluelovers/error-stack/compare/error-stack2@1.0.10...error-stack2@1.0.11) (2021-08-22)


### ✨　Features

* 支援 `AssertionError [ERR_ASSERTION]: xxx` ([1e78530](https://github.com/bluelovers/error-stack/commit/1e785304b72a5dcc3e8509f78886ce6ac27a535b))
* `parseMessage` 支援 `AssertionError [ERR_ASSERTION]: xxx` ([36f9686](https://github.com/bluelovers/error-stack/commit/36f96867499be4bbef60f5895bcf728df7756aa0))





## [1.0.10](https://github.com/bluelovers/error-stack/compare/error-stack2@1.0.9...error-stack2@1.0.10) (2021-08-22)


### ✨　Features

* try debug ([e4dbc36](https://github.com/bluelovers/error-stack/commit/e4dbc36bad980590cbb00db57c116a8b27b630fa))





## [1.0.9](https://github.com/bluelovers/error-stack/compare/error-stack2@1.0.8...error-stack2@1.0.9) (2021-08-22)

**Note:** Version bump only for package error-stack2





## [1.0.8](https://github.com/bluelovers/error-stack/compare/error-stack2@1.0.7...error-stack2@1.0.8) (2021-08-22)


### ✨　Features

* allow unsupported lines in traces ([50deae0](https://github.com/bluelovers/error-stack/commit/50deae073a75813f2cc0adba7d0ecf558a0a055c))





## [1.0.7](https://github.com/bluelovers/error-stack/compare/error-stack2@1.0.6...error-stack2@1.0.7) (2021-08-22)


### 🐛　Bug Fixes

* update type ([a3d2201](https://github.com/bluelovers/error-stack/commit/a3d220185e378f6de678eada352d53bfb7c843db))


### ✨　Features

* support give message when parse ([a2185c0](https://github.com/bluelovers/error-stack/commit/a2185c093638ba4102aa0cd0cfa435744111fc68))
* support detect indent ([a684d83](https://github.com/bluelovers/error-stack/commit/a684d83440bb26ff47d6f1430bda509c400b09ef))


### 📦　Code Refactoring

* remove `messageLines` ([53cbeff](https://github.com/bluelovers/error-stack/commit/53cbeff4666b6f58df47482a70ebc18e6b7e124a))
* update code ([786124c](https://github.com/bluelovers/error-stack/commit/786124c044f4a3316c4d6eb028e7e4e75b0976bc))





## [1.0.6](https://github.com/bluelovers/error-stack/compare/error-stack2@1.0.5...error-stack2@1.0.6) (2021-08-19)


### 🐛　Bug Fixes

* support empty message ([0ebfccb](https://github.com/bluelovers/error-stack/commit/0ebfccb36762055e4cba244bd3a941db1bb6da25))
* support `eval at <anonymous> (:1:1)` ([1bd29d3](https://github.com/bluelovers/error-stack/commit/1bd29d3af83739d58bfa4c109430ab37244f85e3))


### ⚙️　Continuous Integration

* add `@yarn-tool/require-resolve` ([9a6766c](https://github.com/bluelovers/error-stack/commit/9a6766c279b3662694f20e5fcd9286973544f76c))
* add `--force` ([330eb4e](https://github.com/bluelovers/error-stack/commit/330eb4e997d79baa831739e763890a00b934cd55))
* update test and ci ([770b7c2](https://github.com/bluelovers/error-stack/commit/770b7c2faec0f6b1095e7e77e674cb32ff29e573))


### 🔖　Miscellaneous

* . ([082f043](https://github.com/bluelovers/error-stack/commit/082f043864f246cefc347134b1d5847292eaa88a))
* . ([d49f064](https://github.com/bluelovers/error-stack/commit/d49f064d586ac9d6138bd5751107ca49690e96ed))
* . ([18c18d5](https://github.com/bluelovers/error-stack/commit/18c18d518c1a61b7e4d9da53c0f2cc21ee43e77e))
* . ([be7f4e5](https://github.com/bluelovers/error-stack/commit/be7f4e549645075cee173f75d14ca526f1dec9bb))





## [1.0.5](https://github.com/bluelovers/error-stack/compare/error-stack2@1.0.4...error-stack2@1.0.5) (2021-08-18)


### ✨　Features

* add `rawStack` ([b5463eb](https://github.com/bluelovers/error-stack/commit/b5463ebac4bd47117d3799df3bf619a131a56607))





## 1.0.4 (2021-08-18)


### 🐛　Bug Fixes

* 修正 eval 與 `at new Promise (<anonymous>)` ([6b61b32](https://github.com/bluelovers/error-stack/commit/6b61b32abc58bceb6bd48b5b7b11a4081ebff8d7))
* `parseSource` with `C:\\xxx` ([5c99d89](https://github.com/bluelovers/error-stack/commit/5c99d89a774e31e2798b2496b87ac0720b55c0b5))


### 📦　Code Refactoring

* **build:** ts ([ba82637](https://github.com/bluelovers/error-stack/commit/ba826377c59130ebc2c2262d9775b7474f6ad10b))
* **build:** tsdx ([9d9f32f](https://github.com/bluelovers/error-stack/commit/9d9f32fd2bb7aa087b8666a16dfcc555429b806d))


### 🛠　Build System

* dts ([4cefb67](https://github.com/bluelovers/error-stack/commit/4cefb6719a4278b1522cba7a9d036f661666042e))


### 🔖　Miscellaneous

* . ([8fbe869](https://github.com/bluelovers/error-stack/commit/8fbe8698e575e53a995c648d775e78937c830d61))
* . ([468e69f](https://github.com/bluelovers/error-stack/commit/468e69f3dbf98e0e79609dc0073cbe29b74c025d))
* upgrade dev deps ([3e6c0e7](https://github.com/bluelovers/error-stack/commit/3e6c0e7e5c289fc2ffbbb79ec7e7b5804e836eea))



## 1.0.3 "🔖　Miscellaneous" (2020-03-26)


### 🔖　Miscellaneous

* bump version 1.0.3 ([81490f9](https://github.com/bluelovers/error-stack/commit/81490f958529c0a167315c430f89f181df0c832b))
* Merge pull request #1 from vivaxy/patch-1 ([e474458](https://github.com/bluelovers/error-stack/commit/e4744588d61709eb78c7ef614aca9c4152f84713)), closes [#1](https://github.com/bluelovers/error-stack/issues/1)



## 1.0.2 "🔖　Miscellaneous" (2019-08-16)


### 🔖　Miscellaneous

* 1.0.2: fixes error stack with multiple lines ([dc10da0](https://github.com/bluelovers/error-stack/commit/dc10da00ad98b1652c78704186ed7bf625bd131f))
* removes stale comments ([1bcc1e4](https://github.com/bluelovers/error-stack/commit/1bcc1e4fbfd76088e932a0dfe07ff4072377176b))
* Fix demo in usage ([23f750d](https://github.com/bluelovers/error-stack/commit/23f750dc5c7756937a72010a4faf262366c1b9fc))



## 1.0.1 "🔖　Miscellaneous" (2019-06-12)


### 🔖　Miscellaneous

* 1.0.1: fixes brackets balancing ([ae6f3bd](https://github.com/bluelovers/error-stack/commit/ae6f3bd658b851df68d23d94bf7b5da1358e9127))



# 1.0.0 "🔖　Miscellaneous" (2019-06-12)


### 🔖　Miscellaneous

* 1.0.0 ([9830965](https://github.com/bluelovers/error-stack/commit/983096562114b42f8a3eceb10ebeaa3a5a405eb3))
* first commit ([2b45902](https://github.com/bluelovers/error-stack/commit/2b459022ffea7702026a6d2e42167dfeae0dba8d))
