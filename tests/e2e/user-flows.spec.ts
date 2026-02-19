import { test, expect } from "@playwright/test";

test.describe("Date input and calculation flow", () => {
  test("entering PR and temp dates triggers calculation cards", async ({
    page,
  }) => {
    await page.goto("/");

    await page.fill("#prStartDate", "2022-01-01");
    await page.fill("#tmpStartDate", "2020-01-01");

    await expect(page.getByText("Citizenship Eligibility")).toBeVisible();
    await expect(page.getByText("PR Status")).toBeVisible();

    await expect(page.getByText("Total Days")).toBeVisible();
    await expect(page.getByText("PR Days")).toBeVisible();
    await expect(page.getByText("Temp Status Days")).toBeVisible();
  });

  test("calculation cards show numeric results after date entry", async ({
    page,
  }) => {
    await page.goto("/");

    await page.fill("#prStartDate", "2022-01-01");
    await page.fill("#tmpStartDate", "2020-01-01");

    const totalDaysBlock = page.getByText("Total Days Today").locator("..");
    await expect(totalDaysBlock).toBeVisible();

    const prStatusBadge = page
      .locator("[class*='card']")
      .filter({ hasText: "PR Status" })
      .getByRole("status");

    await expect(
      prStatusBadge.or(page.getByText("Secure").or(page.getByText("At Risk")))
    ).toBeVisible();
  });
});

test.describe("Absence management flow", () => {
  test("adding an absence shows it in the absences list", async ({ page }) => {
    await page.goto("/");

    await page.fill("#absenceStart", "2024-06-01");
    await page.fill("#absenceEnd", "2024-06-15");
    await page.fill("#description", "Summer vacation");
    await page.click('button:has-text("Add Absence")');

    await expect(page.getByText("2024-06-01")).toBeVisible();
    await expect(page.getByText("2024-06-15")).toBeVisible();
    await expect(page.getByText("Summer vacation")).toBeVisible();
  });

  test("adding multiple absences lists them all", async ({ page }) => {
    await page.goto("/");

    await page.fill("#absenceStart", "2024-01-10");
    await page.fill("#absenceEnd", "2024-01-20");
    await page.fill("#description", "Trip 1");
    await page.click('button:has-text("Add Absence")');

    await page.fill("#absenceStart", "2024-03-01");
    await page.fill("#absenceEnd", "2024-03-10");
    await page.fill("#description", "Trip 2");
    await page.click('button:has-text("Add Absence")');

    await expect(page.getByText("Trip 1")).toBeVisible();
    await expect(page.getByText("Trip 2")).toBeVisible();
  });

  test("removing an absence removes it from the list", async ({ page }) => {
    await page.goto("/");

    await page.fill("#absenceStart", "2024-06-01");
    await page.fill("#absenceEnd", "2024-06-15");
    await page.fill("#description", "To be removed");
    await page.click('button:has-text("Add Absence")');

    await expect(page.getByText("To be removed")).toBeVisible();

    const deleteButton = page
      .locator("div")
      .filter({ hasText: "To be removed" })
      .getByRole("button");
    await deleteButton.click();

    await expect(page.getByText("To be removed")).not.toBeVisible();
    await expect(page.getByText("No absences recorded")).toBeVisible();
  });

  test("same-day absence does not reduce day counts", async ({ page }) => {
    await page.goto("/");

    await page.fill("#prStartDate", "2022-01-01");
    await page.fill("#tmpStartDate", "2022-01-01");

    await page.waitForTimeout(500);
    const prDaysBefore = await page
      .getByText("PR Days Today")
      .locator("..")
      .locator("div")
      .first()
      .textContent();

    await page.fill("#absenceStart", "2024-06-15");
    await page.fill("#absenceEnd", "2024-06-15");
    await page.fill("#description", "Day trip");
    await page.click('button:has-text("Add Absence")');

    await page.waitForTimeout(500);
    const prDaysAfter = await page
      .getByText("PR Days Today")
      .locator("..")
      .locator("div")
      .first()
      .textContent();

    expect(prDaysBefore).toBe(prDaysAfter);
  });
});

test.describe("Data export/import flow", () => {
  test("exported data can be re-imported with state preserved", async ({
    page,
  }) => {
    await page.goto("/");

    await page.fill("#prStartDate", "2023-05-15");
    await page.fill("#tmpStartDate", "2020-03-01");

    await page.fill("#absenceStart", "2024-01-10");
    await page.fill("#absenceEnd", "2024-01-20");
    await page.fill("#description", "Import test trip");
    await page.click('button:has-text("Add Absence")');

    await expect(page.getByText("Import test trip")).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click('button:has-text("Export JSON")'),
    ]);

    const filePath = await download.path();
    expect(filePath).toBeTruthy();

    await page.reload();
    await expect(page.getByText("No absences recorded")).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await expect(page.getByText("Import test trip")).toBeVisible();
  });
});
