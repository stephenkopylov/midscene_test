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



async function checkForGenericPopup(agent: PlaywrightAgent): Promise<boolean> {
    return agent.aiBoolean(
        'Is there any popup or tooltip?',
    );
}

async function closeGenericPopup(agent: PlaywrightAgent): Promise<void> {
    await agent.aiAction('If there is any popup or tooltip - close it. Some popups require pressing "Confirm" button to close"');

    await sleep(500);
}


const checkForGenericPopupAndClose = async (agent: PlaywrightAgent): Promise<void> => {
    await closeGenericPopup(agent);

    const isGenericPopupExists = await checkForGenericPopup(agent);

    if (isGenericPopupExists) {
        await checkForGenericPopupAndClose(agent);
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

        const page = await browser.newPage();
        await page.setViewportSize({
            width: 1280,
            height: 768,
        });
        await page.goto(config.url);

        const agent = new PlaywrightAgent(page);
        agent.setAIActionContext(`Use action "Tap" instead of "Click"`)

        await checkForGenericPopupAndClose(agent);

        const balance = await agent.aiNumber('Get balance of the user (it will be number in USD )');
        console.log(balance);

        if (balance == 10000) {
            console.log('🔍 Balance is 10000, everything is ok');
        }

        console.log('🔍 Going to Settings page and choosing Dark theme');
        await agent.ai('Go to Settings page and choose Dark theme');

        console.log('🔍 Going to Register page');
        await agent.ai('Tap "Register" button in left bottom corner');

        console.log('🔍 Going to Login page');
        await agent.ai('Go to "Login" tab (on the top of the page)');

        console.log('🔍 Logging in');
        await agent.ai('Type ' + config.login + ' in "email" field')
        await agent.ai('Type ' + config.password + ' in "password" field')
        await agent.aiKeyboardPress('Enter')

        await agent.ai('Wait for login to complete (platform should load again)')

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