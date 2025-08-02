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
}

const config: TestConfig = {
    headless: process.env.HEADLESS === 'true',
    viewport: {
        width: 1280,
        height: 720,
    },
    url: 'https://demo.playwright.dev/todomvc',
};

async function runDemoTest(): Promise<void> {
    let browser: Browser | undefined;

    try {
        console.log('🚀 Starting Midscene demo test...');

        // Launch browser
        browser = await chromium.launch({
            headless: config.headless
        });

        const page: Page = await browser.newPage();
        await page.setViewportSize(config.viewport);

        console.log(`📱 Navigating to ${config.url}...`);
        await page.goto(config.url);

        console.log('🤖 Initializing Midscene agent...');
        const agent = new PlaywrightAgent(page);

        // Demo test steps
        console.log('📝 Adding first todo item...');
        await agent.aiAction('type "Buy milk" in the input field');

        await agent.aiAction('press "Enter" key');

        console.log('📝 Adding second todo item...');
        await agent.aiAction('type "Walk the dog" in the input field');

        await agent.aiAction('press "Enter" key');

        console.log('✅ Marking first todo as completed...');
        await agent.aiAction('click the checkbox next to "Buy milk" to mark it as completed');

        console.log('🗑️ Deleting second todo...');
        await agent.aiAction('hover over "Walk the dog" and click the delete button');

        console.log('🎉 Demo test completed successfully!');

        // Keep browser open for a bit to see the result
        await sleep(5000);

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