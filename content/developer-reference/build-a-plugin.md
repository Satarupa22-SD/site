---
title: Build your first plugin
type: docs
weight: 4
description: Generate a scaffold, implement AssessmentSteps, test in debug mode, and publish.
---

## Prerequisites

* Go 1.19 or later
* `pvtr` installed
* Optionally: a Gemara Layer 2 control catalog YAML, or a copy of the [example plugin](https://github.com/privateerproj/plugin-example) as a starting point

## Step 1: Generate the scaffold

```bash
pvtr generate-plugin \
  --source-path ~/path/to/catalog.yaml \
  --service-name "MyService" \
  --organization "my-github-org" \
  --output-dir my-plugin/
```

Without a catalog, clone the example plugin and rename it:

```bash
git clone https://github.com/privateerproj/plugin-example my-plugin
cd my-plugin
```

## Step 2: Review the generated structure

```text
my-plugin/
  main.go                 # plugin entry point; registered with the SDK
  config-example.yml
  Makefile
  go.mod                  # imports privateer-sdk
  raids/
    default/
      evaluation.go       # AssessmentStep implementations
  README.md
```


## Step 3: Implement AssessmentSteps

Each AssessmentStep is a Go function that receives a typed data payload, evaluates it against a single control requirement, and returns a result. The SDK defines the function signature; your job is the evaluation logic.

```go
// CheckMFARequirement verifies that branch protection requires reviews,
// which is used as a proxy for MFA enforcement at the repository level.
func CheckMFARequirement(payload *GitHubRepoData) (bool, string) {
    if payload.BranchProtection.RequiredReviews > 0 {
        return true, "Branch protection with required review is enforced."
    }
    return false, fmt.Sprintf(
        "Branch protection not enforced: required reviews = %d",
        payload.BranchProtection.RequiredReviews,
    )
}
```

Return `true` for pass, `false` for fail. Return an error from the step signature to produce an `error` result. Returning `skip` requires using the SDK's skip helper; check SDK documentation for the current interface.

Three things to get right in every step:

1. **The boolean return reflects the control, not the data.** `false` means the requirement is not met, not that the data is absent.
2. **The message is evidence, not a label.** Include the value that was found, not just "failed."
3. **Never panic.** A panic in a step is caught by the gRPC boundary and recorded as `error`, but it will lose the message. Return errors explicitly.

## Step 4: Configure and build

```bash
cp config-example.yml config.yml
make binary
```

Minimum valid config for development:

```yaml
loglevel: debug
write-directory: test_output
services:
  my-service:
    plugin: my-plugin
    test-suites:
      - default
    vars:
      my_setting: some_value
```

## Step 5: Test in debug mode

Run the plugin binary directly, without Core, to iterate quickly:

```bash
./my-plugin debug --service my-service
```

Results appear in `test_output/my-service/`. This mode bypasses Core entirely, which is useful for validating step logic without the full gRPC lifecycle.

## Step 6: Test end-to-end with Core

```bash
cp my-plugin $HOME/.privateer/bin/
pvtr list -a                              # confirm it is discovered
cp config.yml ../
cd ..
pvtr run
```

## Step 7: Publish

When your plugin is ready to share:

1. Publish to a public GitHub repository with the `pvtr-` prefix
2. Tag a release so users can download a compiled binary
3. Document required vars, available test suite names, and an example `config.yml` in your README
