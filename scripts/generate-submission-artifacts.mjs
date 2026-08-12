import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const require = createRequire(import.meta.url);
const bundledModules = process.env.CODEX_NODE_MODULES;

if (!bundledModules) {
  throw new Error('Set CODEX_NODE_MODULES to the bundled workspace node_modules path.');
}

const PptxGenJS = require(path.join(bundledModules, 'pptxgenjs'));
const { marked } = await import(
  pathToFileURL(path.join(bundledModules, 'marked', 'lib', 'marked.esm.js')).href
);

const root = path.resolve(import.meta.dirname, '..');
const submissionDir = path.join(root, 'submission');
const assetDir = path.join(submissionDir, 'assets');
mkdirSync(assetDir, { recursive: true });

const urls = {
  moh: 'https://www.moh.gov.sg/newsroom/national-population-health-survey-2024-shows-singaporeans-are-adopting-healthier-lifestyles---but-rising-obesity-is-a-concern/',
  healthHub: 'https://www.healthhub.sg/programmes/hsg',
  implementationIntentions: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3127912/',
  reminderNull: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10949147/',
  copilotGovernance: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/sec-gov-intro',
  adaptiveCards: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-ask-with-adaptive-card',
};

async function waitForServer(url, server, attempts = 60) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`Vite preview exited before ${url} became available.`);
    }
    try {
      const response = await fetch(url);
      const body = await response.text();
      if (response.ok && body.includes('VaxMoment')) return;
    } catch {
      // The local Vite server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function capturePrototype() {
  const buildCommand = process.platform === 'win32' ? (process.env.ComSpec ?? 'cmd.exe') : 'npm';
  const buildArgs = process.platform === 'win32'
    ? ['/d', '/s', '/c', 'npm.cmd', 'run', 'build']
    : ['run', 'build'];
  const build = spawnSync(buildCommand, buildArgs, {
    cwd: root,
    stdio: 'inherit',
    windowsHide: true,
  });
  if (build.status !== 0) throw new Error('Production build failed; submission artifacts were not generated.');

  const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
  let server;
  let browser;
  try {
    server = spawn(
      process.execPath,
      [viteBin, 'preview', '--host', '127.0.0.1', '--port', '4174', '--strictPort'],
      { cwd: root, stdio: 'ignore', windowsHide: true },
    );
    browser = await chromium.launch({ headless: true });
    await waitForServer('http://127.0.0.1:4174/Vax-moment/', server);
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://127.0.0.1:4174/Vax-moment/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('heading', { name: 'What would make the next step easier?' }).waitFor();
    await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : undefined));
    await page.screenshot({ path: path.join(assetDir, 'employee-journey.png') });

    await page.getByRole('radio', { name: /Timing or location/i }).check();
    await page.getByRole('button', { name: 'Confirm barrier' }).click();
    await page.getByRole('button', { name: 'Yes, use this category' }).click();
    await page.getByRole('heading', { name: 'Barrier-to-action trace' }).click();
    const actionCard = page.locator('.vm-card').first();
    await actionCard.evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : undefined));
    const actionCardBox = await actionCard.boundingBox();
    if (!actionCardBox) throw new Error('Governed action card was not measurable.');
    const clipX = Math.max(0, actionCardBox.x - 24);
    const clipY = Math.max(0, actionCardBox.y - 16);
    await page.screenshot({
      path: path.join(assetDir, 'governed-action.png'),
      clip: {
        x: clipX,
        y: clipY,
        width: Math.min(1000, 1440 - clipX),
        height: Math.min(625, 900 - clipY),
      },
    });
    await page.getByRole('button', { name: 'Reserve next available appointment' }).click();

    await page.getByRole('button', { name: 'Parkway operator' }).click();
    await page.getByRole('heading', { name: 'Campaign control room' }).waitFor();
    await page.evaluate(() => { window.scrollTo(0, 0); if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
    await page.screenshot({ path: path.join(assetDir, 'operator-console.png') });

    await page.getByLabel('Choose a journey').selectOption('clinical_handoff');
    await page.getByRole('button', { name: 'Employer' }).click();
    await page.getByText('Small cohort suppressed').waitFor();
    await page.evaluate(() => { window.scrollTo(0, 0); if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
    await page.screenshot({ path: path.join(assetDir, 'employer-suppression.png') });
  } finally {
    if (browser) await browser.close();
    if (server && server.exitCode === null) {
      server.kill();
      await Promise.race([
        new Promise((resolve) => server.once('exit', resolve)),
        new Promise((resolve) => setTimeout(resolve, 2_000)),
      ]);
    }
  }
}

const colors = {
  ink: '132238',
  navy: '153D54',
  teal: '167C75',
  mint: 'DFF3EF',
  cream: 'F7F4EE',
  white: 'FFFFFF',
  slate: '526175',
  pale: 'EEF3F6',
  gold: 'D89A28',
  red: 'B5473F',
  line: 'D5DEE4',
};

function addTopRule(slide, title, section) {
  slide.addText(section.toUpperCase(), {
    x: 0.65, y: 0.28, w: 3.5, h: 0.22,
    fontFace: 'Aptos', fontSize: 10, bold: true, color: colors.teal,
    charSpacing: 1.2, margin: 0,
  });
  slide.addText(title, {
    x: 0.65, y: 0.58, w: 12.0, h: 0.55,
    fontFace: 'Aptos Display', fontSize: 28, bold: true, color: colors.ink,
    margin: 0, breakLine: false,
  });
  slide.addShape('line', {
    x: 0.65, y: 1.22, w: 12.0, h: 0,
    line: { color: colors.line, width: 1 },
  });
}

function addFooter(slide, sourceText = '') {
  if (sourceText) {
    slide.addText(sourceText, {
      x: 0.65, y: 7.12, w: 10.7, h: 0.18,
      fontFace: 'Aptos', fontSize: 6.5, color: '6B7788',
      margin: 0, fit: 'shrink',
    });
  }
  slide.addText('VaxMoment · Evidence-informed proposition · 11 Aug 2026', {
    x: 9.9, y: 7.12, w: 2.75, h: 0.18,
    fontFace: 'Aptos', fontSize: 6.5, color: '6B7788',
    margin: 0, align: 'right',
  });
}

function addCard(slide, { x, y, w, h, title, body, accent = colors.teal, metric }) {
  slide.addShape('roundRect', {
    x, y, w, h,
    rectRadius: 0.08,
    fill: { color: colors.white },
    line: { color: colors.line, width: 1 },
    shadow: { type: 'outer', color: '9AA6B2', opacity: 0.12, blur: 1, angle: 45, distance: 1 },
  });
  slide.addShape('rect', { x, y, w: 0.07, h, fill: { color: accent }, line: { color: accent } });
  if (metric) {
    slide.addText(metric, {
      x: x + 0.24, y: y + 0.16, w: w - 0.4, h: 0.45,
      fontFace: 'Aptos Display', fontSize: 24, bold: true, color: accent, margin: 0,
    });
  }
  slide.addText(title, {
    x: x + 0.24, y: y + (metric ? 0.7 : 0.2), w: w - 0.42, h: 0.3,
    fontFace: 'Aptos', fontSize: 14, bold: true, color: colors.ink, margin: 0,
  });
  slide.addText(body, {
    x: x + 0.24, y: y + (metric ? 1.06 : 0.62), w: w - 0.42, h: h - (metric ? 1.18 : 0.78),
    fontFace: 'Aptos', fontSize: 10.5, color: colors.slate, margin: 0,
    valign: 'top', breakLine: false, fit: 'shrink',
  });
}

function addPill(slide, text, x, y, w, color = colors.teal) {
  slide.addShape('roundRect', {
    x, y, w, h: 0.34,
    rectRadius: 0.15,
    fill: { color }, line: { color },
  });
  slide.addText(text, {
    x, y: y + 0.02, w, h: 0.26,
    fontFace: 'Aptos', fontSize: 9, bold: true, color: colors.white,
    align: 'center', margin: 0,
  });
}

async function generateDeck() {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'VaxMoment';
  pptx.company = 'VaxMoment';
  pptx.subject = 'Adult vaccination adoption — evidence-informed competition proposal';
  pptx.title = 'VaxMoment — From awareness to completed, informed action';
  pptx.lang = 'en-SG';
  pptx.theme = {
    headFontFace: 'Aptos Display',
    bodyFontFace: 'Aptos',
    lang: 'en-SG',
  };

  let slide = pptx.addSlide();
  slide.background = { color: colors.cream };
  slide.addShape('rect', { x: 0, y: 0, w: 4.65, h: 7.5, fill: { color: colors.navy }, line: { color: colors.navy } });
  slide.addText('V', {
    x: 0.72, y: 0.63, w: 0.62, h: 0.62,
    fontFace: 'Aptos Display', fontSize: 27, bold: true, color: colors.white,
    align: 'center', valign: 'mid', margin: 0,
    fill: { color: colors.teal },
  });
  slide.addText('VaxMoment', {
    x: 1.48, y: 0.65, w: 2.55, h: 0.4,
    fontFace: 'Aptos Display', fontSize: 23, bold: true, color: colors.white, margin: 0,
  });
  slide.addText('FROM AWARENESS TO\nCOMPLETED, INFORMED ACTION', {
    x: 0.72, y: 2.0, w: 3.35, h: 1.62,
    fontFace: 'Aptos Display', fontSize: 25, bold: true, color: colors.white,
    margin: 0, breakLine: false, fit: 'shrink',
  });
  slide.addText('A privacy-first barrier-to-booking engine for workplace adult vaccination campaigns.', {
    x: 0.72, y: 4.05, w: 3.2, h: 0.95,
    fontFace: 'Aptos', fontSize: 15, color: 'DDE8ED', margin: 0, breakLine: false,
  });
  slide.addText('Team VaxMoment · Hack4Health 2026 Non-Technical Track', {
    x: 0.72, y: 5.28, w: 3.5, h: 0.45,
    fontFace: 'Aptos', fontSize: 10.5, bold: true, color: 'B9D8E2', margin: 0,
  });
  slide.addImage({ path: path.join(assetDir, 'employee-journey.png'), x: 4.95, y: 0.8, w: 7.75, h: 4.85 });
  slide.addShape('roundRect', { x: 5.35, y: 5.95, w: 6.95, h: 0.75, fill: { color: colors.white }, line: { color: colors.line } });
  slide.addText('Proposed AI interprets optional language · Policy controls the action · Humans own clinical questions · Employers see aggregates only', {
    x: 5.58, y: 6.14, w: 6.48, h: 0.33,
    fontFace: 'Aptos', fontSize: 11, bold: true, color: colors.ink, align: 'center', margin: 0,
  });
  addFooter(slide);

  slide = pptx.addSlide();
  slide.background = { color: colors.cream };
  addTopRule(slide, 'The gap is not awareness alone. It is action.', 'Problem');
  addCard(slide, { x: 0.7, y: 1.55, w: 3.7, h: 2.25, title: 'Adult influenza uptake', metric: '28.2%', body: 'Singapore residents aged 18–74 reporting influenza vaccination in 2024. This population measure does not estimate unmet need among recommended groups.', accent: colors.teal });
  addCard(slide, { x: 4.8, y: 1.55, w: 3.7, h: 2.25, title: 'Infrastructure already exists', body: 'HealthHub and Healthier SG already provide trusted information, subsidies, records and appointment pathways. Another FAQ directory is not the wedge.', accent: colors.navy });
  addCard(slide, { x: 8.9, y: 1.55, w: 3.7, h: 2.25, title: 'Generic reminders are inconsistent', body: 'A 262,085-person health-system RCT found portal and text reminders did not increase overall influenza vaccination. Message volume is not the same as action.', accent: colors.red });
  slide.addText('Market hypothesis', { x: 0.72, y: 4.25, w: 2.0, h: 0.3, fontSize: 12, bold: true, color: colors.teal, margin: 0 });
  slide.addText('People may stall for different reasons—practical access, confidence, information, private clinical questions or simply no concrete plan. The product must test and remove the specific friction, not send a smarter-looking reminder.', {
    x: 0.72, y: 4.62, w: 11.7, h: 1.1, fontFace: 'Aptos Display', fontSize: 22, bold: true, color: colors.ink, margin: 0, fit: 'shrink',
  });
  addFooter(slide, `${urls.moh} · ${urls.healthHub} · ${urls.reminderNull}`);

  slide = pptx.addSlide();
  slide.background = { color: colors.pale };
  addTopRule(slide, 'A governed barrier-to-booking engine—not a vaccine chatbot', 'Product wedge');
  const steps = [
    ['1', 'Private barrier', 'Employee selects or describes what is getting in the way.'],
    ['2', 'User confirmation', 'The system proposes one allowlisted category; the employee confirms or changes it.'],
    ['3', 'Governed action', 'A deterministic policy selects the permitted next action—never an improvised clinical recommendation.'],
    ['4', 'Execution', 'A slot, approved information route, opt-out or accountable human handoff follows.'],
    ['5', 'Outcome integrity', 'Booking and completion remain separate; only an authoritative source can verify completion.'],
  ];
  steps.forEach(([number, title, body], index) => {
    const x = 0.7 + index * 2.48;
    slide.addShape('ellipse', { x, y: 1.65, w: 0.55, h: 0.55, fill: { color: index === 2 ? colors.gold : colors.teal }, line: { color: index === 2 ? colors.gold : colors.teal } });
    slide.addText(number, { x, y: 1.76, w: 0.55, h: 0.24, color: colors.white, bold: true, align: 'center', margin: 0, fontSize: 12 });
    if (index < steps.length - 1) slide.addShape('line', { x: x + 0.62, y: 1.92, w: 1.67, h: 0, line: { color: '9FB4BE', width: 1.5, beginArrowType: 'none', endArrowType: 'triangle' } });
    slide.addText(title, { x, y: 2.42, w: 2.1, h: 0.34, fontSize: 14, bold: true, color: colors.ink, margin: 0 });
    slide.addText(body, { x, y: 2.87, w: 2.05, h: 1.3, fontSize: 10.2, color: colors.slate, margin: 0, fit: 'shrink' });
  });
  slide.addShape('roundRect', { x: 1.0, y: 4.75, w: 11.25, h: 1.35, fill: { color: colors.white }, line: { color: colors.line } });
  addPill(slide, 'AI', 1.3, 5.03, 0.8, colors.teal);
  slide.addText('Understands language and proposes a category', { x: 2.3, y: 5.03, w: 2.9, h: 0.35, fontSize: 11.5, bold: true, color: colors.ink, margin: 0 });
  addPill(slide, 'POLICY', 5.35, 5.03, 1.1, colors.navy);
  slide.addText('Controls what the system is allowed to do', { x: 6.65, y: 5.03, w: 2.65, h: 0.35, fontSize: 11.5, bold: true, color: colors.ink, margin: 0 });
  addPill(slide, 'HUMAN', 9.45, 5.03, 1.05, colors.red);
  slide.addText('Owns clinical judgement', { x: 10.7, y: 5.03, w: 1.25, h: 0.45, fontSize: 10.5, bold: true, color: colors.ink, margin: 0, fit: 'shrink' });
  addFooter(slide);

  slide = pptx.addSlide();
  slide.background = { color: colors.cream };
  addTopRule(slide, 'The employee sees the reason, boundary and next action', 'Working prototype');
  slide.addImage({ path: path.join(assetDir, 'governed-action.png'), x: 0.7, y: 1.48, w: 7.5, h: 4.69 });
  addCard(slide, { x: 8.55, y: 1.52, w: 3.8, h: 1.28, title: 'Transparent classification', body: 'The category is proposed and confirmed—never silently inferred as fact.', accent: colors.teal });
  addCard(slide, { x: 8.55, y: 3.0, w: 3.8, h: 1.28, title: 'Governed intervention', body: 'The policy engine authorizes one bounded action matched to the barrier family.', accent: colors.navy });
  addCard(slide, { x: 8.55, y: 4.48, w: 3.8, h: 1.28, title: 'Clinical stop line', body: 'Personal suitability questions create an unsubmitted human-handoff receipt; the AI does not answer.', accent: colors.red });
  addFooter(slide, 'Live prototype: https://vax-moment.vercel.app');

  slide = pptx.addSlide();
  slide.background = { color: colors.pale };
  addTopRule(slide, 'Evidence points toward convenience plus concrete planning', 'Behavioural rationale');
  addCard(slide, { x: 0.72, y: 1.58, w: 3.65, h: 2.3, title: 'Date + time planning', metric: '+4.2pp', body: 'A US workplace RCT found a full-sample increase after employees were prompted to form a concrete date-and-time plan.', accent: colors.teal });
  addCard(slide, { x: 4.82, y: 1.58, w: 3.65, h: 2.3, title: 'Translation is unproven', body: 'The RCT supports a testable mechanism, not an effect-size promise for Singapore, VaxMoment, or a different campaign design.', accent: colors.navy });
  addCard(slide, { x: 8.92, y: 1.58, w: 3.65, h: 2.3, title: 'No “AI uplift” claim', body: 'Demographic tailoring and behavioural framing have also produced null results. VaxMoment is an evidence-informed proposition awaiting a controlled pilot.', accent: colors.red });
  slide.addShape('roundRect', { x: 0.75, y: 4.45, w: 11.8, h: 1.25, fill: { color: 'E6F4F1' }, line: { color: 'A9D6CF' } });
  slide.addText('Design implication', { x: 1.0, y: 4.7, w: 1.65, h: 0.3, fontSize: 12, bold: true, color: colors.teal, margin: 0 });
  slide.addText('Use AI only to understand long-tail language. Let deterministic policy and service operations remove the friction. Measure authoritative completion—not clicks, message opens or chatbot engagement.', {
    x: 2.6, y: 4.65, w: 9.35, h: 0.55, fontSize: 16, bold: true, color: colors.ink, margin: 0, fit: 'shrink',
  });
  addFooter(slide, `${urls.implementationIntentions} · Transfer limits documented in submission/SUPPORTING_EVIDENCE.md`);

  slide = pptx.addSlide();
  slide.background = { color: colors.cream };
  addTopRule(slide, 'The moat is the operating loop—not the chat interface', 'Alternatives');
  const rows = [
    ['Alternative', 'Information', 'Action', 'Barrier route', 'Clinical boundary', 'Employer privacy'],
    ['HealthHub / Healthier SG', 'Strong', 'Strong', 'Not established in review', 'Clinic-led', 'Not employer-facing'],
    ['Corporate vaccine provider', 'Strong', 'Strong', 'Not established in review', 'Provider-led', 'Varies'],
    ['Generic AI chatbot', 'Variable', 'Usually link-out', 'Conversation only', 'Often unclear', 'Often unclear'],
    ['VaxMoment', 'Source-labelled', 'Barrier → slot/handoff', 'Core workflow', 'Observable stop line', 'Aggregate + suppression'],
  ];
  slide.addTable(rows, {
    x: 0.72, y: 1.55, w: 11.85, h: 3.75,
    border: { type: 'solid', color: colors.line, pt: 1 },
    fill: colors.white, color: colors.ink, fontFace: 'Aptos', fontSize: 10,
    margin: 0.09,
    rowH: 0.64,
    bold: false,
    autoFit: false,
    colW: [2.2, 1.7, 2.05, 2.1, 1.95, 1.85],
  });
  slide.addText('What compounds after a pilot', { x: 0.75, y: 5.65, w: 2.6, h: 0.3, fontSize: 12, bold: true, color: colors.teal, margin: 0 });
  slide.addText('Approved intervention library · barrier-to-outcome evidence · operational integrations · trusted distribution · privacy governance', {
    x: 3.0, y: 5.59, w: 9.2, h: 0.45, fontSize: 15, bold: true, color: colors.ink, margin: 0, fit: 'shrink',
  });
  slide.addText('Current defensibility is limited; these are future moat mechanisms, not present assets.', { x: 3.0, y: 6.18, w: 7.5, h: 0.28, fontSize: 9.5, italic: true, color: colors.slate, margin: 0 });
  addFooter(slide);

  slide = pptx.addSlide();
  slide.background = { color: colors.pale };
  addTopRule(slide, 'Proposed Microsoft pathway for an executable governed contract', 'Organizer ecosystem');
  const msSteps = [
    ['COPILOT STUDIO', 'Bounded language-to-category output'],
    ['AGENT FLOW', 'Confirmation-gated deterministic action'],
    ['MICROSOFT BOOKINGS', 'Availability and appointment execution'],
    ['DATAVERSE', 'Campaign state, consent and provenance'],
    ['ENTRA + GOVERNANCE', 'Role identity, DLP, ALM and monitoring'],
  ];
  msSteps.forEach(([title, body], index) => {
    const x = 0.72 + index * 2.48;
    slide.addShape('roundRect', { x, y: 1.72, w: 2.12, h: 1.35, fill: { color: index === 0 ? colors.mint : colors.white }, line: { color: index === 0 ? colors.teal : colors.line } });
    slide.addText(title, { x: x + 0.16, y: 1.93, w: 1.8, h: 0.28, fontSize: 10.5, bold: true, color: index === 0 ? colors.teal : colors.ink, align: 'center', margin: 0 });
    slide.addText(body, { x: x + 0.16, y: 2.36, w: 1.8, h: 0.48, fontSize: 9.2, color: colors.slate, align: 'center', margin: 0, fit: 'shrink' });
    if (index < msSteps.length - 1) slide.addShape('line', { x: x + 2.15, y: 2.39, w: 0.27, h: 0, line: { color: colors.teal, width: 1.5, endArrowType: 'triangle' } });
  });
  slide.addImage({ path: path.join(assetDir, 'operator-console.png'), x: 0.72, y: 3.65, w: 6.2, h: 3.1 });
  addCard(slide, { x: 7.25, y: 3.65, w: 5.25, h: 1.28, title: 'Implemented now', body: 'Typed ports, deterministic adapters, policy/state/privacy tests, Adaptive Card payloads, tool contracts and tested fallback and denial paths.', accent: colors.teal });
  addCard(slide, { x: 7.25, y: 5.12, w: 5.25, h: 1.28, title: 'Requires tenant access', body: 'Published Copilot agent, Dataverse solution, Bookings connector, Entra roles and production DLP. None are claimed as live or Parkway-approved.', accent: colors.gold });
  addFooter(slide, `${urls.copilotGovernance} · ${urls.adaptiveCards} · SMUAI/Petani AI are organizer ecosystem partners; no technical integration is claimed.`);

  slide = pptx.addSlide();
  slide.background = { color: colors.cream };
  addTopRule(slide, 'Privacy is part of the value proposition—not a footer', 'Trust and governance');
  slide.addImage({ path: path.join(assetDir, 'employer-suppression.png'), x: 0.72, y: 1.48, w: 7.25, h: 4.53 });
  addCard(slide, { x: 8.28, y: 1.52, w: 4.05, h: 1.2, title: 'Employee', body: 'Chooses what to disclose; optional text is transient; decline is respected.', accent: colors.teal });
  addCard(slide, { x: 8.28, y: 2.9, w: 4.05, h: 1.2, title: 'Parkway operator', body: 'Receives actionable handoff and campaign operations—not autonomous clinical answers.', accent: colors.navy });
  addCard(slide, { x: 8.28, y: 4.28, w: 4.05, h: 1.2, title: 'Employer', body: 'Receives a fixed aggregate projection; small cohorts are suppressed; no individual barrier is exposed.', accent: colors.gold });
  slide.addText('Production requires server-side authorization, anti-differencing, retention controls and qualified privacy review.', {
    x: 0.78, y: 6.32, w: 11.35, h: 0.38, fontSize: 11.5, bold: true, color: colors.red, align: 'center', margin: 0,
  });
  addFooter(slide);

  slide = pptx.addSlide();
  slide.background = { color: colors.pale };
  addTopRule(slide, 'One campaign. One site. One falsifiable pilot.', 'Business model and GTM');
  addCard(slide, { x: 0.72, y: 1.52, w: 3.75, h: 2.15, title: 'Primary buyer hypothesis', body: 'Corporate-health programme owner as buyer and integration owner; employer as campaign sponsor or co-funder. Both remain to validate.', accent: colors.teal });
  addCard(slide, { x: 4.8, y: 1.52, w: 3.75, h: 2.15, title: 'Commercial entry', body: 'A fixed-fee, time-bounded pilot priced against campaign operations and unused appointment capacity—not hypothetical healthcare savings.', accent: colors.navy });
  addCard(slide, { x: 8.88, y: 1.52, w: 3.75, h: 2.15, title: 'Wedge', body: 'One employer, one influenza programme, one workplace site and one campaign window. Expand only after evidence and governance review.', accent: colors.gold });
  slide.addText('Illustrative 90-day validation path', { x: 0.75, y: 4.2, w: 3.2, h: 0.32, fontSize: 13, bold: true, color: colors.teal, margin: 0 });
  const pilot = [
    ['0–30', 'Discovery + data contract', 'Observe workflow; freeze purpose, fields, source and ownership.'],
    ['31–60', 'Concierge + governance gate', 'Test manually; secure build and approvals must pass before enrolment.'],
    ['61–90', 'Pilot or stop', 'Only if gates pass: run controlled campaign and make a measured kill/scale decision.'],
  ];
  pilot.forEach(([days, title, body], index) => addCard(slide, { x: 0.75 + index * 4.05, y: 4.62, w: 3.65, h: 1.5, metric: `DAY ${days}`, title, body, accent: index === 2 ? colors.gold : colors.teal }));
  addFooter(slide);

  slide = pptx.addSlide();
  slide.background = { color: colors.cream };
  addTopRule(slide, 'Measure authoritative completion—and the cost of getting there', 'Validation');
  const metrics = [
    ['PRIMARY', 'Authoritative completion', 'Same source and observation window in both arms.'],
    ['SECONDARY', 'Booking + time to action', 'Understand conversion and friction.'],
    ['OPERATIONS', 'Support minutes + exceptions', 'A solution that overwhelms staff fails.'],
    ['GUARDRAILS', 'Privacy, clinical and trust events', 'Zero tolerance for generated clinical answers or employer access violations.'],
  ];
  metrics.forEach(([label, title, body], index) => {
    const y = 1.55 + index * 1.25;
    addPill(slide, label, 0.78, y + 0.08, 1.4, index === 3 ? colors.red : colors.teal);
    slide.addText(title, { x: 2.5, y, w: 3.45, h: 0.34, fontSize: 15, bold: true, color: colors.ink, margin: 0 });
    slide.addText(body, { x: 6.1, y, w: 6.0, h: 0.45, fontSize: 11.5, color: colors.slate, margin: 0, fit: 'shrink' });
    slide.addShape('line', { x: 2.5, y: y + 0.72, w: 9.6, h: 0, line: { color: colors.line, width: 1 } });
  });
  slide.addShape('roundRect', { x: 0.78, y: 6.25, w: 11.55, h: 0.55, fill: { color: 'FFF2D8' }, line: { color: 'E8C46C' } });
  slide.addText('Current status: pilot design drafted; discovery gates remain unmet. No buyer commitment, customer interviews or measured uplift yet.', {
    x: 1.0, y: 6.39, w: 11.1, h: 0.26, fontSize: 11.5, bold: true, color: '7B5410', align: 'center', margin: 0,
  });
  addFooter(slide);

  slide = pptx.addSlide();
  slide.background = { color: colors.navy };
  slide.addText('THE ASK', { x: 0.78, y: 0.75, w: 1.5, h: 0.3, fontSize: 12, bold: true, color: '8DD6CD', charSpacing: 1.4, margin: 0 });
  slide.addText('Help us validate the workflow contract, then earn one governed workplace pilot.', {
    x: 0.78, y: 1.3, w: 7.2, h: 1.35, fontFace: 'Aptos Display', fontSize: 31, bold: true, color: colors.white, margin: 0, fit: 'shrink',
  });
  addCard(slide, { x: 0.78, y: 3.15, w: 3.55, h: 1.7, title: 'Parkway Shenton', body: 'One operator workflow interview, one campaign pathway and an accountable handoff owner.', accent: colors.teal });
  addCard(slide, { x: 4.62, y: 3.15, w: 3.55, h: 1.7, title: 'Microsoft', body: 'A sandbox tenant and guidance to implement the prepared Copilot Studio, agent-flow, Bookings and Dataverse contracts.', accent: colors.gold });
  addCard(slide, { x: 8.46, y: 3.15, w: 3.55, h: 1.7, title: 'Employer sponsor', body: 'One workplace campaign with approved aggregate evaluation and a pre-registered decision threshold.', accent: colors.red });
  slide.addText('Don’t optimise vaccination campaigns for clicks. Optimise the journey for completed, informed action.', {
    x: 1.15, y: 5.68, w: 11.0, h: 0.65, fontFace: 'Aptos Display', fontSize: 20, bold: true, italic: true, color: 'DDE8ED', align: 'center', margin: 0,
  });
  slide.addText('Prototype: https://vax-moment.vercel.app  ·  Source: https://github.com/smellywesley/Vax-moment', {
    x: 1.0, y: 6.7, w: 11.3, h: 0.3, fontSize: 10, color: 'B5C6CE', align: 'center', margin: 0,
  });

  await pptx.writeFile({ fileName: path.join(submissionDir, 'VAXMOMENT_PITCH_DECK.pptx') });
}

async function generateMarkdownPdf({ sourceFile, outputFile, footerLabel }) {
  const markdown = readFileSync(path.join(submissionDir, sourceFile), 'utf8');
  const htmlBody = marked.parse(markdown);
  const html = `<!doctype html>
  <html lang="en"><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 16mm 17mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, sans-serif; color: #132238; font-size: 9.3pt; line-height: 1.35; }
  h1 { font-size: 24pt; color: #153d54; margin: 0 0 8pt; }
  h2 { font-size: 14pt; color: #167c75; margin: 14pt 0 5pt; border-bottom: 1px solid #d5dee4; padding-bottom: 3pt; }
  h3 { font-size: 10.5pt; color: #153d54; margin: 9pt 0 3pt; }
  p { margin: 4pt 0; }
  ul, ol { margin: 4pt 0 7pt 16pt; padding: 0; }
  li { margin: 2pt 0; }
  blockquote { margin: 8pt 0; padding: 7pt 10pt; background: #eef3f6; border-left: 4px solid #167c75; }
  table { border-collapse: collapse; width: 100%; margin: 7pt 0; font-size: 8.3pt; }
  th { background: #153d54; color: white; text-align: left; }
  th, td { border: 1px solid #d5dee4; padding: 4pt; vertical-align: top; }
  code { font-family: Consolas, monospace; font-size: 8pt; background: #eef3f6; padding: 1pt 2pt; }
  a { color: #12665f; text-decoration: none; }
  strong { color: #132238; }
  </style></head><body>${htmlBody}</body></html>`;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.pdf({
      path: path.join(submissionDir, outputFile),
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `<div style="font-size:7px;color:#6b7788;width:100%;text-align:center">VaxMoment · ${footerLabel} · <span class="pageNumber"></span>/<span class="totalPages"></span></div>`,
      margin: { top: '14mm', right: '16mm', bottom: '16mm', left: '16mm' },
    });
  } finally {
    await browser.close();
  }
}

await capturePrototype();
await generateDeck();
await generateMarkdownPdf({
  sourceFile: 'PROJECT_PROPOSAL.md',
  outputFile: 'VAXMOMENT_PROJECT_PROPOSAL.pdf',
  footerLabel: 'Evidence-informed proposition',
});
await generateMarkdownPdf({
  sourceFile: 'SUPPORTING_EVIDENCE.md',
  outputFile: 'VAXMOMENT_SUPPORTING_EVIDENCE.pdf',
  footerLabel: 'Supporting evidence',
});
await generateMarkdownPdf({
  sourceFile: 'JUDGE_QA.md',
  outputFile: 'VAXMOMENT_JUDGE_QA.pdf',
  footerLabel: 'Judge Q&A',
});
console.log('Generated the pitch deck, proposal PDF, supporting-evidence PDF, judge-Q&A PDF, and prototype screenshots.');
