# VaxMoment

VaxMoment is a governed, synthetic competition prototype for the Hack4Health 2026 non-technical track. It demonstrates how an adult vaccination campaign could move a fictional employee from a self-described barrier to a non-clinical next action while keeping clinical questions with humans and employer reporting aggregate-only.

**Public demo:** [https://smellywesley.github.io/Vax-moment/](https://smellywesley.github.io/Vax-moment/)

## What judges can inspect

- A deterministic three-minute walkthrough with seven checkpoints.
- Three seeded scenarios: ready to book, convenience barrier, and clinical handoff.
- Instant Employee, Parkway Operator, and Employer role switching over the same service and policy layer.
- A visible human-handoff receipt for clinical questions; the prototype never generates a clinical answer.
- Seeded booking and classifier fallbacks that keep the walkthrough functional without external services.
- An illustrative aggregate projection that suppresses cohorts below the illustrative threshold of 10.
- Evidence labels for `Verified`, `Synthetic`, `Assumed`, and `To Validate` claims.
- A one-action scenario reset for repeatable judging runs.

## Important boundaries

This is not a Parkway Shenton, IHH Healthcare, Microsoft, or employer deployment. It uses fictional people, synthetic events, and browser-local state. It does not make eligibility, vaccine-selection, suitability, contraindication, diagnosis, or treatment decisions. No real Bookings, Copilot, clinical, identity, messaging, or employer systems are connected. Operator-attested completion is synthetic and unverified. The public bundle is inspectable and must not contain real personal or health data.

The proposed Microsoft production boundary and the validation work required before any pilot are documented in:

- [Microsoft adapter boundary](docs/architecture/microsoft-adapter-boundary.md)
- [Market validation brief](docs/validation/market-validation.md)
- [Pre-registered pilot outline](docs/validation/pilot-experiment.md)
- [Three-minute demo script](docs/demo/demo-script.md)
- [GitHub Pages deployment and rollback](docs/architecture/github-pages-deployment.md)

## Run the quality gate

Use Node.js 22 or newer and npm:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm audit
```

For local development only:

```bash
npm run dev
```

After the repository's Pages publishing source is set once to **GitHub Actions**, production publishing is automated by the pinned workflow whenever changes reach `main`. The Vite base path is `/Vax-moment/`, matching the repository Pages URL.

## Architecture

The application is a static React/TypeScript vertical slice with a small domain state machine, application service, explicit ports, and deterministic demo adapters. UI components receive DTOs and callbacks; they do not import fixture repositories or bypass authorization, aggregation, state-transition, or audit-event logic. Demo mode controls scenario state but calls the same application service used by ordinary interaction.

## Evidence standard

Narrow ecosystem facts link to primary sources. Product effectiveness, buyer demand, data availability, privacy approval, tenant fit, and ROI remain unverified until their named experiments are completed. The prototype intentionally contains no ROI claim.
