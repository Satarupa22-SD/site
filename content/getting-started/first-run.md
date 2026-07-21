---
title: Your first validation run
type: docs
weight: 4
description: Run a validation against a GitHub repository, step by step.
---

The simplest thing you can do with Privateer is run a validation against a GitHub repository. This is the starting point for every user.

Before you run this, make sure you have:

* Privateer installed (`pvtr version` should return a version string)
* The **pvtr-github-repo** plugin installed
* A GitHub personal access token with **read** scope

## Step 1. Install a plugin

Download a plugin binary (e.g., the OpenSSF [pvtr-github-repo](https://github.com/revanite-io/pvtr-github-repo) plugin) and place it in the default plugin directory:

```bash
cp your-plugin-binary $HOME/.privateer/bin/
chmod +x $HOME/.privateer/bin/your-plugin-binary
```

## Step 2.  Check installed plugins

```bash
pvtr list -a
```

Expected output:

```text
pvtr-github-repo   installed
```

## Step 3.  Create your config (config.yml)

Once Privateer and the plugin are installed, you will need a config file. The below example is a minimum valid config file:

```yaml
loglevel: Debug
write-directory: my_results
services:
  my-service:
    plugin: your-plugin-binary
    test-suites:
      - default
```

> **Note:** If your config is not in the current directory, use `-c /path/to/config.yml`.

## Step 4. Run

```bash
pvtr run -c config.yml
```

> **Note:** To run a specific service only:
>
> ```bash
> pvtr run -c config.yml -s my-service
> ```
