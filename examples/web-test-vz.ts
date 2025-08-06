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
    url: process.env.TEST_URL_VZ || '',
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
            width: 1200,
            height: 800,
        });
        await page.goto(config.url);

        const agent = new PlaywrightAgent(page);
        agent.setAIActionContext(`Use action "Tap" instead of "Click"`)

        const test = await agent.aiQuery('Get all items of top menu');
        console.log(`menu items = ${test}`);

        const number_of_menu_items = await agent.aiQuery('Get number of items of top menu and return as a number');
        console.log(`number of menu items = ${number_of_menu_items}`);

        await agent.ai('Accept all cookies');

        await agent.ai('Go to Pricing page');

        const prices = await agent.aiQuery('Get the list of prices for all plans in format [{plan_name: "The name of the plan", price_montly: "The price of the plan", price_yearly: "The price of the plan"}] (Price should be in just a number)');

        console.log(prices);

        await agent.ai('Tap "Contact Us" in menu at the top of the page');

        await agent.ai('Type "John Doe" in "Full Name" field');

        await agent.ai('Type "john.doe@example.com" in "Work Email" field');

        await agent.ai('Type "Hello, I have a question" in "Ask your Question" field');

        await agent.ai('Close popup with form by pressing "X" button');

        await agent.ai('Accept all cookies');

        await agent.ai('Scroll the page all the way down, competely');

        await agent.ai('Change the color theme tapping the button at bottom **left** corner and change it to "Dark" by default its "Auto"');

        await agent.aiWaitFor('The theme is changed to "Dark"');

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