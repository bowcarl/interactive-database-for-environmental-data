import { test, expect } from '@playwright/test'
import { config } from 'dotenv'

config({ path: '.env.test' })

const UPLOAD_URL = 'http://localhost:8000'
const UPLOAD_ENDPOINT = '/api/upload/'


test.describe('Tests the upload page', () => {
  test('Testing upload functioality and checking the format', async ({ page }) => {

    await page.route(`${UPLOAD_URL}${UPLOAD_ENDPOINT}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true
        })
      })
    })

    try {
      await page.goto('/upload')
      await page.waitForTimeout(500)
      const fileChooserPromise = page.waitForEvent('filechooser')
      await page.getByRole('link', { name: 'Bla gjennom Filer listIcon' }).click()
      await page.waitForTimeout(1000)
      const fileChooser = await fileChooserPromise
      await fileChooser.setFiles('tests/test-data/elver.xlsx')
      await page.getByRole('main').getByRole('link', { name: 'Last opp listIcon' }).click()
      await page.waitForTimeout(1000)
      expect(await page.locator('//h3')).toHaveText('Opplasting vellykket')
      await page.getByRole('button', { name: 'Close' }).click()
    } catch (error) {
      throw error
    }
  }, { timeout: 30000 })
})
