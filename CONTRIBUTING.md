# Contributing

## Local development

To run Node-RED locally and test the MJML node from this repo (so code changes are picked up without publishing):

1. **Clone and install**

   ```bash
   pnpm install
   pnpm link --global
   ```

2. **Create a separate Node-RED test instance** (so Node-RED loads the linked package from this repo):

   ```bash
   mkdir node-red-test && cd node-red-test
   pnpm init
   pnpm add node-red
   pnpm link --global @vergissberlin/node-red-contrib-mjml
   ```

3. **Start Node-RED**

   ```bash
   pnpm exec node-red
   ```

   Open the editor (default: <http://127.0.0.1:1880>). The **mjml-parse** node is available under the MJML category and uses the sources from this repo.

4. **Optional:** Use the sample flow from this repo: in the Node-RED editor, use **Menu → Import** and select `test/fixtures/flows.json` from this repo (or paste its contents).

To stop using the local package and switch back to the published one, run in your test instance:

```bash
pnpm unlink @vergissberlin/node-red-contrib-mjml
pnpm add @vergissberlin/node-red-contrib-mjml
```

## Releasing

Releases are automated with [Release Please](https://github.com/googleapis/release-please). Use [Conventional Commits](https://www.conventionalcommits.org/) on `main`; Release Please will open and update a release PR. Merging that PR creates the GitHub release and triggers npm publish.

**Required repository secrets (or env):**

- **`REPO_TOKEN`** – Optional. GitHub token for Release Please (e.g. a PAT with `repo`). If unset, the default `GITHUB_TOKEN` is used.
- **`NPM_TOKEN`** – Required for publishing. npm access token with permission to publish `@vergissberlin/node-red-contrib-mjml`.
