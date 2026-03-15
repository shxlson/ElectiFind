import { test, expect } from "@playwright/test";

test.describe("Landing page smoke", () => {
  test("renders brand and primary call-to-action", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("ElectiFind").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Get Started" })).toBeVisible();
  });

  test("mobile viewport still shows navigation actions", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Get Started" })).toBeVisible();
  });
});
