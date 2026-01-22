from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:9000")

    # Verify Menu
    expect(page.locator("#menu-overlay")).to_be_visible()
    expect(page.get_by_role("heading", name="TETRIS LOCAL CO-OP")).to_be_visible()
    page.screenshot(path="verification/menu.png")
    print("Menu verified and screenshot taken.")

    # Start Game
    page.get_by_role("button", name="START GAME").click()

    # Verify Game Container and Players
    expect(page.locator("#menu-overlay")).to_be_hidden()
    expect(page.locator("#game-container")).to_be_visible()

    # Check for two instances of .tetris canvas or .full-game
    # We added .local class to player elements in index.js
    expect(page.locator(".full-game.local")).to_have_count(2)

    # Take screenshot of gameplay
    page.screenshot(path="verification/gameplay.png")
    print("Gameplay verified and screenshot taken.")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
