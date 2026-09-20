import { test, expect, type Page, type Download } from '@playwright/test';
import path from 'node:path';

const SAMPLE_VIDEO = path.resolve(import.meta.dirname, '../samples/vp9-labeling-demo.mkv');

async function openSample(page: Page) {
  await page.goto('/');
  await page.getByLabel('動画を選択', { exact: true }).setInputFiles(SAMPLE_VIDEO);
  await page.waitForSelector('text=作業中', { timeout: 20_000 });
  await waitForFrame(page, 0);
}

// The app intentionally ignores frame-move input while the previous frame is
// still decoding (see useAnnotator's `rendering`/`ready` guard), so tests
// must wait for each move to actually land instead of firing keys back to back.
// The extra 100ms after the text settles covers the gap between React
// committing the DOM update and its `useEffect` re-registering the keydown
// listener with fresh closures (the listener has no dependency array) — a
// window no human keypress could ever land in, but a scripted one can.
async function waitForFrame(page: Page, n: number) {
  await page.waitForFunction(
    (expected) => document.querySelector('.frame-overlay')?.textContent === `FRAME ${String(expected).padStart(6, '0')}`,
    n,
    { timeout: 5000 },
  );
  await page.waitForTimeout(100);
}

test('shows a helpful error for non-VP9 files instead of silently failing', async ({ page }) => {
  await page.goto('/');
  const notAVideo = Buffer.from('not actually a video');
  await page.getByLabel('動画を選択', { exact: true }).setInputFiles( {
    name: 'fake.webm',
    mimeType: 'video/webm',
    buffer: notAVideo,
  });
  await expect(page.locator('.message')).toBeVisible({ timeout: 10_000 });
});

test('opens a VP9 MKV, decodes it, and renders the first frame', async ({ page }) => {
  await openSample(page);
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.locator('.frame-overlay')).toHaveText('FRAME 000000');
  await expect(page.locator('.timestamp')).toHaveText('0.000000 s');
  await expect(page.locator('.pill')).toHaveText('作業中');
});

