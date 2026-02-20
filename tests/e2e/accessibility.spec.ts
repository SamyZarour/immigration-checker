import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  test("home page has no critical a11y violations", async ({ page }) => {
    await page.goto("/");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("page with populated data has no critical a11y violations", async ({
    page,
  }) => {
    await page.goto("/");

    await page.fill("#prStartDate", "2022-01-01");
    await page.fill("#tmpStartDate", "2020-01-01");
    await page.fill("#absenceStart", "2024-06-01");
    await page.fill("#absenceEnd", "2024-06-15");
    await page.fill("#description", "Test absence");
    await page.click('button:has-text("Add Absence")');

    await page.waitForTimeout(500);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
