# Jenkins setup

## 1. Agent prerequisites

The pipeline runs on an agent labelled `linux`. It needs:

| Requirement                   | Check                                                        |
| ----------------------------- | ------------------------------------------------------------ |
| Node.js 20+ and npm           | `node -v && npm -v`                                          |
| Chromium OS libraries         | `npx playwright install-deps chromium` (needs root, one-off) |
| Network access to the app URL | `curl -I https://demowebshop.tricentis.com`                  |
| ~1 GB free disk               | browser downloads + reports                                  |

`npx playwright install chromium` is run by the pipeline on every build; the download is
cached in `~/.cache/ms-playwright` so repeat builds are fast.

If the agent has Docker instead, replace the `agent` line in `Jenkinsfile` with:

```groovy
agent { docker { image 'mcr.microsoft.com/playwright:v1.52.0-jammy'; args '-u pwuser --ipc=host' } }
```

The image tag must match the `@playwright/test` version in `package.json` — bump both together.

## 2. Credentials

Create a **Username with password** credential:

- ID: `demowebshop-test-user`
- Username: the test account email
- Password: the test account password

The pipeline exposes them as `TEST_USER` / `TEST_PASS`. Nothing is written to the repo.

## 3. Job

1. New Item → **Multibranch Pipeline** (or Pipeline → Pipeline script from SCM with `Jenkinsfile`).
2. Branch source: the GitHub repository, script path `Jenkinsfile`.
3. Build triggers: enable **GitHub hook trigger for GITScm polling**. `Jenkinsfile` already declares
   `triggers { cron('H 5 * * *') }` — daily at a load-balanced minute.
4. Ensure the **JUnit**, **HTML Publisher** and (optionally) **Slack** plugins are installed.

For a non-multibranch job, `cron` and the webhook both still work; multibranch is preferred so
feature branches get the same checks.

## 4. First run

Trigger a build manually and confirm:

- [ ] `Typecheck` and `Lint` stages pass
- [ ] `Manual test cases` stage runs the three manual cases (TC-001, TC-002, TC-003)
- [ ] **Test Result** trend appears from `results/junit.xml`
- [ ] **Playwright report** link opens the HTML report
- [ ] On a failure, `test-results/**` contains the trace and video

## 5. GitHub webhook

Repository → Settings → Webhooks → Add webhook:

- Payload URL: `https://<jenkins-host>/github-webhook/`
- Content type: `application/json`
- Events: pushes and pull requests

Then set branch protection on `main`: require a pull request, one review, and a green
Jenkins PR build.

## 6. Tuning

| Symptom                   | Action                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| Builds exceed ten minutes | Increase `WORKERS`, or shard: `--shard=$STAGE/2` in parallel stages                                    |
| Flaky failures            | Inspect the trace, fix the test, or tag `@quarantine` — don't raise retries                            |
| Browser download slow     | Cache `~/.cache/ms-playwright` on the agent                                                            |
| Clock drift on cron       | `H 5 * * *` deliberately avoids the top of the hour; adjust only if the maintenance window requires it |

## 7. Notifications

Uncomment the `slackSend` lines in the `post` block of `Jenkinsfile` after installing the
Slack plugin and configuring the workspace/channel.
