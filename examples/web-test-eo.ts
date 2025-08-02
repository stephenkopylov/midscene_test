import { chromium, type Browser, type Page } from 'playwright';
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
            headless: config.headless
        });

        const page = await browser.newPage();
        await page.setViewportSize({
            width: 1280,
            height: 768,
        });
        await page.goto(config.url);

        const agent = new PlaywrightAgent(page);

        await checkForGenericPopup(agent);

        await agent.ai('press Register button in left bottom corner');

        await agent.ai('go to "Login" section');

        await agent.ai(`type "${config.login}" in the email field`);

        await agent.ai(`type "${config.password}" in the "password" field`);

        await agent.aiKeyboardPress('Enter');

        await checkForGenericPopup(agent);

        await agent.ai('Tap User balance on the top panel');

        await agent.ai('Select Demo Balance');

        await agent.aiTap('Buy button on the bottom', { deepThink: true });

        await agent.aiTap('Sell button on the bottom', { deepThink: true });

        await browser.close();

    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
            console.log('🔒 Browser closed');
        }
    }
}

// Run the test
Promise.resolve(runDemoTest()).catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
}); 