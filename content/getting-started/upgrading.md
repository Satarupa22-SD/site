---
title: Upgrading Privateer
type: docs
weight: 6
description: Keep the pvtr binary and your plugins up to date.
---

## Option 1: Re-run the install script (macOS / Linux / WSL)

The install script always fetches the latest release and replaces the existing binary in place:

```bash
/bin/bash -c "$(curl -sSL https://raw.githubusercontent.com/privateerproj/privateer/main/install.sh)"
```

**Windows:** this script doesn't run in PowerShell. Use Option 2 below if you are using PowerShell.

Confirm the upgrade worked:

```bash
pvtr version
```

## Option 2: Replace the binary manually

Download the latest archive from the [releases page](https://github.com/privateerproj/privateer/releases) and replace the existing binary.

*Linux / macOS* replace it at the same path it was installed to:

```bash
mv pvtr /usr/local/bin/pvtr
chmod +x /usr/local/bin/pvtr
```

*Windows (PowerShell)* extract `pvtr_Windows_x86_64.zip` and overwrite the existing `pvtr.exe` on your PATH:

```powershell
Move-Item .\pvtr.exe $HOME\bin\pvtr.exe -Force
```

(Replace `$HOME\bin` with wherever you originally placed it.)

## Option 3: Homebrew (macOS)

If you installed via Homebrew, upgrade through Homebrew:

```bash
brew upgrade privateerproj/tap/pvtr
```

**Note:** Upgrading Privateer does not affect your installed plugins. Plugins are separate binaries and must be upgraded independently. Re-run `pvtr install <owner>/<plugin-name>` for each plugin to get the latest version, for example, `pvtr install ossf/pvtr-github-repo-scanner`. Use the full `owner/repo` name; a bare name defaults to the wrong owner and won't be found in the vetted list.
