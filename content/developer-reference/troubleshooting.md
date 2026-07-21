---
title: Troubleshooting
type: docs
weight: 7
description: Common failures, PATH issues, plugin discovery, missing output, policy errors.
---

## pvtr: command not found

Check whether the binary exists where you installed it:

```bash
Get-Command pvtr
ls $HOME/.privateer/bin/pvtr
ls /usr/local/bin/pvtr
```

If found, the install directory is not on PATH:

```bash
export PATH="$PATH:/usr/local/bin"
source ~/.bashrc
```

## permission denied

```bash
chmod +x /usr/local/bin/pvtr
```

On macOS, approve the binary through Gatekeeper: System Settings → Privacy and Security.

## Plugin not discovered

```bash
pvtr list -a    # check what Core can see
ls $HOME/.privateer/bin/
```

The `plugin` value in config must match the binary filename exactly (case-sensitive, no path prefix, no file extension). If using a custom binaries path, pass it consistently:

```bash
pvtr run --binaries-path /opt/pvtr-plugins
```

Or set it in config:

```yaml
binaries-path: /opt/pvtr-plugins
```

## No output files

Verify in config:

```yaml
write: true
write-directory: evaluation_results   # must be a writable path
```

Then increase verbosity to identify the failure:

```bash
pvtr run -c config.yml --loglevel debug
```

## Policy validation error at startup

If Core exits immediately with a policy-related error, the `catalogs` or `applicability` values in your config are not recognized by the plugin. Check the plugin's documentation for valid catalog IDs and applicability tiers. This error fires before any plugin subprocess is launched.

## Plugin crash recorded as error

A plugin that panics or exits unexpectedly is recorded as `error` for all its controls. Core does not retry. Check `<service-name>.log` for the subprocess output. Run the plugin in debug mode to reproduce the failure outside the gRPC boundary:

```bash
./my-plugin debug --service my-service
```

## version returns "edge"

Built from source without a release tag. Expected behavior for development builds. Use a release binary in production pipelines.
