---
title: GitHub Actions integration
type: docs
weight: 5
description: Run Privateer in CI, inject secrets, and upload SARIF to the Security tab.
---

## Basic pipeline

```yaml
name: Privateer Validation

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Privateer
        run: |
          /bin/bash -c "$(curl -sSL https://raw.githubusercontent.com/privateerproj/privateer/main/install.sh)"

      - name: Install plugin
        run: pvtr install pvtr-github-repo

      - name: Run validation
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: pvtr run -c config.yml

      - name: Upload results
        uses: actions/upload-artifact@v4
        if: always()       # upload even on validation failure
        with:
          name: privateer-results
          path: evaluation_results/
```

The `if: always()` on the upload step is important: without it, a validation failure (non-zero exit) prevents result files from being archived.

## Injecting secrets

Keep `config.template.yml` in source control with `{{TOKEN}}` placeholders. Render the live config at runtime:

```yaml
- name: Render config
  run: |
    sed "s/{{TOKEN}}/${{ secrets.MY_TOKEN }}/g" config.template.yml > config.yml

- name: Run Privateer
  run: pvtr run -c config.yml
```

Never commit a rendered config containing real credentials.

## Skipping on documentation-only changes

```yaml
- name: Detect code changes
  id: filter
  run: |
    FILES=$(git diff --name-only origin/${{ github.base_ref }}...HEAD | grep -v '\.md$' || true)
    if [ -z "$FILES" ]; then
      echo "code=false" >> "$GITHUB_OUTPUT"
    else
      echo "code=true" >> "$GITHUB_OUTPUT"
    fi

- name: Run Privateer
  if: steps.filter.outputs.code == 'true'
  run: pvtr run -c config.yml
```

## SARIF upload for the GitHub Security tab

```yaml
- name: Run Privateer (SARIF output)
  run: pvtr run -c config.yml
  # config.yml must set: output: sarif

- name: Upload SARIF
  uses: github/codeql-action/upload-sarif@v3
  if: always()
  with:
    sarif_file: evaluation_results/
```
