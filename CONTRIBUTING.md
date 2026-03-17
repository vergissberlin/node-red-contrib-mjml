# Contributing

## Releasing

Releases are automated with [Release Please](https://github.com/googleapis/release-please). Use [Conventional Commits](https://www.conventionalcommits.org/) on `main`; Release Please will open and update a release PR. Merging that PR creates the GitHub release and triggers npm publish.

**Required repository secrets (or env):**

- **`REPO_TOKEN`** – Optional. GitHub token for Release Please (e.g. a PAT with `repo`). If unset, the default `GITHUB_TOKEN` is used.
- **`NPM_TOKEN`** – Required for publishing. npm access token with permission to publish `@vergissberlin/node-red-contrib-mjml`.
