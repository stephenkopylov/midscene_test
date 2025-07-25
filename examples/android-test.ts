import { AndroidAgent, getConnectedDevices, agentFromAdbDevice } from '@midscene/android';
import 'dotenv/config';

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

interface AndroidTestConfig {
    autoStartEmulator: boolean;
    avdName?: string;
    emulatorTimeout: number;
}

const config: AndroidTestConfig = {
    autoStartEmulator: process.env.AUTO_START_EMULATOR === 'true',
    avdName: process.env.ANDROID_AVD_NAME || 'Pixel_9_Pro',
    emulatorTimeout: parseInt(process.env.EMULATOR_TIMEOUT || '60000'),
};

async function runAndroidTest(): Promise<void> {
    let agent: AndroidAgent | undefined;
    let deviceId: string | undefined;

    try {
        console.log('🚀 Starting Android test...');

        // Get connected devices
        let devices = await getConnectedDevices();
        console.log(`📱 Found ${devices.length} connected devices:`, devices);

        // Create Android agent
        agent = await agentFromAdbDevice(devices[0].udid);
        console.log('🤖 Android agent initialized');

        await agent.aiAction('open browser and navigate to ebay.com');

        await sleep(5000);

        // 👀 type keywords, perform a search
        await agent.aiAction('type "Headphones" in search box, hit Enter');

        // 👀 wait for loading completed
        await agent.aiWaitFor('There is at least one headphone product');

        // 👀 understand the page content, extract data
        const items = await agent.aiQuery(
            '{itemTitle: string, price: Number}[], find item in list and corresponding price',
        );
        console.log('headphones in stock', items);

        // 👀 assert by AI
        await agent.aiAssert('There is a category filter on the left');

    } catch (error) {
        console.error('❌ Android test failed:', error);
        throw error;
    } finally {
        if (agent) {
            // Android agent doesn't have a close method, just log completion
            console.log('🔒 Android test completed');
        }
    }
}

// Run the test
Promise.resolve(runAndroidTest()).catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
}); 