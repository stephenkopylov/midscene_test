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

        await agent.ai('Wait for page to load');

        // await checkForGenericPopup(agent);

        await agent.ai('Close all popups, tutorials and tooltips and press Register button in left bottom corner');

        await agent.ai('Go to "Login" section and login using credentials - email: ' + config.login + ' and password: ' + config.password);

        await agent.ai('If there is captcha, solve it and continue login');

        // await agent.aiInput(config.login, '"Email" input field');

        // await agent.aiInput(config.password, '"Password" input field');

        // await agent.aiKeyboardPress('Enter');

        // await checkForGenericPopup(agent);

        await agent.ai('Close all popups if there are any');

        await agent.ai('Tap User balance on the top panel and select Demo Balance in the popup');

        await agent.ai('Tap "Buy" button on the bottom');

        await agent.ai('Tap "Sell" button on the bottom');

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