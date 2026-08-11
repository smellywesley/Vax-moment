import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    results.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length })),
  ).toEqual([]);
}

async function expectNoHorizontalOverflow(page: Page) {
  const diagnostic = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const offenders = Array.from(document.querySelectorAll<HTMLElement>('*'))
      .map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          element: `${element.tagName.toLowerCase()}${
            element.className ? `.${String(element.className).trim().replace(/\s+/g, '.')}` : ''
          }`,
          left: Math.round(bounds.left),
          right: Math.round(bounds.right),
          width: Math.round(bounds.width),
          text: (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 80),
        };
      })
      .filter(({ left, right }) => left < -1 || right > viewportWidth + 1)
      .sort(
        (first, second) =>
          Math.max(second.right - viewportWidth, -second.left) -
          Math.max(first.right - viewportWidth, -first.left),
      )
      .slice(0, 8);

    return {
      overflow: document.documentElement.scrollWidth - viewportWidth,
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth,
      offenders,
    };
  });

  expect(
    diagnostic.overflow,
    `Horizontal overflow diagnostic: ${JSON.stringify(diagnostic)}`,
  ).toBeLessThanOrEqual(1);
}

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await expect(
    page.getByRole('heading', { name: 'What would make the next step easier?' }),
  ).toBeVisible();
});

test('completes the governed path and visibly suppresses the small employer cohort', async ({
  page,
}) => {
  await expectAccessible(page);
  await page.getByRole('radio', { name: /Timing or location/i }).check();
  await page.getByRole('button', { name: 'Confirm fictional barrier' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm the category' })).toBeVisible();
  await expectAccessible(page);
  await page.getByRole('button', { name: 'Yes, use this category' }).click();
  await expect(page.getByRole('button', { name: 'Book a seeded slot' })).toBeVisible();
  await expectAccessible(page);
  await page.getByRole('button', { name: 'Book a seeded slot' }).click();
  await expect(page.getByRole('heading', { name: 'Demo appointment booked' })).toBeVisible();
  await expect(page.getByText('Vaccination not yet confirmed')).toBeVisible();
  await expectAccessible(page);

  await page.getByRole('button', { name: 'Parkway operator' }).click();
  await expect(page.getByRole('heading', { name: 'Campaign control room' })).toBeVisible();
  await expectAccessible(page);
  await page
    .getByRole('button', { name: 'Record operator-attested synthetic completion' })
    .click();
  await expect(page.getByText(/not a verified clinical record/i)).toBeVisible();

  await page.getByRole('button', { name: 'Employer' }).click();
  await expect(page.getByRole('heading', { name: 'Campaign outcomes' })).toBeVisible();
  await expectAccessible(page);
  await page.getByLabel('Choose a demo story').selectOption('clinical_handoff');
  await page.getByRole('button', { name: 'Employer' }).click();
  await expect(page.getByText('Small cohort suppressed')).toBeVisible();
  await expect(page.getByText('Fictional employee 2')).toHaveCount(0);
  await page.setViewportSize({ width: 320, height: 800 });
  await expectAccessible(page);
  await expectNoHorizontalOverflow(page);
});

test('has no accessibility violations and reflows at 320 CSS pixels', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await expectAccessible(page);
  await expectNoHorizontalOverflow(page);
});

test('continues after the loaded page loses its network connection', async ({
  context,
  page,
}) => {
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Reset this story' }).click();
  await page.getByRole('radio', { name: /Timing or location/i }).check();
  await page.getByRole('button', { name: 'Skip optional text' }).click();
  await expect(page.getByRole('heading', { name: 'Timing or location' })).toBeVisible();
});

test('fails closed from mixed urgent text to the unsubmitted human route', async ({
  page,
}) => {
  await expect(page.locator('.vm-safety-note')).toContainText(/call 995/i);
  await page.getByLabel(/Optional fictional text/i).fill('I have chest pain and want to book');
  await page.getByRole('button', { name: 'Confirm fictional barrier' }).click();
  await expect(page.getByRole('heading', { name: 'Personal medical question' })).toBeVisible();
  await page.getByRole('button', { name: 'Yes, use this category' }).click();

  await expect(page.getByText('Synthetic receipt — not submitted')).toBeVisible();
  await expect(page.getByRole('link', { name: '995' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Book a seeded slot' })).toHaveCount(0);
  await page.setViewportSize({ width: 320, height: 800 });
  await expectAccessible(page);
  await expectNoHorizontalOverflow(page);
});

test('keeps the judge walkthrough readable on a full-HD display', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.getByRole('button', { name: 'Start 3-minute judge walkthrough' }).click();

  await expect(page.getByRole('heading', { name: /Start with privacy/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close judge walkthrough' })).toBeVisible();

  const diagnostic = await page.evaluate(() => {
    const banner = document.querySelector<HTMLElement>('.vm-demo-banner');
    const details = document.querySelector<HTMLElement>('.vm-demo-banner__details');
    const main = document.querySelector<HTMLElement>('main');
    if (!banner || !details || !main) throw new Error('Guided layout landmarks are missing');

    return {
      bannerHeight: banner.getBoundingClientRect().height,
      detailsWidth: details.getBoundingClientRect().width,
      mainTop: main.getBoundingClientRect().top,
    };
  });

  expect(diagnostic.bannerHeight).toBeLessThan(220);
  expect(diagnostic.detailsWidth).toBeGreaterThan(300);
  expect(diagnostic.mainTop).toBeLessThan(520);
  await expectNoHorizontalOverflow(page);
  await expectAccessible(page);
});
