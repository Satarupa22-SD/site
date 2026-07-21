---
title: Understanding results
type: docs
weight: 5
description: Where output files land, how to control the format, and how to suppress terminal output.
---

After a run, Privateer writes output to `<write-directory>/<service-name>/`. By default this is `evaluation_results/<service-name>/`.

```text
evaluation_results/
  my-github-repo/
    my-github-repo.log     # Full execution log for this service
    my-github-repo.yaml    # Structured validation results
```

Two files are written for every service, both named after the service. The `.log` file captures everything Privateer and the plugin did during the run, it is recommended to check this file first when something goes wrong. The results file contains the control-by-control outcome of the validation. Its extension matches your configured output format (`.yaml`, `.json`, or `.sarif`).

## Controlling the output format

The format of the results file is set in your config:

```yaml
output: yaml    # yaml (default) | json | sarif
```

Setting `output: json` or `output: sarif` produces `<service-name>.json` or `<service-name>.sarif` in place of the default `<service-name>.yaml`. SARIF output is compatible with the GitHub Security tab, check the [GitHub Actions Integration](github-actions.html) section for how to upload it.

Config settings that affect output:

| Setting | Default | Description |
| --- | --- | --- |
| `write-directory` | `evaluation_results` | Where result files are written |
| `write` | `true` | Whether to write output files at all |
| `output` | `yaml` | Output format: `yaml`, `json`, or `sarif` |
| `loglevel` | `error` | Log verbosity: `trace`, `debug`, `info`, `warn`, `error`, `off` |

## Suppressing terminal output

To suppress all non-essential log output to the terminal without changing your log level setting, use the `--silent` flag at runtime:

```bash
pvtr run -c config.yml --silent
```

This is useful in CI environments where you want clean pipeline output but still want full results written to disk.

If no output files appear after a run, check the following:

```yaml
# Confirm these are set in your config
write: true                          # Must not be set to false
write-directory: evaluation_results  # Must be a path you have write access to
```

Then re-run with debug logging to see what went wrong:

```bash
pvtr run -c config.yml --loglevel debug
```
