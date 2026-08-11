# GitHub Pages deployment and rollback

**Version date:** 10 August 2026  
**Runtime:** public static competition prototype with synthetic data only

## Pipeline

The Pages workflow installs the lockfile-defined dependencies, runs lint, typecheck, unit tests, and the production build, then uploads only the `dist` artifact. The deploy job runs only after the build-and-test job succeeds. Permissions are read-only by default; the deploy job alone receives `pages: write` and `id-token: write`.

One-time repository prerequisite: in **Settings → Pages → Build and deployment**, set the source to **GitHub Actions** before the first `main` deployment. The ordinary workflow token intentionally cannot enable Pages for a new repository.

The Vite base path must remain `/Vax-moment/`, and navigation must be hash-based so GitHub Pages does not need server rewrites. The static artifact contains no credentials and requires no live AI, booking, database, or identity service for the walkthrough.

## Post-deploy smoke test

- Public URL returns success and assets load from the repository base path.
- A clean browser can finish all guided checkpoints.
- Convenience booking remains “Booked—not completed.”
- Clinical handoff states that no real message was sent or monitored.
- Operator attestation creates a separate synthetic event.
- Employer small cohort is visibly suppressed.
- Evidence status labels and outbound source links render.
- Reset restores the canonical scenario.
- Keyboard navigation and narrow viewport remain usable.

Initial cold load requires the network. A previously loaded session can continue with deterministic in-memory adapters, but no service worker or offline cold reload is claimed.

## Rollback

1. Record the last known-good commit after a successful public smoke test.
2. If the public smoke test fails, stop promotion and identify whether configuration, dependency/build, or application code caused it.
3. Revert the offending change with a normal commit; do not rewrite published history.
4. Run the full gates and rebuild from the known-good or repaired commit.
5. Redeploy and repeat every smoke check.

Do not depend on indefinite workflow-artifact retention as the rollback mechanism. The reproducible source commit is the recovery point.
