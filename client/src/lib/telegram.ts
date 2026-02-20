import WebApp from '@twa-dev/sdk';

// This is a minimal mock for local development outside Telegram
export const initTelegramApp = () => {
    try {
        WebApp.ready();

        // In local dev outside of Telegram, initDataUnsafe will be empty.
        // We inject a mock user if it's empty so development can continue.
        if (!WebApp.initDataUnsafe?.user) {
            console.warn("Running outside of Telegram. Using Mock Telegram User.");
            WebApp.initDataUnsafe = {
                user: {
                    id: 123456789,
                    first_name: "Mockingbird",
                    last_name: "Dev",
                    username: "mock_user",
                    language_code: "en",
                },
                query_id: "mock_query_id",
                auth_date: Date.now(),
                hash: "mock_hash"
            } as any;
        }
    } catch (error) {
        console.error("Failed to initialize Telegram WebApp", error);
    }
};

export const getTelegramUser = () => {
    return WebApp.initDataUnsafe?.user;
};
