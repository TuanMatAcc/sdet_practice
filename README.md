# SDET CI practice project

Playwright end-to-end tests (TypeScript) wired into a staged GitHub Actions pipeline.
The tests target [Swag Labs](https://www.saucedemo.com), a public demo shop built by Sauce Labs
for automation practice, so everything runs without an application of your own.

## Project structure

```
.github/workflows/e2e-tests.yml   the CI/CD pipeline (4 stages)
pages/login-page.ts               page object for the login screen
tests/login.spec.ts               login tests, tagged @smoke / @slow
playwright.config.ts              base URL, retries, reporters, browsers
```

## Run it locally (optional, but a good first check)

Requires Node.js 20 or newer.

```bash
npm ci
npx playwright install

# macOS / Linux
TEST_PASSWORD=secret_sauce npx playwright test

# Windows PowerShell
$env:TEST_PASSWORD="secret_sauce"; npx playwright test

npx playwright show-report      # open the HTML report
```

## Run it on GitHub Actions

1. Create an empty repository on GitHub (no README, no .gitignore).
2. In the repo, go to **Settings > Secrets and variables > Actions > New repository secret**
   and add `TEST_PASSWORD` with the value `secret_sauce`.
3. Push this folder:

   ```bash
   git init -b main
   git add .
   git commit -m "Add Playwright tests and CI pipeline"
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

4. Open the **Actions** tab. The push started stage 2: a placeholder deploy, four parallel
   regression shards, and a merged HTML report you can download from the run's **Artifacts**.

## Which stage runs what

| Stage | Trigger | Tests |
|---|---|---|
| PR checks | Opening or updating a pull request into `main` | `@smoke` on Chromium |
| Regression | Push to `main` (including merged PRs) | Everything except `@slow`, 4 parallel shards |
| Nightly | 02:00 UTC daily, or **Run workflow > nightly** | Everything, on Chromium, Firefox and WebKit |
| Production smoke | **Run workflow > production-smoke** | `@smoke` on Chromium |

To make failing PR checks block merging: **Settings > Rules > Rulesets > New branch ruleset**,
target the default branch, enable **Require status checks to pass**, and add `PR checks`.
The check only appears in the list after it has run at least once.

## Viewing reports

Download a report artifact from the run summary page, unzip it, and run
`npx playwright show-report <unzipped-folder>`. Opening it this way (rather than double-clicking
`index.html`) makes traces and videos work.

## Troubleshooting

- **"TEST_PASSWORD is not set"**: the secret is missing or misspelled (step 2).
- **Push rejected, mentioning `workflow` scope**: your Git credentials can't create workflow
  files. Sign in with `gh auth login` (GitHub CLI) or GitHub Desktop, or give your personal
  access token the `workflow` scope.
- **Nightly didn't run**: scheduled runs only happen on the default branch and can start late.
  GitHub also pauses schedules in public repos after 60 days without activity.
  You can always start it manually with **Run workflow > nightly**.
- **Pull requests from forks fail**: GitHub doesn't pass secrets to workflows triggered from forks.

## Moving to a real application

- Create `staging` and `production` environments with their own `BASE_URL` variables and secrets.
- Replace the placeholder deploy step and the `test:unit` script with your real ones.
- Add a `webServer` block to `playwright.config.ts` so local runs and PRs start your app.
- Write page objects and tests for your own screens, tagging critical paths with `@smoke`.
