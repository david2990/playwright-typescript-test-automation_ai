# Playwright UI Test Automation

Browser UI test automation for the [Tricentis Demo Web Shop](https://demowebshop.tricentis.com), built with **Playwright + TypeScript**.

The suite is organised around a **smoke pack** — a small set of business-critical journeys that must pass in under ten minutes — executed by Jenkins every two hours.

## Requirements

- Node.js 20 or newer
- npm (lockfile is committed)

## Quick start

```bash
npm ci                          # install dependencies
npx playwright install chromium # one-off browser download
cp .env.example .env            # then fill in TEST_USER / TEST_PASS
npm run test:smoke              # run the smoke pack headless
npm run report                  # open the HTML report
```

## Scripts

| Command                      | Purpose                                             |
| ---------------------------- | --------------------------------------------------- |
| `npm test`                   | Run every test in all projects                      |
| `npm run test:smoke`         | Smoke pack only (`@smoke`, excluding `@quarantine`) |
| `npm run test:smoke:headed`  | Same, with a visible browser for debugging          |
| `npm run test:ui`            | Playwright UI mode                                  |
| `npm run report`             | Open the last Playwright HTML report                |
| `npm run report:allure`      | Build the Allure report into `allure-report/`       |
| `npm run report:allure:open` | Serve the last Allure report locally                |
| `npm run typecheck`          | `tsc --noEmit`                                      |
| `npm run lint`               | ESLint                                              |
| `npm run format`             | Prettier write                                      |

## Watching a run

```bash
# visible browser, each action slowed to 800ms, recorded to test-results/<test>/video.webm
SLOWMO=800 VIDEO=on npx playwright test tests/testcases/tc-001-register.spec.ts \
  --project=chromium --headed --no-deps
```

`--no-deps` skips the login session setup when a case (like registration) does not need it.

## Automated manual test cases

Each file in `tests/testcases/` maps to a numbered manual case and carries both the case ID
and a suite tag, so `--grep @tc-001` runs one case and `--grep @regression` runs them all.
They are excluded from `@smoke` because they create real data (TC-001 registers a customer).

## Project layout

```
.
├─ src/
│  ├─ config/env.ts           # single source of truth for BASE_URL and credentials
│  ├─ fixtures/base.fixture.ts# injects every page object into tests
│  └─ pages/                  # page objects (home, login, register, category, product, cart, search)
├─ tests/
│  ├─ setup/auth.setup.ts     # signs in once, saves auth/standard-user.json
│  ├─ smoke/                  # the smoke pack (@smoke)
│  ├─ testcases/              # automated manual test cases, one file per case (tc-001-…)
│  └─ authenticated/          # tests that reuse the saved session
├─ docs/
│  ├─ smoke-pack.md           # what is in the smoke pack and why
│  └─ jenkins-setup.md        # job, credentials, agent and GitHub setup
├─ playwright.config.ts
├─ Jenkinsfile
└─ auth/                       # generated storage state (gitignored)
```

## Configuration

| Variable    | Required        | Description                                                             |
| ----------- | --------------- | ----------------------------------------------------------------------- |
| `BASE_URL`  | no              | Application URL, defaults to the demo shop                              |
| `TEST_USER` | for login tests | Test account email                                                      |
| `TEST_PASS` | for login tests | Test account password                                                   |
| `CI`        | set by Jenkins  | Enables retries, `forbidOnly` and 4 workers                             |
| `WORKERS`   | no              | Worker count in CI (default 4)                                          |
| `SLOWMO`    | no              | Milliseconds to slow every action down (e.g. `800`) when watching a run |
| `VIDEO`     | no              | `on` records every run to `test-results/`, not just failures            |
| `ALLURE`    | no              | `on` adds the Allure reporter and writes `allure-results/`              |

Locally these come from `.env` (gitignored). In Jenkins they are injected from the
`demowebshop-test-user` credential — never committed.

> Quote values that contain `#` — dotenv treats an unquoted `#` as the start of a comment
> and silently truncates the value (`TEST_PASS="Test123!@#"`).

## Projects

| Project                  | Scope                                                   |
| ------------------------ | ------------------------------------------------------- |
| `auth-setup`             | Logs in once and writes `auth/standard-user.json`       |
| `chromium`               | Guest tests (`tests/smoke`)                             |
| `chromium-authenticated` | Tests in `tests/authenticated`, using the saved session |

## Smoke pack

See [docs/smoke-pack.md](docs/smoke-pack.md). Rule of thumb: the pack stays under ten
minutes, every test is owned, and a test that only passes on retry is quarantined with
`@quarantine` and fixed rather than retried into silence.

## CI

GitHub Actions in `.github/workflows/` is the primary gate:

- `ci.yml` runs on every pull request and on pushes to `main`: typecheck, lint, format
  check, then the smoke pack. `TEST_USER` / `TEST_PASS` come from repository secrets;
  runs without them (fork pull requests) fall back to the guest-only pack with
  `--project=chromium --no-deps`, which skips the login setup project.
- `smoke.yml` runs every two hours (`cron('17 */2 * * *')`, UTC) and can be dispatched
  manually with a tag (`@smoke`, `@regression`, `@tc-003`) or a different `BASE_URL`.
- `daily-manual-cases.yml` runs **only** the three manual test cases once a day
  (`cron('0 5 * * *')`, UTC) with `--grep @regression --project=chromium --no-deps`, which
  keeps the `auth-setup` project out, and publishes their Allure report to the site root.

Both upload the HTML report and the JUnit XML, plus traces, videos and screenshots when a
test fails. The Jenkins pipeline remains as a fallback and runs the same pack via
`cron('H */2 * * *')`, publishing the same reports. Full setup steps:
[docs/jenkins-setup.md](docs/jenkins-setup.md).

## Allure reporting

Allure ([Playwright + TypeScript guide](https://allurereport.org/docs/playwright/)) is
opt-in so normal runs stay fast: it only activates when `ALLURE=on`.

```bash
ALLURE=on npx playwright test --grep @regression   # writes allure-results/
npm run report:allure                              # builds allure-report/
npm run report:allure:open                         # serves it on localhost
```

### Publishing the report

Two workflows publish to the same `gh-pages` branch with
[`peaceiris/actions-gh-pages`](https://github.com/peaceiris/actions-gh-pages):

| Workflow                 | Contents               | URL                                       |
| ------------------------ | ---------------------- | ----------------------------------------- |
| `daily-manual-cases.yml` | TC-001, TC-002, TC-003 | `https://<owner>.github.io/<repo>/`       |
| `ci.yml`                 | the smoke pack         | `https://<owner>.github.io/<repo>/smoke/` |

One-time setup (already enabled for this repository): **Settings → Pages → Build and
deployment → Source: Deploy from a branch → Branch: `gh-pages` → `/ (root)` → Save**. The
Allure HTML report uses only relative URLs, so it works unchanged under any sub-path. Both
publish jobs share the `gh-pages-publish` concurrency group, so they queue rather than race
on the branch.

The same job posts a run summary table on pull requests and a quality-gate check through
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
- Tests are tagged `@smoke` in the title when they belong to the smoke pack.
- Page objects live in `src/pages`; tests never hold raw selectors or URLs.