test('navigates frames, toggles a class, confirms, and undoes', async ({ page }) => {
  await openSample(page);

  await page.keyboard.press('ArrowRight');
  await waitForFrame(page, 1);

  await page.keyboard.press('1');
  await expect(page.locator('.class-card').first()).toHaveAttribute('aria-pressed', 'true');

  await page.keyboard.press('Enter');
  await waitForFrame(page, 2);
  await expect(page.locator('.progress-area strong').first()).toContainText('1');

  await page.keyboard.press('Control+z');
  await waitForFrame(page, 1);
  // the flag toggle survives the undo of the "confirm" step (undo only pops one history entry)
  await expect(page.locator('.class-card').first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.review-status')).toContainText('未確認');
});

test('exports a CSV with a header row and one row per frame', async ({ page }) => {
  await openSample(page);

  await page.keyboard.press('1');
  await page.keyboard.press('Enter'); // confirms frame 0 with class A on, advances to frame 1
  await waitForFrame(page, 1);

  const [download]: [Download] = await Promise.all([page.waitForEvent('download'), page.keyboard.press('e')]);
  expect(download.suggestedFilename()).toBe('vp9-labeling-demo_partial.csv');

  const csvPath = await download.path();
  const raw = await (await import('node:fs/promises')).readFile(csvPath!, 'utf-8');
  const withoutBom = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  const lines = withoutBom.split('\r\n');
  expect(lines[0]).toBe('"frame","reviewed","異常クラス A","異常クラス B","異常クラス C"');
  expect(lines[1]).toBe('0,1,1,0,0'); // frame 0: reviewed, class A on
  expect(lines[2]).toBe('1,0,0,0,0'); // frame 1: not yet reviewed
});

test('clicking a class then pressing Enter preserves its flag and confirms exactly once', async ({ page }) => {
  await openSample(page);
  await page.locator('.class-card').first().click();
  await page.keyboard.press('Enter');
  await waitForFrame(page, 1);
  await expect(page.locator('.progress-area strong').first()).toHaveText('1 / 90');
  await page.keyboard.press('ArrowLeft');
  await waitForFrame(page, 0);
  await expect(page.locator('.class-card').first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.review-status')).toContainText('確認済み');
});

test('Enter still opens settings and activates modal buttons', async ({ page }) => {
  await openSample(page);
  await page.getByRole('button', { name: 'クラスとキーの設定' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: '保存', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('.progress-area strong').first()).toHaveText('0 / 90');
});

test('a label survives an immediate reload without waiting for a save timer', async ({ page }) => {
  await openSample(page);
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await page.keyboard.press('1');
  await expect(page.locator('.class-card').first()).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await page.getByLabel('動画を選択', { exact: true }).setInputFiles(SAMPLE_VIDEO);
  await expect(page.locator('.frame-overlay')).toHaveText('FRAME 000000');
  await expect(page.locator('.class-card').first()).toHaveAttribute('aria-pressed', 'true');
});

test('switching files preserves labels per file and does not save the empty loading state', async ({ page }) => {
  await openSample(page);
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await page.keyboard.press('1');
  await expect(page.locator('.class-card').first()).toHaveAttribute('aria-pressed', 'true');
  const buffer = await (await import('node:fs/promises')).readFile(SAMPLE_VIDEO);
  await page.getByLabel('動画を選択', { exact: true }).setInputFiles({ name: 'second.mkv', mimeType: 'video/x-matroska', buffer });
  await expect(page.locator('.frame-overlay')).toHaveText('FRAME 000000');
  await expect(page.locator('.class-card').first()).toBeEnabled();
  await expect(page.locator('.class-card').first()).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('2');
  await expect(page.locator('.class-card').nth(1)).toHaveAttribute('aria-pressed', 'true');
  await page.getByLabel('動画を選択', { exact: true }).setInputFiles(SAMPLE_VIDEO);
  await expect(page.locator('.frame-overlay')).toHaveText('FRAME 000000');
  await expect(page.locator('.class-card').first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.class-card').nth(1)).toHaveAttribute('aria-pressed', 'false');
});

test('saves a portable project and resumes after clearing browser storage', async ({ page }) => {
  await openSample(page);
  await page.getByRole('button', { name: 'クラスとキーの設定' }).click();
  await page.getByLabel('クラス1の名前').fill('キズ');
  await page.getByLabel('クラス1のキー').fill('9');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await page.keyboard.press('9');
  await page.locator('.confirm').click();
  await waitForFrame(page, 1);
  await page.keyboard.press('2');
  const [download] = await Promise.all([page.waitForEvent('download'), page.keyboard.press('Control+s')]);
  expect(download.suggestedFilename()).toBe('vp9-labeling-demo.frame.json');
  const projectPath = (await download.path())!;
  const saved = JSON.parse(await (await import('node:fs/promises')).readFile(projectPath, 'utf8'));
  expect(saved.index).toBe(1);
  expect(saved.rows['0']).toEqual({ reviewed: true, flags: [1, 0, 0] });
  await page.evaluate(() => localStorage.clear());
  await openSample(page);
  await page.getByLabel('作業ファイルを選択').setInputFiles(projectPath);
  await waitForFrame(page, 1);
  await expect(page.locator('.class-card').first()).toContainText('キズ');
  await expect(page.locator('.class-card').first().locator('kbd')).toHaveText('9');
  await expect(page.locator('.class-card').nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.review-status')).toContainText('未確認');
  await page.keyboard.press('ArrowLeft');
  await waitForFrame(page, 0);
  await expect(page.locator('.class-card').first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.review-status')).toContainText('確認済み');
  await expect(page.locator('.undo')).toBeDisabled();
});

test('rejects corrupt and mismatched projects while preserving current labels', async ({ page }) => {
  await openSample(page);
  await page.keyboard.press('1');
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: '作業を保存', exact: true }).click()]);
  const saved = JSON.parse(await (await import('node:fs/promises')).readFile((await download.path())!, 'utf8'));
  saved.video.name = 'another.mkv';
  for (const contents of ['not json', JSON.stringify(saved)]) {
    await page.getByLabel('作業ファイルを選択').setInputFiles({ name: 'bad.frame.json', mimeType: 'application/json', buffer: Buffer.from(contents) });
    await expect(page.locator('.message')).toContainText(/形式が正しく|一致しません/);
    await expect(page.locator('.class-card').first()).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.frame-overlay')).toHaveText('FRAME 000000');
  }
});
