import { expect, test } from '@playwright/test'

test('index page has expected h1', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Gibs' })).toBeVisible()
})
test('main has been rendered', async ({ page }) => {
  await page.goto('/delivery')
  await expect(page.getByRole('main')).toBeVisible()
})

// test('button disabled at load', async ({ page }) => {
//   await page.goto('/delivery')
//   const button = page.getByTestId('progression-button')
//   console.log(button)
//   await expect(button).not.toBeDisabled()
// })
