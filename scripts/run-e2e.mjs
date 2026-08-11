import { spawn } from 'node:child_process';

const rootUrl = 'http://127.0.0.1:4173/Vax-moment/';
const vite = spawn(
  process.execPath,
  ['./node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--strictPort'],
  { stdio: 'inherit' },
);

async function waitForPreview() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (vite.exitCode !== null) throw new Error(`Vite preview exited with ${vite.exitCode}`);
    try {
      const response = await fetch(rootUrl);
      if (response.ok) return;
    } catch {
      // The preview server has not bound the port yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Timed out waiting for ${rootUrl}`);
}

function waitForExit(child, timeoutMs) {
  if (child.exitCode !== null) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeoutMs);
    child.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

let exitCode = 1;
try {
  await waitForPreview();
  const playwright = spawn(
    process.execPath,
    ['./node_modules/@playwright/test/cli.js', 'test'],
    { stdio: 'inherit' },
  );
  exitCode = await new Promise((resolve, reject) => {
    playwright.once('error', reject);
    playwright.once('exit', (code) => resolve(code ?? 1));
  });
} finally {
  vite.kill();
  await waitForExit(vite, 3_000);
}

process.exitCode = exitCode;
