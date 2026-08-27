import { test, expect } from "@playwright/test";

test.describe("Owly Anonymous Random Chat User Flow", () => {
  test("complete user journey: landing → age gate → matching → chat → leave", async ({
    page,
  }) => {
    // 1. Visit landing page
    await page.goto("/");
    await expect(page).toHaveTitle(/Owly/);
    await expect(page.getByRole("heading", { name: /Talk to strangers/i })).toBeVisible();

    // 2. Click Start Chatting -> redirects to age gate
    await page.getByRole("button", { name: /Start Chatting Now/i }).click();
    await expect(page).toHaveURL(/.*age-gate/);

    // 3. Complete age verification, then select gender
    await page.getByText(/I am at least 18 years of age or older/i).click();
    await page.getByText(/I agree to the Community Guidelines/i).click();
    await page.getByRole("button", { name: /^Continue$/i }).click();
    await expect(page.getByRole("heading", { name: /Your Gender/i })).toBeVisible();
    await page.getByRole("radio", { name: /^Male$/i }).click();
    await page.getByRole("button", { name: /Enter Anonymous Chat/i }).click();

    // 4. Lands on Chat interface with selected gender
    await expect(page).toHaveURL(/.*chat/);
    await expect(page.getByText(/Ready for a conversation?/i)).toBeVisible();
    await expect(page.getByText(/^Male$/i)).toBeVisible();

    // 5. Check legal links
    await page.goto("/guidelines");
    await expect(page.getByText("Protect Your Identity")).toBeVisible();
    await page.goto("/privacy");
    await expect(page.getByText("Privacy Policy")).toBeVisible();
  });
});
