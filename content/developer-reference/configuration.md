---
title: Configuration reference
type: docs
weight: 2
description: Every config key, variable resolution rules, and the policy block.
---

Privateer reads YAML or JSON. It looks for `config.yml` in the current working directory by default.

## Full example

```yaml
# Global settings
loglevel: debug
write-directory: evaluation_results
write: true
output: yaml
binaries-path: $HOME/.privateer/bin
invasive: false

# Global policy: applied to all services unless overridden at the service level
policy:
  catalogs:
    - osps-baseline
  applicability:
    - Maturity Level 1

# Global variables: available to all services
vars:
  environment: production
  region: us-east-1

services:
  my-github-repo:
    plugin: pvtr-github-repo       # must match binary filename exactly
    test-suites:
      - default
    loglevel: info                 # overrides global loglevel for this service
    vars:
      owner: my-org
      repo: my-repo
      token: "{{TOKEN}}"           # inject at runtime; never commit real values
    policy:
      catalogs:
        - osps-baseline
      applicability:
        - Maturity Level 1
```

## Top-level settings

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `loglevel` | string | `error` | `trace`, `debug`, `info`, `warn`, `error`, `off` |
| `write-directory` | string | `evaluation_results` | Output directory for result files |
| `write` | boolean | `true` | Write result files to disk |
| `output` | string | `yaml` | `yaml`, `json`, or `sarif` |
| `binaries-path` | string | `$HOME/.privateer/bin` | Plugin binary directory |
| `invasive` | boolean | `false` | Permit plugins to modify infrastructure |
| `policy` | object |  | Global policy; overridable per service |
| `vars` | object |  | Global variables; overridable per service |
| `plugin` | string |  | Global plugin name; used by any service that does not set its own |
| `version` | string |  | Global plugin version pin; used by any service that does not set its own |

## Service settings

Each key under `services` is a unique service name matched against the `--service` flag.

| Key | Type | Required | Description |
| --- | --- | --- | --- |
| `plugin` | string | Yes, unless set globally | Binary filename, case-sensitive, no path, no extension |
| `version` | string | No | Plugin version pin; overrides global `version` |
| `test-suites` | array | No | Suites to run (default: `["default"]`) |
| `loglevel` | string | No | Per-service log verbosity override |
| `vars` | object | No | Service-specific variables |
| `policy` | object | No | Service-specific policy; overrides global |
| `invasive` | boolean | No | Per-service invasive override |

## Variable resolution

Variables are merged at runtime with the following precedence (highest wins):

```text
service vars  >  global vars
```

There is no environment variable interpolation built into Core. To inject secrets, render the config before running:

```bash
sed "s/{{TOKEN}}/$MY_SECRET_TOKEN/g" config.template.yml > config.yml
pvtr run -c config.yml
```

## Policy

```yaml
policy:
  catalogs:
    - osps-baseline       # control catalog ID
  applicability:
    - Maturity Level 1    # applicability tier filter
```

Each policy field falls back independently: a service that sets only `catalogs` still inherits the global `applicability`, and vice versa. Within a field, the service value fully replaces the global list; lists are never merged. Policy is required when running via Core outside of plugin debug mode. Invalid catalog or applicability values produce an error at startup, not at evaluation time.

## invasive flag

When `invasive: false` (the default), Core signals plugins that they must not modify infrastructure. Whether a plugin respects this signal depends on the plugin implementation, so read plugin documentation before enabling `invasive: true`. Most community plugins are read-only and ignore the flag entirely.
