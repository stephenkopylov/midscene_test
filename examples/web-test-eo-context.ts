import { chromium, type Browser } from 'playwright';
import { PlaywrightAgent } from '@midscene/web/playwright';
import 'dotenv/config';

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

interface TestConfig {
    headless: boolean;
    viewport: {
        width: number;
        height: number;
    };
    url: string;
    login: string;
    password: string;
    cookies_url: string;
    cookies_token: string;
    cookies_tokenDemo: string;
}

const config: TestConfig = {
    headless: process.env.HEADLESS === 'true',
    viewport: {
        width: 1280,
        height: 720,
    },
    url: process.env.TEST_URL || '',
    login: process.env.TEST_LOGIN || '',
    password: process.env.TEST_PASSWORD || '',
    cookies_url: process.env.COOKIES_URL || '',
    cookies_token: process.env.COOKIES_TOKEN || '',
    cookies_tokenDemo: process.env.COOKIES_TOKEN_DEMO || '',
};

async function checkForGenericPopup(agent: PlaywrightAgent): Promise<void> {
    const isGenericPopupExists = await agent.aiBoolean(
        'Whether there is a popup with "Allow" and "Cancel" or "Skip" or "Close" buttons?',
    );

    if (isGenericPopupExists) {
        await agent.aiAction('close popup');
    }
}

async function runDemoTest(): Promise<void> {
    let browser: Browser | undefined;

    try {
        console.log('🚀 Starting Midscene demo test...');

        // Launch browser
        browser = await chromium.launch({
            headless: config.headless,
        });

        const context = await browser.newContext();

        await context.addCookies([
            {
                name: 'token',
                value: config.cookies_token,
                url: config.cookies_url,
            },
            {
                name: 'tokenDemo',
                value: config.cookies_tokenDemo,
                url: config.cookies_url,
            },
        ]);

        const page = await context.newPage();
        await page.setViewportSize({
            width: 1280,
            height: 768,
        });
        await page.goto(config.url);

        const agent = new PlaywrightAgent(page);

        await checkForGenericPopup(agent);

        await agent.ai('Tap "Real Balance" button in the top panel');

        await agent.ai('Select "Demo Balance" in the popup');

        await agent.ai('Tap "Buy" button on the bottom and then "Sell" button on the bottom');

        await browser.close();

    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
            console.log('🔒 Web test completed');
        }
    }
}

// Run the test
Promise.resolve(runDemoTest()).catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
}); 