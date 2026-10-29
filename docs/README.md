# Documentation index

| Doc | What it answers |
|---|---|
| [adr/0001-separate-mobile-repository.md](adr/0001-separate-mobile-repository.md) | Why two repositories, and the decisions that follow |
| [architecture.md](architecture.md) | How the pieces fit, mobile auth, backend facts that affect mobile |
| [ownership-matrix.md](ownership-matrix.md) | Which repo and person owns each kind of change, CI/CD ownership, incident contacts |
| [api-compatibility-policy.md](api-compatibility-policy.md) | Contract versioning, minimum app version, deprecation |
| [cross-repo-workflow.md](cross-repo-workflow.md) | Issue linking, PR dependencies, branches, release tags, release sequence |
| [environments-and-secrets.md](environments-and-secrets.md) | Staging vs production, what may be in the app, where secrets live |
| [backend-handoff.md](backend-handoff.md) | Work that belongs in the `iutverse` backend repo |
| [api-contract.md](api-contract.md) | The pinned backend contract, generator choice, regeneration and upgrade procedure, drift detection |
| [api-client.md](api-client.md) | The transport layer: auth, request ids, timeouts, cancellation, error kinds |
| [api-transport.md](api-transport.md) | Cross-platform transport specification: base URL, headers, retries, RN assumptions |
| [media-and-uploads.md](media-and-uploads.md) | Media URL rules, direct uploads, private downloads, security notes |
| [device-testing.md](device-testing.md) | Physical-device test procedure and evidence template (not yet executed) |
| [phase-d-progress.md](phase-d-progress.md) | Phase 1.2 (Phase D) progress, findings, evidence and blockers |
| [staging-smoke-tests.md](staging-smoke-tests.md) | Live smoke tests: configuration, local Docker, CI |
| [phase-c-progress.md](phase-c-progress.md) | Phase 1.1 (Phase C) progress, decisions, evidence and blockers |
| [phase-plan.md](phase-plan.md) | Plan status |
| [manual-setup.md](manual-setup.md) | Checklist of steps that need your accounts and decisions |

Planned, written in later phases: `feature-parity-matrix.md`, `release-runbook.md`.
