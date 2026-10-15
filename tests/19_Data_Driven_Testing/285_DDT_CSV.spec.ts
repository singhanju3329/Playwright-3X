import { test, expect } from '@playwright/test';
import { readCSV } from './util/csvReader';
import path from 'path';

test.describe('DDT CSV', () => {
    const loginData = readCSV(path.join(__dirname, '/test-data/login-data.csv'));
    
    for (const data of loginData) {

        test(`Login with : ${data.description}`, async ({ page }) => {
            await page.goto('https://app.thetestingacademy.com/playwright/multiple_element_filter');

            let textboxEmailAddress = page.getByRole("textbox", { name: "Email Address" });
            let textboxPassword = page.getByRole("textbox", { name: "Password" }).or(page.locator("#password")).or(page.locator("[name=\"password\"]"));
            let buttonLoginToPracticeAccount = page.getByRole("button", { name: "Login to Practice Account" }).or(page.getByTestId("login-button")).or(page.getByText("Login to Practice Account"));
            await textboxEmailAddress.fill(data.username);
            await textboxPassword.fill(data.password);
            // The browser blocks the submit when the email format is invalid (e.g. the SQL injection row)
            const isEmailFormatValid = await textboxEmailAddress.evaluate((el: HTMLInputElement) => el.checkValidity());
            await buttonLoginToPracticeAccount.click();

            // The practice page does not check credentials: every accepted submit lands on #login-success
            if (isEmailFormatValid) {
                await expect(page).toHaveURL(/#login-success/);
            } else {
                await expect(page).not.toHaveURL(/#login-success/);
            }

        });

    }


});