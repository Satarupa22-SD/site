---
title: Installation
type: docs
weight: 3
description: Install Privateer on Windows, Linux, or macOS, and verify the install.
---

Choose the option that matches your platform. **The install script (Option 1) is for macOS and Linux only**, Windows users should use Option 2 (release ZIP) or Option 3 (build from source).

## Option 1: Install via script (macOS / Linux / WSL)

```bash
/bin/bash -c "$(curl -sSL https://raw.githubusercontent.com/privateerproj/privateer/main/install.sh)"
```

The script handles the full installation automatically: it detects your OS and architecture, downloads the latest release binary, verifies the checksum, and adds `pvtr` to your PATH. No manual steps required.

**Windows:** this script will not run in PowerShell, `/bin/bash` doesn't exist and `curl` is an alias for `Invoke-WebRequest`, which rejects the `-sSL` flags. Use Option 2 or Option 3 instead. (It does work inside WSL, since that's a Linux environment.)

Verify the installation completed successfully:

```bash
pvtr version
```

## Option 2: Download from GitHub Releases

Visit the [releases page](https://github.com/privateerproj/privateer/releases) and download the archive for your platform.

**Linux and macOS:**

```bash
# Extract the archive
tar xzf privateer_*.tar.gz

# Move the binary to a directory on your PATH
mv pvtr /usr/local/bin/pvtr

# Ensure it is executable
chmod +x /usr/local/bin/pvtr

# Create the default plugin directory
mkdir -p $HOME/.privateer/bin
```

**Windows (PowerShell):**

1. Download `pvtr_Windows_x86_64.zip` from the [releases page](https://github.com/privateerproj/privateer/releases) and extract it.
2. From the extracted folder, create a `bin` directory, move `pvtr.exe` into it, and add it to your PATH:

```powershell
mkdir $HOME\bin -Force
Move-Item .\pvtr.exe $HOME\bin\
[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "User") + ";$HOME\bin",
    "User")
```

3. Create the default plugin directory:

```powershell
mkdir $HOME\.privateer\bin -Force
```

4. **Close and reopen PowerShell** (so the new PATH takes effect), then verify:

```powershell
pvtr version
```

## Option 3: Build from source

Use this option if you want to run the latest unreleased code or contribute to Privateer development.

**Prerequisites:** Go 1.26 or later. Make is optional (used by the build scripts on macOS/Linux).

**macOS / Linux:**

```bash
# Clone the repository
git clone https://github.com/privateerproj/privateer.git
cd privateer

# Download dependencies
go mod tidy

# Build and run tests
make build

# Move the binary to your PATH
cp pvtr /usr/local/bin/pvtr
```

**Windows (PowerShell):** `make` and `bash` aren't available by default, so build directly with Go:

```powershell
git clone https://github.com/privateerproj/privateer.git
cd privateer
go mod tidy
go build -o pvtr.exe .
.\pvtr.exe version
```

Verify:

```bash
pvtr version
```

**Note:** A build from source reports `edge` (or `edge-dev` if you have uncommitted changes) as the version string rather than a release number. This is expected. If you need a stable, versioned build, use Option 1 or Option 2 instead.

## Option 4: Homebrew (macOS)

```bash
brew install privateerproj/tap/pvtr
```

Homebrew manages updates automatically. To upgrade later:

```bash
brew upgrade privateerproj/tap/pvtr
```

Verify:

```bash
pvtr version
```

## Verify installation

```bash
pvtr version
```

**Expected output** depends on how you installed:

* A **released binary** (install script, GitHub release, or Homebrew) prints a version tag, e.g. `v0.15.0`.
* A **source build** prints `edge` (or `edge-dev` if you have uncommitted local changes). This is expected as source builds aren't stamped with a release number.

For a full view of your installation, use `pvtr info`:

```bash
pvtr info
```

Example output:

```text
Binary:      C:\Users\Lucy\bin\pvtr.exe
Config:      none
Plugins Dir: C:\Users\Lucy\.privateer\bin
Plugins:     plugins.json, pvtr-github-repo-scanner.exe
Version:     edge-dev
Commit:      3c8d139a413ce0ba2a1721036dbb6aba66a15d48
Build Time:  2026-05-23T20:54:22Z
Go Version:  go1.26.3
OS/Arch:     windows/amd64
```
