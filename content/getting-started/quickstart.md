---
title: Quickstart (5 minutes)
type: docs
weight: 2
description: Run your first validation test in five minutes.
---

This guide helps you run your first validation test. Before you start, make sure you have:

* A terminal: macOS/Linux shell, or **PowerShell on Windows**
* Internet access to download the binary and plugin
* A GitHub personal access token with read scope (for the example below)

## 1. Install Privateer

*macOS / Linux / WSL:*

```bash
/bin/bash -c "$(curl -sSL https://raw.githubusercontent.com/privateerproj/privateer/main/install.sh)"
```

*Windows:* the script above won't run in PowerShell. Download `pvtr_Windows_x86_64.zip` from the [releases page](https://github.com/privateerproj/privateer/releases), then:

```powershell
mkdir $HOME\bin -Force
Move-Item .\pvtr.exe $HOME\bin\
[Environment]::SetEnvironmentVariable("Path",
    [Environment]::GetEnvironmentVariable("Path","User") + ";$HOME\bin", "User")
mkdir $HOME\.privateer\bin -Force
```

Then close and reopen PowerShell.

## 2. Verify

```bash
pvtr version
```

Expected output: a version string such as `v0.x.y` (or `edge-dev` for a source build).

If you see `command not found`, the binary isn't on your PATH. On macOS/Linux: `export PATH="$PATH:/usr/local/bin"`. On Windows, confirm the folder you placed `pvtr.exe` in is on your user PATH, then reopen PowerShell.

## 3. Install a plugin

Plugins are an essential component of Privateer as they contain the validation logic. To test how they work you can install the GitHub repo scanner using its full `owner/repo` name:

```bash
pvtr install ossf/pvtr-github-repo-scanner
```

Verify it's detected:

```bash
pvtr list
```

The plugin should appear with `Installed = true`.

## 4. Create a config file (`config.yml`)

```yaml
loglevel: debug
write-directory: sample_output
services:
  my-github-repo:
    plugin: pvtr-github-repo-scanner   # must match the installed binary name exactly
    test-suites:
      - default
    vars:
      owner: my-org      # your GitHub org or username
      repo: my-repo      # your repository name
      token: "{{TOKEN}}" # injected at runtime
    policy:
      catalogs:
        - osps-baseline
      applicability:
        - Maturity Level 1
```

## 5. Run

*macOS / Linux:*

```bash
TOKEN=your_github_token pvtr run -c config.yml
```

*Windows (PowerShell):*

```powershell
$env:TOKEN = "your_github_token"
pvtr run -c config.yml
```

A non-zero exit code means one or more controls failed; check the results file for details.

## 6. Review results

```text
sample_output/<service-name>/<service-name>.log
sample_output/<service-name>/results.yaml
```
