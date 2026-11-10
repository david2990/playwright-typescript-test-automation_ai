# Playwright UI Test Automation

Browser UI test automation for the [Tricentis Demo Web Shop](https://demowebshop.tricentis.com), built with **Playwright + TypeScript**.

The suite automates the three manual test cases below, nothing else. Their Allure report is
published to GitHub Pages by a daily run, and history is kept between runs so trends show up.

| Case   | Steps                                                            | Spec                                         |
| ------ | ---------------------------------------------------------------- | -------------------------------------------- |
| TC-001 | Open the storefront → Register → complete registration → Log out | `tests/testcases/tc-001-register.spec.ts`    |
| TC-002 | Open Login → enter email and password → Login                    | `tests/testcases/tc-002-login.spec.ts`       |
| TC-003 | Log in → Computers → Desktops → Add to cart                      | `tests/testcases/tc-003-add-to-cart.spec.ts` |

## Requirements

- Node.js 20 or newer
- npm (lockfile is committed)

## Quick start

```bash
npm ci                          # install dependencies
npx playwright install chromium # one-off browser download
cp .env.example .env            # then fill in TEST_USER / TEST_PASS
npm run test:cases              # run the three manual cases headless
npm run report                  # open the HTML report
```

## Scripts

| Command                      | Purpose                                          |
| ---------------------------- | ------------------------------------------------ |
| `npm test`                   | Run every test in the suite (the three cases)    |
| `npm run test:cases`         | The three manual cases (`@regression`, Chromium) |
| `npm run test:cases:headed`  | Same, with a visible browser for debugging       |
| `npm run test:ui`            | Playwright UI mode                               |
| `npm run report`             | Open the last Playwright HTML report             |
| `npm run report:allure`      | Build the Allure report into `allure-report/`    |
| `npm run report:allure:open` | Serve the last Allure report locally             |
| `npm run typecheck`          | `tsc --noEmit`                                   |
| `npm run lint`               | ESLint                                           |
| `npm run format`             | Prettier write                                   |

## Watching a run

```bash
# visible browser, each action slowed to 800ms, recorded to test-results/<test>/video.webm
SLOWMO=800 VIDEO=on npx playwright test tests/testcases/tc-001-register.spec.ts --headed
```

## Project layout

```
.
├─ src/
│  ├─ config/env.ts           # single source of truth for BASE_URL and credentials
│  ├─ fixtures/base.fixture.ts# injects the page objects into tests
│  └─ pages/                  # page objects (home, header, login, register, category, product)
├─ tests/
│  └─ testcases/              # the three manual cases, one file per case
├─ docs/
│  └─ jenkins-setup.md        # Jenkins job, credentials, agent and GitHub setup
├─ .github/workflows/
│  ├─ ci.yml                  # checks + the three cases on every push/PR, publishes the report
│  └─ daily-manual-cases.yml  # the three cases once a day, publishes the report
├─ playwright.config.ts
├─ Jenkinsfile
└─ allurerc.json
```

## Configuration

| Variable    | Required       | Description                                                             |
| ----------- | -------------- | ----------------------------------------------------------------------- |
| `BASE_URL`  | no             | Application URL, defaults to the demo shop                              |
| `TEST_USER` | for TC-002/003 | Test account email                                                      |
| `TEST_PASS` | for TC-002/003 | Test account password                                                   |
| `CI`        | set by CI      | Enables retries, `forbidOnly` and 4 workers                             |
| `WORKERS`   | no             | Worker count in CI (default 4)                                          |
| `SLOWMO`    | no             | Milliseconds to slow every action down (e.g. `800`) when watching a run |
| `VIDEO`     | no             | `on` records every run to `test-results/`, not just failures            |
| `ALLURE`    | no             | `on` adds the Allure reporter and writes `allure-results/`              |

Locally these come from `.env` (gitignored). In GitHub Actions they come from repository
secrets; in Jenkins from the `demowebshop-test-user` credential — never committed.

TC-002 and TC-003 **skip** themselves (rather than fail) when the credentials are absent.

> Quote values that contain `#` — dotenv treats an unquoted `#` as the start of a comment
> and silently truncates the value (`TEST_PASS=\"Test123!@#\"`).

## CI

GitHub Actions in `.github/workflows/`:

- `ci.yml` runs on every pull request and on pushes to `main`: typecheck, lint and format
  check, then the three manual cases with `--grep @regression --project=chromium --no-deps`.
  It uploads the HTML/JUnit/Allure reports, posts the Allure summary on pull requests, and
  publishes the Allure report to the site root from `main`.
- `daily-manual-cases.yml` runs the same three cases once a day
  (`cron('0 5 * * *')`, UTC) and can be dispatched manually with a different `BASE_URL` or
  `WORKERS`. It publishes the same Allure report to the site root.

Both upload traces, videos and screenshots when a test fails.

## Allure reporting

Allure ([Playwright + TypeScript guide](https://allurereport.org/docs/playwright/)) is
opt-in so normal runs stay fast: it only activates when `ALLURE=on`.

```bash
ALLURE=on npx playwright test --grep @regression --project=chromium --no-deps
npm run report:allure                              # builds allure-report/
npm run report:allure:open                         # serves it on localhost
```

### Published report

`https://<owner>.github.io/<repo>/` holds the Allure report for the three cases, refreshed
by `daily-manual-cases.yml` at 05:00 UTC and by `ci.yml` on every push to `main`. Both
publish jobs share the `gh-pages-publish` concurrency group, so they queue rather than race
on the branch.

One-time setup (already enabled for this repository): **Settings → Pages → Build and
deployment → Source: Deploy from a branch → Branch: `gh-pages` → `/ (root)` → Save**. The
Allure HTML report uses only relative URLs, so it works unchanged under any sub-path.

The same CI job posts a run summary table on pull requests and a quality-gate check through
the [Allure GitHub Action](https://allurereport.org/docs/integrations-github-action/)
(`allure-framework/allure-action@v0`), linking each row to the published report via
`remote-href`. Fork pull requests get a read-only token, so that step is skipped there.

### History and trends

Allure 3 keeps run-to-run history in `.allure/history.jsonl` (see
[`allurerc.json`](allurerc.json)). The workflows restore that file with `actions/cache`
(`restore-keys: allure-history-`) before generating, so trends accumulate across runs.
For durable, per-branch history without cache eviction, deploy the free
[Allure Storage Service](https://allurereport.org/docs/self-hosted-storage/) (Docker or
Cloudflare Workers) and set `allureService.accessToken` with `publish: true` in the
`awesome` plugin — the report URL then comes back in `summary.json` and `remote-href` is
no longer needed.

## Conventions

- Selectors use roles, labels, IDs or stable classes — no brittle CSS chains, no XPath.
- No `waitForTimeout`. Use web-first assertions (`await expect(locator).toBeVisible()`).
- Every test is independent: its own browser context, its own data, no ordering.
- Page objects live in `src/pages`; tests never hold raw selectors or URLs.
