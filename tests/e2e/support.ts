import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Waits until the page has stopped moving: fonts loaded, any pending view transition
 * started, and every running finite animation finished. Paused (off-screen idle) and infinite
 * animations are ignored because they never finish. Slow CI machines need the repeat.
 */
export async function settle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const frames = () =>
      new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    for (let round = 0; round < 25; round++) {
      await frames();
      const running = document
        .getAnimations()
        .filter(
          (animation) =>
            animation.playState === 'running' &&
            animation.effect?.getComputedTiming().iterations !== Infinity,
        );
      if (!running.length) {
        await frames();
        const late = document
          .getAnimations()
          .some(
            (animation) =>
              animation.playState === 'running' &&
              animation.effect?.getComputedTiming().iterations !== Infinity,
          );
        if (!late) return;
        continue;
      }
      await Promise.all(running.map((animation) => animation.finished.catch(() => {})));
    }
  });
}

/** Runs the WCAG 2.1 AA automated scan on a settled page. */
export async function expectAccessible(page: Page) {
  await settle(page);
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
  ).toEqual([]);
}
