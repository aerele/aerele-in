# CLAUDE.md

## Stack
- Frappe: `{{FRAPPE_VERSION}}` | ERPNext: `{{ERPNEXT_VERSION}}` | Other apps: `{{HRMS / INDIA_COMPLIANCE / ...}}`
- App: `{{APP_NAME}}` | Bench: `{{BENCH_PATH}}` | Dev site: `{{SITE}}` | Test site: `{{TEST_SITE}}` | Prod: `{{PROD_SITE}}`
- Python `{{PY_VERSION}}`, Node `{{NODE_VERSION}}`
- Use only APIs that exist in the version above. Unsure? Read `apps/frappe` / `apps/erpnext`. Don't guess.

## Commands
```bash
bench --site {{SITE}} migrate                 # always pass --site
bench build --app {{APP_NAME}}
bench --site {{TEST_SITE}} run-tests --app {{APP_NAME}}
bench --site {{TEST_SITE}} run-tests --doctype "<DocType>"
bench --site {{TEST_SITE}} run-tests --module <dotted.path.test_x> --test <test_name>
bench --site {{SITE}} export-fixtures --app {{APP_NAME}}
pre-commit run --files <changed files>
```
- Tests only on `{{TEST_SITE}}` (needs `set-config allow_tests true` once). Never on the dev site.
- Never run `reinstall`, `drop-site`, `restore`, `--force`, or anything on `{{PROD_SITE}}`. Ask first.
- `bench start` only in the background, and only if not already running.

