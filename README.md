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

| Command | Purpose |
| --- | --- |
| `npm test` | Run every test in all projects |
| `npm run test:smoke` | Smoke pack only (`@smoke`, excluding `@quarantine`) |
| `npm run test:smoke:headed` | Same, with a visible browser for debugging |
| `npm run test:ui` | Playwright UI mode |
| `npm run report` | Open the last HTML report |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |

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

| Variable | Required | Description |
| --- | --- | --- |
| `BASE_URL` | no | Application URL, defaults to the demo shop |
| `TEST_USER` | for login tests | Test account email |
| `TEST_PASS` | for login tests | Test account password |
| `CI` | set by Jenkins | Enables retries, `forbidOnly` and 4 workers |
| `WORKERS` | no | Worker count in CI (default 4) |
| `SLOWMO` | no | Milliseconds to slow every action down (e.g. `800`) when watching a run |
| `VIDEO` | no | `on` records every run to `test-results/`, not just failures |

Locally these come from `.env` (gitignored). In Jenkins they are injected from the
`demowebshop-test-user` credential — never committed.

> Quote values that contain `#` — dotenv treats an unquoted `#` as the start of a comment
> and silently truncates the value (`TEST_PASS="Test123!@#"`).

## Projects

| Project | Scope |
| --- | --- |
| `auth-setup` | Logs in once and writes `auth/standard-user.json` |
| `chromium` | Guest tests (`tests/smoke`) |
| `chromium-authenticated` | Tests in `tests/authenticated`, using the saved session |

## Smoke pack

See [docs/smoke-pack.md](docs/smoke-pack.md). Rule of thumb: the pack stays under ten
minutes, every test is owned, and a test that only passes on retry is quarantined with
`@quarantine` and fixed rather than retried into silence.

## CI

Jenkins runs the pack every two hours via `cron('H */2 * * *')`, publishes JUnit results
and the Playwright HTML report, and archives traces/videos for failures. Full setup
steps: [docs/jenkins-setup.md](docs/jenkins-setup.md).

## Conventions

- Selectors use roles, labels, IDs or stable classes — no brittle CSS chains, no XPath.
- No `waitForTimeout`. Use web-first assertions (`await expect(locator).toBeVisible()`).
- Every test is independent: its own browser context, its own data, no ordering.
- Tests are tagged `@smoke` in the title when they belong to the smoke pack.
- Page objects live in `src/pages`; tests never hold raw selectors or URLs.
