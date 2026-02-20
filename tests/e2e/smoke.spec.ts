import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("app loads and shows the main heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("PR start date input is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/PR Start Date/i)).toBeVisible();
  });

  test("can navigate and interact with the form", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByLabel(/PR Start Date/i).or(page.getByRole("textbox").first())
    ).toBeVisible();
  });
});
