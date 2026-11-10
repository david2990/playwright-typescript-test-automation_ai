# Smoke pack

The smoke pack answers one question: **is the storefront usable right now?**
It runs every two hours in Jenkins and must finish in under ten minutes.

## Contents

| #   | Journey                                               | Spec                                    | Test                                                  |
| --- | ----------------------------------------------------- | --------------------------------------- | ----------------------------------------------------- |
| 1   | Storefront renders with header, categories and footer | `tests/smoke/01-home.spec.ts`           | loads the storefront…                                 |
| 2   | Storefront renders without uncaught JS errors         | `tests/smoke/01-home.spec.ts`           | renders without uncaught JavaScript errors            |
| 3   | Every top-level category opens and lists products     | `tests/smoke/02-navigation.spec.ts`     | opens the "<category>" category (7 tests)             |
| 4   | Search returns matching products                      | `tests/smoke/03-search.spec.ts`         | returns matching products for a known term            |
| 5   | Search empty state works                              | `tests/smoke/03-search.spec.ts`         | shows an empty-state message when nothing matches     |
| 6   | Invalid credentials are rejected                      | `tests/smoke/04-authentication.spec.ts` | rejects invalid credentials                           |
| 7   | Valid credentials sign in and sign out                | `tests/smoke/04-authentication.spec.ts` | signs in with valid credentials and signs out again   |
| 8   | Product detail shows name, price and add-to-cart      | `tests/smoke/06-product-detail.spec.ts` | shows name, price, quantity and add-to-cart controls  |
| 9   | Add to cart → verify → remove                         | `tests/smoke/05-shopping-cart.spec.ts`  | adds a product to the cart, shows it, then removes it |
| 10  | Saved session reaches the account page                | `tests/authenticated/account.spec.ts`   | saved session state opens the account page            |

That is 16 tests in total because the category journey is generated once per category.

## What does not belong here

- Registration, checkout completion, password changes — they create or mutate durable data on a shared demo environment.
- Anything needing a specific product, price or promotion to exist.
- Cross-browser runs (reserved for a nightly job).
- Long journeys with more than ~5 steps.

## Rules

1. **Ten-minute budget.** If the pack exceeds it, move the least critical journey to regression; do not increase the timeout.
2. **Ownership.** Every test has an owner in the team's test catalogue. A red build is triaged the same day.
3. **No retry masking.** A test that only passes on retry is tagged `@quarantine`, removed from the gate and fixed. CI retries exist for infrastructure blips only.
4. **Independence.** Tests never depend on each other or on leftover cart/account state.
5. **Selection.** `npm run test:smoke` → `--grep @smoke --grep-invert @quarantine`.

## Adding a test

1. Put it in `tests/smoke/` (or `tests/authenticated/` if it needs a session).
2. Add `@smoke` to the test title.
3. Use page objects from `src/pages`; add a new one if the page is new.
4. Run `npm run test:smoke` and `npm run typecheck` locally.
5. Update the table above and open a PR.
