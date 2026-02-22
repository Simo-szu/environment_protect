import type { StringMessages } from './src/i18n/locales/zh';

declare module 'next-intl' {
    interface AppConfig {
        Messages: StringMessages;
    }
}
