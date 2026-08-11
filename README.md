# VaxMoment

VaxMoment is a privacy-first product demonstration for adult vaccination engagement. It shows how an employee can move from a self-described barrier to a safe, non-clinical next action while clinical questions stay with humans and employer reporting remains aggregate-only.

**Public demo:** [https://vax-moment.vercel.app/](https://vax-moment.vercel.app/) · [GitHub Pages mirror](https://smellywesley.github.io/Vax-moment/)

**Submission package:** [start here](submission/SUBMISSION_INDEX.md) for the presentation deck, proposal PDF, judge Q&A, supporting evidence, and customer-validation log.

## What judges can inspect

- A deterministic three-minute walkthrough with seven checkpoints.
- Three seeded scenarios: ready to book, convenience barrier, and clinical handoff.
- Instant Employee, Parkway Operator, and Employer role switching over the same service and policy layer.
- A visible human-handoff receipt for clinical questions; the prototype never generates a clinical answer.
- Seeded booking and classifier fallbacks that keep the walkthrough functional without external services.
- An illustrative aggregate projection that suppresses cohorts below the illustrative threshold of 10.
- Evidence labels for `Verified`, `Demo-generated`, `Assumed`, and `To Validate` claims.
- A one-action scenario reset for repeatable judging runs.

## Important boundaries

This is not a Parkway Shenton, IHH Healthcare, Microsoft, or employer deployment. It uses example people, demo events, and browser-local state. It does not make eligibility, vaccine-selection, suitability, contraindication, diagnosis, or treatment decisions. No real Bookings, Copilot, clinical, identity, messaging, or employer systems are connected. Operator-attested completion is illustrative and unverified. The public bundle is inspectable and must not contain real personal or health data.

The proposed Microsoft production boundary and the validation work required before any pilot are documented in:

- [Microsoft adapter boundary](docs/architecture/microsoft-adapter-boundary.md)
- [Microsoft execution blueprint](docs/architecture/microsoft-execution-blueprint.md)
- [Microsoft-compatible implementation pack](power-platform/README.md)
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

After the repository's Pages publishing source is set once to **GitHub Actions**, production publishing is automated by the pinned workflow whenever changes reach `main`. GitHub Pages builds use the `/Vax-moment/` base path.

The included `vercel.json` also supports a root-level Vercel deployment. Vercel builds automatically use `/` as the Vite base path, so the same source can be published to either host without rewriting asset URLs.

## Architecture

The application is a static React/TypeScript vertical slice with a small domain state machine, application service, explicit ports, and deterministic demo adapters. UI components receive DTOs and callbacks; they do not import fixture repositories or bypass authorization, aggregation, state-transition, or audit-event logic. Demo mode controls scenario state but calls the same application service used by ordinary interaction.

## Evidence standard

Narrow ecosystem facts link to primary sources. Product effectiveness, buyer demand, data availability, privacy approval, tenant fit, and ROI remain unverified until their named experiments are completed. The prototype intentionally contains no ROI claim.
