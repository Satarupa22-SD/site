---
title: Build your first plugin
type: docs
weight: 4
description: Generate a scaffold, write a loader and typed assessment steps, test in debug mode, and run under pvtr.
---

A plugin is a Go binary that evaluates one kind of target against a Gemara
Layer 2 control catalog and emits a Gemara EvaluationLog. `pvtr run` launches
it, hands it the config for a service, and collects the log. This page walks
the scaffold as `pvtr generate-plugin` emits it today. The maintained reference
plugin is [pvtr-github-repo-scanner](https://github.com/ossf/pvtr-github-repo-scanner);
when this page and that repo disagree, the repo is current.

## Prerequisites

* Go at the version in the generated `go.mod` (1.26 or later)
* `pvtr` 0.23 or later
* A Gemara Layer 2 control catalog, YAML or JSON, as a file or URL

## Step 1: Generate the scaffold

```bash
pvtr generate-plugin \
  --source-path  ~/path/to/catalog.yaml \
  --service-name MyService \
  --organization my-github-org \
  --output-dir   my-plugin/
```

Then prove it compiles before touching anything:

```bash
cd my-plugin
go mod tidy && go build ./... && go vet ./...
```

A generated plugin ships no `go.sum`, so `go mod tidy` is always the first
command. Do not run `generate-plugin` over an existing plugin; it overwrites
every file.

## Step 2: Review the generated structure

```text
my-plugin/
  main.go                          # orchestrator wiring
  go.mod                           # pins privateer-sdk and go-gemara
  data/
    data_collection.go             # Payload and Loader
    catalogs/catalog_<id>_<ver>.yaml  # your catalog, embedded at build time
  evaluation_plans/
    evaluation_plans.go            # TypedStep, and Suite_<id>: requirement id -> step chain
    reusable_steps/steps.go        # NotImplemented placeholder
  example-config.yml
  Makefile
```

Every requirement id in the catalog is already in `Suite_<id>`, bound to
`reusable_steps.NotImplemented`. Replacing those bindings is the work.

## Step 3: Write the loader

All I/O happens once, in the loader, before any step runs. The loader returns
the payload; the SDK passes that payload to every step.

```go
// data/data_collection.go
type Payload struct {
    Config   *config.Config
    Owner    string          // resolved from config here, not in steps
    Repo     *RepoData       // pointer: the payload is passed by value
    RepoErr  error           // "could not observe" is distinct from "observed none"
}

func Loader(cfg *config.Config) (any, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    p := Payload{Config: cfg, Owner: cfg.GetString("owner")}
    repo, err := fetchRepo(ctx, p.Owner)
    if err != nil {
        return nil, fmt.Errorf("github.rest: %w", err)
    }
    if repo.DefaultBranch == "" {
        return nil, fmt.Errorf("github.rest: missing default_branch")
    }
    p.Repo = repo
    return p, nil
}
```

Rules that keep steps honest:

* Bound every call with a context timeout.
* Validate required fields before returning. A half-built payload turns loader
  bugs into false failures.
* Name the source in errors so the run log says which system broke.
* List config vars the loader cannot run without in `RequiredVars` in
  `main.go`. The SDK refuses to run when one is missing.

## Step 4: Write assessment steps

A step is a pure function of the payload. It observes; it never fetches.

```go
// evaluation_plans/evaluation_plans.go (generated)
type TypedStep func(data.Payload) (gemara.Result, string, gemara.ConfidenceLevel)

// evaluation_plans/access_control/steps.go (yours)
func BranchProtectionRequiresReview(p data.Payload) (gemara.Result, string, gemara.ConfidenceLevel) {
    if p.RepoErr != nil {
        return gemara.NeedsReview, "Could not read branch protection: " + p.RepoErr.Error(), gemara.Undetermined
    }
    n := p.Repo.BranchProtection.RequiredReviews
    if n > 0 {
        return gemara.Passed, fmt.Sprintf("Branch protection requires %d review(s)", n), gemara.High
    }
    return gemara.Failed, fmt.Sprintf("Branch protection not enforced: required reviews = %d", n), gemara.High
}
```

Then bind it:

```go
Suite_my_catalog = map[string][]TypedStep{
    "MC.C01.TR01": {
        reusable_steps.RepoWasFetched,           // a scope guard you write; runs first
        access_control.BranchProtectionRequiresReview,
    },
}
```

### Results

| Result | Return when | Halts the chain |
| --- | --- | --- |
| `Passed` | You observed the requirement being met. | no |
| `Failed` | You observed it not being met. | yes |
| `NotApplicable` | The requirement does not apply to this target. | yes |
| `NeedsReview` | The data is absent or ambiguous, or only a heuristic could judge it. | no |
| `Unknown` | The payload was unusable; almost always a loader bug. | no |
| `NotRun` | Placeholders only. | no |

Steps in a chain run in order. The chain stops at the first `Failed` or
`NotApplicable`; every other result is folded in and the next step runs. Put
scope guards first so an inapplicable target stops before a substantive step
fails it for the wrong reason.

Three things to get right in every step:

1. **Absent data is never `Failed`.** "No SECURITY.md" is a failure only if the
   loader positively listed the tree. "Could not list the tree" is
   `NeedsReview` with the reason.
2. **The message is evidence, not a label.** Include the value you observed.
3. **Never `Passed` without a positive observation.** Silent green is the worst
   outcome for an evaluator.

`main.go` registers the map with `pluginkit.AddEvaluationSuiteTyped`. The SDK
asserts the payload type once and keeps each step's function name in the
results, so do not wrap steps in closures and do not add a type assertion to
each step.

## Step 5: Test the steps

Table-driven, with the payload built as a literal. No network in `go test`.

```go
func TestBranchProtectionRequiresReview(t *testing.T) {
    tests := []struct {
        name    string
        payload data.Payload
        want    gemara.Result
    }{
        {"enforced", data.Payload{Repo: &data.RepoData{BranchProtection: bp(2)}}, gemara.Passed},
        {"not enforced", data.Payload{Repo: &data.RepoData{BranchProtection: bp(0)}}, gemara.Failed},
        {"unreadable", data.Payload{RepoErr: errors.New("403")}, gemara.NeedsReview},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, _, _ := BranchProtectionRequiresReview(tt.payload)
            if got != tt.want {
                t.Errorf("got %v, want %v", got, tt.want)
            }
        })
    }
}
```

## Step 6: Run in debug mode

Run the binary directly to exercise the loader against a real target without
`pvtr`:

```bash
cp example-config.yml config.yml     # fill in vars for a real target
go build -o my-plugin .
./my-plugin debug --target my-target -c config.yml -l debug
```

Results land in `evaluation_results/my-target/my-target.yaml`. Check that every
requirement shows `steps-executed` of at least 1 and a result other than
`Unknown`. A requirement with no chain in the map is reported as `Unknown`
with a message naming the id.

## Step 7: Run under pvtr

```bash
cp my-plugin ~/.privateer/bin/
pvtr list --installed                # confirm it is discovered
pvtr run -c config.yml
```

Exit codes:

| Code | Meaning |
| --- | --- |
| 0 | Everything passed |
| 1 | The run completed and some assessments failed |
| 2 | Aborted (signal) |
| 3 | Internal error in pvtr or the plugin |
| 4 | Bad config or flags |
| 5 | No assessments ran; usually a catalog id or applicability mismatch |

`1` is a successful run from the plugin's point of view. Read the log, not
just the code.

## Step 8: Publish

1. Push to a public GitHub repository with the `pvtr-` prefix.
2. Set `Publisher` and `License` on the orchestrator in `main.go`; both are
   required to publish and inert at run time.
3. Tag a release so users can download a compiled binary.
4. Document required vars and an example `config.yml` in the README.

## Using an AI agent

The [privateer-skills](https://github.com/privateerproj/privateer-skills)
repository packages this workflow as an Agent Skill, with a static check that
every catalog requirement has a step chain and a parser for the run output.
