---
title: CLI reference
type: docs
weight: 1
description: Every pvtr subcommand, its flags, and usage examples.
---

> **Note:** The developer reference is for plugin authors, contributors, and engineers integrating Privateer into automated pipelines. It assumes familiarity with Go, gRPC, and CI/CD tooling. For end-user installation and quickstart, see the [User Guide](quickstart.html).

The Privateer CLI is the `pvtr` binary. Every subcommand accepts the global flags below, plus its own options.

## Global flags

| Flag | Short | Default | Description |
| --- | --- | --- | --- |
| `--binaries-path` | `-b` | `$HOME/.privateer/bin` | Directory where plugin binaries are resolved |
| `--config` | `-c` | `config.yml` | Config file path (JSON or YAML) |
| `--loglevel` | `-l` | `error` | Verbosity: `trace`, `debug`, `info`, `warn`, `error`, `off` |
| `--service` | `-s` | (all services) | Run a single named service from the config |
| `--test-suites` | `-t` | `default` | Named test suite(s) to execute |
| `--write` |  | `true` | Write result files to disk |
| `--write-directory` | `-w` | `evaluation_results` | Output directory for result files |
| `--silent` |  | `false` | Suppress all non-essential terminal output |
| `--help` | `-h` |  | Show help |

## pvtr run

Resolves plugins from the binaries path, launches each as a gRPC subprocess, collects results, and writes output. Registers handlers for SIGINT and SIGTERM; an interrupted run exits with a dedicated abort code distinct from a validation failure.

```bash
pvtr run
pvtr run -c config.yml
pvtr run -c config.yml -s my-service        # single service
pvtr run --loglevel debug -w ./results
```

## pvtr install

Downloads a vetted plugin from the Privateer plugin registry and places the binary in the configured binaries path. Takes exactly one argument.

```bash
pvtr install pvtr-github-repo-scanner
pvtr install pvtr-github-repo-scanner --binaries-path /opt/pvtr-plugins
```

For plugins not in the registry, place the binary manually and verify with `pvtr list -a`.

## pvtr list

Reports which plugins are referenced by the current config and whether each is present in the binaries path.

```bash
pvtr list         # only plugins in config
pvtr list -a      # all binaries in the binaries path
```

Use `pvtr list -a` after a manual binary install to confirm Core can discover it before running.

## pvtr env

Prints a full snapshot of the runtime environment. Useful for debugging environment mismatches in CI.

```bash
pvtr env    # also accessible as: pvtr info
```

Output includes: binary path, config file path and whether it was found, plugins directory, discovered plugin names, version, commit hash, build time, Go version, and OS/architecture.

## pvtr version

```bash
pvtr version            # prints version string only, e.g. 0.1.0
pvtr version --verbose  # adds git commit hash and build timestamp
```

A version of `edge` means the binary was built from source without a release tag. Do not use edge builds in production pipelines.

## pvtr generate-plugin

Generates a plugin scaffold from a Gemara Layer 2 YAML control catalog. The output is a compilable Go module with placeholder implementations for data collection, evaluation plans, and assessment steps.

```bash
pvtr generate-plugin \
  --source-path ~/path/to/catalog.yaml \
  --service-name "MyService" \
  --organization "my-github-org" \
  --output-dir my-plugin/
```

| Flag | Short | Default | Description |
| --- | --- | --- | --- |
| `--source-path` | `-p` |  | Path to the Gemara Layer 2 catalog YAML |
| `--service-name` | `-n` |  | Service name used in generated identifiers |
| `--organization` | `-g` |  | GitHub organization for the plugin module path |
| `--output-dir` | `-o` | `generated-plugin/` | Output directory |
| `--local-templates` |  |  | Use a local templates directory instead of fetching latest |

The generated code will not compile without filling in the TODO placeholders. See [Build your first plugin](build-a-plugin.html).

## pvtr completion

Generates shell autocompletion scripts.

```bash
pvtr completion bash
pvtr completion zsh
pvtr completion fish
pvtr completion powershell
pvtr completion --help    # shell-specific install instructions
```
