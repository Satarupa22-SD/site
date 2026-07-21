---
title: Output schema
type: docs
weight: 3
description: File locations, the Gemara Evaluation Log JSON schema, result values, and SARIF.
---

## File locations

For each service, Core writes:

```text
<write-directory>/
  <service-name>/
    <service-name>.log     # execution log
    results.yaml           # or results.json / results.sarif
```

## JSON schema

When `output: json`, each service produces `results.json` following the Gemara Evaluation Log schema:

```json
{
  "service": "my-github-repo",
  "plugin": "pvtr-github-repo",
  "timestamp": "2025-01-15T12:00:00Z",
  "policy": {
    "catalogs": ["osps-baseline"],
    "applicability": ["Maturity Level 1"]
  },
  "evaluationSuites": [
    {
      "name": "default",
      "controls": [
        {
          "id": "OSPS-VM-01",
          "description": "The project's VCS MUST require MFA for contributors.",
          "result": "pass",
          "assessmentSteps": [
            {
              "name": "CheckMFARequirement",
              "result": "pass",
              "message": "Branch protection with required review is enforced."
            }
          ]
        }
      ]
    }
  ]
}
```

## Result values

| Value | Meaning |
| --- | --- |
| `pass` | Control requirement was met |
| `fail` | Control requirement was not met |
| `skip` | Control was not applicable or could not be evaluated |
| `error` | Assessment step encountered an execution error |

`error` at the assessmentStep level propagates to the parent control. An error result on a service (plugin crash or communication failure) does not affect sibling services.

## SARIF output

When `output: sarif`, Core emits a SARIF 2.1.0 file. Each failing control appears as a result with a `ruleId` matching the control ID. Compatible with the GitHub Security tab and any SARIF 2.1.0 consumer.
