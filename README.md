# Midscene Test Demo

AI-powered testing with Playwright, TypeScript and TARS (UI-TARS-1.5-7B).

## Setup

1. Install dependencies:
```bash
npm install
npm run install-browsers
```

2. Create `.env` file:
```bash
# TARS Configuration
OPENAI_BASE_URL=http://127.0.0.1:1234/v1
OPENAI_API_KEY=dummy
MIDSCENE_MODEL_NAME=ui-tars-1.5-7b
MIDSCENE_USE_VLM_UI_TARS=1

# Android Emulator (optional)
AUTO_START_EMULATOR=true
ANDROID_AVD_NAME=Pixel_9_Pro
EMULATOR_TIMEOUT=120000
```

## Run

```bash
npm test          # Run web demo test
npm run test:android  # Run Android demo test (auto-starts emulator)
npm run dev       # Development mode
npm run build     # Build TypeScript
```

## Demo Tests

### Web Test
```typescript
import { PlaywrightAgent } from '@midscene/web/playwright';

const agent = new PlaywrightAgent(page);

// AI-powered actions
await agent.aiAction('type "Buy milk" in the input field and press Enter');
await agent.aiAction('click the checkbox next to "Buy milk" to mark it as completed');
```

### Android Test
```typescript
import { AndroidAgent, getConnectedDevices, agentFromAdbDevice } from '@midscene/android';

// Get connected devices
const devices = await getConnectedDevices();
const deviceId = devices[0].udid;

// Create Android agent
const agent = await agentFromAdbDevice(deviceId);

// AI-powered Android actions
await agent.aiAction('open Settings app');
await agent.aiAction('scroll down and tap on "About phone"');
```

## Requirements

- TARS server running on `http://127.0.0.1:1234/v1`
- Node.js 16+
- UI-TARS-1.5-7B model available
- Android SDK with AVD (for Android tests) 