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

        await agent.ai('Accept all cookies');

        await agent.ai('Tap "Contact Us" in menu at the top of the page');

        await agent.ai('Fill the "Name" field with "John Doe"');

        await agent.ai('Fill the "Work Email" field with "john.doe@example.com"');

        await agent.ai('Fill the "Ask your Question" field with "Hello, I have a question"');

        await agent.ai('Close popup with form by pressing "X" button');

        await agent.ai('Scroll the page all the way down, competely');

        await agent.ai('tap to the button with color scheme at bottom left corner and change it to "Dark"');

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