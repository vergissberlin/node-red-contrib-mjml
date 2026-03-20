# Contributing

Thanks for helping improve `@vergissberlin/node-red-contrib-mjml`.

This guide explains how to:

- run the node locally while developing
- run tests and verify behavior
- create and publish releases

## Prerequisites

- Node.js 20+
- pnpm 10+
- Git

## Local development

Use a dedicated Node-RED test instance so you can iterate without publishing.

### 1) Install this repository

```bash
pnpm install
pnpm link --global
```

### 2) Create a separate Node-RED workspace

```bash
mkdir node-red-test
cd node-red-test
pnpm init
pnpm add node-red
pnpm link --global @vergissberlin/node-red-contrib-mjml
```

### 3) Start Node-RED

```bash
pnpm exec node-red
```

Open [http://127.0.0.1:1880](http://127.0.0.1:1880).  
The `mjml-parse` node should appear in the palette and resolve to your local source.

### 4) Import a sample flow (optional)

Import `examples/Parse node example.json` (or `test/fixtures/flows.json`) through **Menu -> Import**.

### 5) Stop using the linked package

When you want to switch back to the published npm version:

```bash
pnpm unlink @vergissberlin/node-red-contrib-mjml
pnpm add @vergissberlin/node-red-contrib-mjml
```

## Testing

### Unit tests

Run:

```bash
pnpm test
```

This runs Mocha on `test/**/*_spec.js`, including:

- `test/mjml-parse_spec.js` — Node-RED node + admin `/mjml-parse/preview` HTTP integration tests
- `test/mjml-parse-admin-auth_spec.js` — isolated tests for `RED.auth.needsPermission('flows.read')` on the preview route (mock `RED` object)
- `test/preview-payload_spec.js` — pure unit tests for `mjml-parse/preview-payload.js` (MJML error normalization for editor diagnostics)

The `devDependency` on `node-red` pins the version used by `node-red-node-test-helper`. After changing editor or admin HTTP behavior, also smoke-test on Node-RED 3.x/4.x (Monaco default) if you can.

GitHub Actions runs tests on **Node.js 20.x and 22.x** (see `.github/workflows/pull-request.yml`). Newer Node majors may require upgrading `node-red` / `node-red-node-test-helper` before adding them to the matrix.

The browser editor (Monaco/Ace) is not covered by automated tests here; validate that in the manual checklist below.

### Manual smoke test in Node-RED

Recommended checks before opening a PR:

1. Add `mjml-parse` node and open the edit dialog.
2. Confirm XML highlighting works; tag autocomplete appears when the editor uses Ace (Monaco may not load the Ace completer).
3. Add Mustache placeholders like `{{payload}}` and deploy.
4. Send a test message and verify MJML compiles to HTML.
5. Try invalid XML and confirm validation feedback appears in the editor.

### Starter templates checklist

If your change adds or updates editor starter templates, run this checklist:

1. Edit `mjml-parse/resources/mjml-templates.json`.
2. Keep template `id` values stable and unique.
3. Add or update matching labels in `mjmlParse.templates.*` across all `mjml-parse/locales/*/mjml-parse.json` files.
4. Ensure each template compiles with the same MJML options used by `mjml-parse` (`validationLevel: "soft"`, `ignoreIncludes: true`).
5. Verify UI behavior in Node-RED:
   - Template dropdown loads correctly.
   - Selecting `No starter template` does not change editor content.
   - Selecting a starter inserts MJML into the editor.
   - Replacement confirmation appears when the editor is not empty.
6. Run `pnpm test` and confirm starter-template tests pass.

## Pull requests

- Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `test:`, ...).
- Keep changes focused and include tests for behavior changes.
- Update docs/help text if the node UI or runtime behavior changes.

## Release process

Releases are handled by [Release Please](https://github.com/googleapis/release-please).

### How it works

1. Changes are merged to `main` using Conventional Commits.
2. Release Please updates or creates a release PR with version bump + changelog.
3. Merge the release PR.
4. GitHub release is created and npm publishing is triggered.

### Required secrets

- `NPM_TOKEN` (required): npm token allowed to publish `@vergissberlin/node-red-contrib-mjml`
- `REPO_TOKEN` (optional): custom GitHub token for Release Please; otherwise `GITHUB_TOKEN` is used

### Notes

- Do not publish manually unless automation is intentionally bypassed.
- If release automation fails, fix the workflow issue and rerun the release pipeline.
