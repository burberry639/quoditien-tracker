const { chromium, devices } = require('playwright-core');

const DEVICE = devices['iPhone 12'];
const TARGET_URL = process.env.APP_URL || 'http://127.0.0.1:3000';

async function run() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        ...DEVICE
    });
    const page = await context.newPage();

    page.on('console', msg => {
        console.log('[browser]', msg.type(), msg.text());
    });

    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    await page.waitForTimeout(2000);

    const loginButton = page.locator('button', { hasText: 'SE CONNECTER' });
    if (await loginButton.count() === 0) {
        console.error('Login button introuvable');
    } else {
        const box = await loginButton.first().boundingBox();
        if (box) {
            const elementAtPoint = await page.evaluate(({ x, y }) => {
                const el = document.elementFromPoint(x, y);
                const stack = document.elementsFromPoint(x, y).map(node => ({
                    tag: node.tagName,
                    id: node.id || null,
                    classes: node.className || null
                }));
                return {
                    top: el ? {
                        tag: el.tagName,
                        id: el.id || null,
                        classes: el.className || null,
                        html: el.outerHTML.slice(0, 200)
                    } : null,
                    stack
                };
            }, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
            console.log('Element au point du bouton:', elementAtPoint);
        }
        const overlayStyles = await page.evaluate(() => {
            const overlay = document.getElementById('loginOverlay');
            if (!overlay) return null;
            const styles = window.getComputedStyle(overlay);
            return {
                pointerEvents: styles.pointerEvents,
                zIndex: styles.zIndex,
                display: styles.display
            };
        });
        const overlayCount = await page.evaluate(() => document.querySelectorAll('#loginOverlay').length);
        console.log('Nombre d\'overlays:', overlayCount);
        console.log('Styles overlay:', overlayStyles);
        console.log('Clicking login button...');
        try {
            await loginButton.first().click({ trial: false });
        } catch (error) {
            console.error('Erreur pendant le clic:', error);
        }
    }

    await page.waitForTimeout(2000);
    await browser.close();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});

