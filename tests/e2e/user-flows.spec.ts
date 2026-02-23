import { test, expect, type Page } from "@playwright/test";

async function addAbsence(
  page: Page,
  start: string,
  end: string,
  description: string
) {
  await page.locator("#absenceStart").fill(start);
  await page.locator("#absenceEnd").fill(end);
  await page.locator("#description").fill(description);
  await page.click('button:has-text("Add Absence")');
  await expect(page.getByText(description).first()).toBeVisible();
}

test.describe("Date input and calculation flow", () => {
  test("entering PR and temp dates triggers calculation cards", async ({
    page,
  }) => {
    await page.goto("/");

    await page.locator("#prStartDate").fill("2022-01-01");
    await page.locator("#tmpStartDate").fill("2020-01-01");

    await expect(
      page.getByText("Citizenship Eligibility").first()
    ).toBeVisible();
    await expect(page.getByText("PR Status").first()).toBeVisible();

    await expect(page.getByText("Total Days").first()).toBeVisible();
    await expect(page.getByText("PR Days").first()).toBeVisible();
    await expect(page.getByText("Temp Status Days").first()).toBeVisible();
  });

  test("calculation cards show numeric results after date entry", async ({
    page,
  }) => {
    await page.goto("/");

    await page.locator("#prStartDate").fill("2022-01-01");
    await page.locator("#tmpStartDate").fill("2020-01-01");

    await expect(page.getByText("Total Days Today").first()).toBeVisible();

    await expect(
      page.getByText("Secure").or(page.getByText("At Risk")).first()
    ).toBeVisible();
  });
});

test.describe("Absence management flow", () => {
  test("adding an absence shows it in the absences list", async ({ page }) => {
    await page.goto("/");

    await addAbsence(page, "2024-06-01", "2024-06-15", "Summer vacation");

    await expect(page.getByText("2024-06-01")).toBeVisible();
    await expect(page.getByText("2024-06-15")).toBeVisible();
    await expect(page.getByText("Summer vacation")).toBeVisible();
  });

  test("adding multiple absences lists them all", async ({ page }) => {
    await page.goto("/");

    await addAbsence(page, "2024-01-10", "2024-01-20", "Trip 1");
    await addAbsence(page, "2024-03-01", "2024-03-10", "Trip 2");

    await expect(page.getByText("Trip 1")).toBeVisible();
    await expect(page.getByText("Trip 2")).toBeVisible();
  });

  test("removing an absence removes it from the list", async ({ page }) => {
    await page.goto("/");

    await addAbsence(page, "2024-06-01", "2024-06-15", "To be removed");
    await expect(page.getByText("To be removed")).toBeVisible();

    await page
      .getByRole("button", { name: "Remove absence To be removed" })
      .click();

    await expect(page.getByText("To be removed")).not.toBeVisible();
    await expect(page.getByText("No absences recorded")).toBeVisible();
  });

  test("same-day absence does not reduce day counts", async ({ page }) => {
    await page.goto("/");

    await page.locator("#prStartDate").fill("2022-01-01");
    await page.locator("#tmpStartDate").fill("2022-01-01");

    await expect(page.getByText("Calculating...")).toHaveCount(0);
    const prDaysBefore = await page
      .getByText("PR Days Today")
      .first()
      .locator("..")
      .locator("div")
      .first()
      .textContent();

    await addAbsence(page, "2024-06-15", "2024-06-15", "Day trip");

    await expect(page.getByText("Calculating...")).toHaveCount(0);
    const prDaysAfter = await page
      .getByText("PR Days Today")
      .first()
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

    await page.locator("#prStartDate").fill("2023-05-15");
    await page.locator("#tmpStartDate").fill("2020-03-01");

    await addAbsence(page, "2024-01-10", "2024-01-20", "Import test trip");
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