## Skills
- Install from [frappe/skills](https://github.com/frappe/skills) and commit them to the repo:
  `npx skills add frappe/skills --skill frappe-app-dev --skill frappe-code-review --skill fix-issue --skill ship-it`
- `frappe-app-dev` for how-to. `frappe-code-review` before every PR. `/fix-issue` for bug tickets. `/ship-it` to get a branch to a merge-ready PR.
- Skills target recent Frappe. If one conflicts with this file or `{{FRAPPE_VERSION}}`, this file wins.

## How to work
- Read how the app already does it first. Match existing patterns and style.
- Over ~3 files: plan first and confirm.
- Unsure about business logic or the client's process? Ask. Don't invent it.
- Bug: reproduce first, fix the cause not the symptom, smallest diff.
- Done = migrate clean + tests pass + pre-commit pass. Run them, don't assume.

## Golden rules
- Never edit, monkey-patch or copy core files. Use `doc_events`, `override_doctype_class` (sparingly), Custom Fields, Property Setters, fixtures.
- New doctype: write the JSON and let migrate create it. Don't `mkdir` doctype folders.
- Hand-edited doctype JSON: bump `modified`, or migrate skips it.
- Fixtures: always filtered by module or name. Never export all Custom Fields / Property Setters.
- Schema or data change = patch in `patches.txt`. Idempotent, ordered after what it reads, tested on a site with real data (empty tables always "pass").
- Needs a patch: new defaults on Single doctypes, field type changes, new mandatory or unique fields on existing data.
- Small, focused diffs. Unrelated changes go in separate PRs.

## Security (critical)
- No SQL built with `.format()`, f-strings or `+`. Prefer `frappe.qb`. Raw SQL only with `%s` / `%(name)s` params.
- Every `@frappe.whitelist()`:
  - checks permission (`frappe.has_permission(..., throw=True)` / `doc.check_permission()`), ideally inside the controller method
  - has type hints on every arg (Frappe casts them; blocks filter-list injection like `{"key": ["!=", ""]}`)
  - declares `methods=["GET"]` or `["POST"]` (GET doesn't commit)
  - uses `get_list`, not `get_all` (get_all skips permissions)
- `allow_guest=True`: think 10 times. Return only fields a guest needs, validate input, rate-limit.
- `ignore_permissions=True`: never in user-facing APIs. Background logic only, with a comment why.
- No mass assignment: never `doc.update(frappe.form_dict)` or `**kwargs` from the client. Set only the fields you allow.
- `set_value` / `db.delete` / `get_value` with a name or filter that could be `None` or empty hits every row. Guard it.
- No `eval` / `exec`. Never run a client-supplied method path. Secrets in Password fields, never in logs.
- `frappe.call` in JS must point to a real whitelisted method. No `frappe.client.*` from server code.
- XSS: escape user input right before putting it in HTML, Jinja or JS. Don't "fix" by stripping characters.
- User file paths: no traversal outside the site folder. Prefer the File doctype.

## Transactions & framework fit
- Don't call `frappe.db.commit()` / `rollback()`. Requests (POST/PUT), jobs and patches auto-commit; errors auto-rollback.
- Need a partial rollback? Use `frappe.db.savepoint()`. Must commit (rare)? Wrap in try/except and log.
- Scheduler jobs, `after_install`, `after_migrate`: try/except + `frappe.log_error()`.
- Hooks: validation in `validate`, side effects in `on_submit` / `on_update`. No `doc.save()` inside its own hooks; use `db_set`.
- `frappe.db.set_value` skips validation and hooks. Never use it for status or state changes.
- Errors: `frappe.throw(_("..."))` with a specific message naming the field, row and old → new value.
- Don't put `frappe.throw` inside `try/except Exception`; the except swallows it.
- `override_doctype_class`: inherit the original and call `super()`. Never replace a whole core controller.
- JS: call doc methods with `frm.call("method")`, not `frappe.call` with a dotted path.
- Long work: `frappe.enqueue(..., queue="long")` or `enqueue_doc`, with `enqueue_after_commit=True` if it reads data written now.
- Check-then-insert is a race. Use a unique constraint.
- Don't wrap a whitelisted doc method in a separate `api.py` function. Call it directly.

## ERPNext specifics
- Never insert GL Entry / Stock Ledger Entry / Payment Ledger Entry directly. Go through the standard vouchers.
- `flt(x, precision)`, `cint`, `getdate`, `nowdate`, `now_datetime`. No float math on currency, no `datetime.now()`.
- Never hardcode company, accounts, warehouses, naming series. Respect company, currency, fiscal year.
- Silent ledger or stock corruption is the worst bug. Fail loudly over posting wrong entries.

## Performance
- Common reads < 100ms, writes < 5s, never > 10s in a request.
- No DB calls in loops (`get_doc`, `get_value`, `set_value`, `sql`). Batch with `["in", names]` or one query.
- One field? `frappe.db.get_value` / `get_cached_value`, not `get_doc`. Delete with `frappe.delete_doc`.
- Aggregate in SQL (`SUM`, `COUNT`), not in Python. Bound scans on big tables.
- Use the `doc` passed into hooks; don't reload it.
- `doc_events` on busy core doctypes (Sales Invoice, Stock Entry, GL/Stock Ledger Entry, `"*"`) run on every save. Keep them light, no queries in loops; move heavy work to `enqueue`.
- Keep `validate` light: no queries in loops there either.
- Indexes on filtered fields, declared in code (`search_index` / patch), never added by hand.
- Cache with `@redis_cache` / `@request_cache` / `@site_cache`. Never hand-roll caches in `frappe.local` / `frappe.flags`.
- JS: no `frappe.call` / `frappe.db.get_value` in a loop.

## Code quality
- No commented-out code, unused imports/functions/classes, unreachable code.
- No `print()`; use `frappe.logger()` or `frappe.log_error()`.
- No copy-pasted logic blocks; extract a shared function.
- Don't shadow builtins (`list`, `filter`, `type`, `id`...).
- Never assume a DB read returned something. Handle `None` / empty before indexing.
- Naming: DocType names in Title Case, fieldnames in snake_case.
- No `global` or mutable class-level state. No bare `except: pass`; catch specific errors and log.
- Max ~5 params; new params go last as keyword args with `None` defaults.
- Boring, readable code over clever one-liners. Type hints over describing types in docstrings.
- Strings: `"".join()` or lists, not `+=` in loops. User-facing strings in `_()` / `__()`.

## Tests
- Every new doctype gets real tests, not the empty stub: validation, permissions, submit/cancel.
- Base class per version: `IntegrationTestCase` / `UnitTestCase` (newer) or `FrappeTestCase` (older). Check `{{FRAPPE_VERSION}}`.
- Tests roll back automatically. Create data in `setUp`; don't depend on site data or other tests.
- Deterministic: no `random`, use `freeze_time` for dates.
- Non-trivial bug fix = regression test that fails without the fix.
- Had to change an existing test's assertion? That's a red flag. Explain why in the PR.

## Before PR
Run `frappe-code-review`. Quick check: SQL injection | whitelist perms + type hints | get_all in API | mass assignment | commit/rollback | ignore_permissions | None filters | loops / N+1 | patches | `modified` bumped | fixtures filtered | tests run | no dead code

## Git
- Branch `feat/<desc>` or `fix/<desc>`. Conventional commits: `fix: ...`, `feat: ...`.
- Never commit `site_config.json`, keys or `.env`.
