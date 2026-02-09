/**
 * I18n - Internationalization Module
 * Handles multi-language support
 */

class I18n {
    constructor() {
        this.translations = {};
        this.supportedLanguages = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'id', 'tr', 'de', 'fr', 'hi', 'ru'];
        this.currentLang = this.detectLanguage();
    }

    /**
     * Detect user's preferred language
     */
    detectLanguage() {
        // Check localStorage first
        const stored = localStorage.getItem('preferredLanguage');
        if (stored && this.supportedLanguages.includes(stored)) {
            return stored;
        }

        // Check browser language
        const browserLang = navigator.language.split('-')[0].toLowerCase();
        if (this.supportedLanguages.includes(browserLang)) {
            return browserLang;
        }

        // Default to English
        return 'en';
    }

    /**
     * Load translations for a specific language
     */
    async loadTranslations(lang) {
        if (this.translations[lang]) {
            return this.translations[lang];
        }

        try {
            const response = await fetch(`js/locales/${lang}.json`);
            if (!response.ok) throw new Error(`Failed to load ${lang}`);
            this.translations[lang] = await response.json();
            return this.translations[lang];
        } catch (error) {
            console.error(`Error loading language ${lang}:`, error);
            // Fallback to English if available
            if (lang !== 'en' && this.translations['en']) {
                return this.translations['en'];
            }
            return {};
        }
    }

    /**
     * Get translated string using dot notation
     * Example: t('intro.title')
     */
    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];

        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }

        return value || key;
    }

    /**
     * Set the current language
     */
    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Unsupported language: ${lang}`);
            return;
        }

        await this.loadTranslations(lang);
        this.currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);

        // Update HTML lang attribute
        document.documentElement.lang = lang;

        // Update all translatable elements
        this.updateUI();
    }

    /**
     * Update all UI elements with translations
     */
    updateUI() {
        // Update elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach((element) => {
            const key = element.getAttribute('data-i18n');
            const text = this.t(key);

            // Check if it's a meta tag or regular element
            if (element.tagName === 'META') {
                if (element.hasAttribute('content')) {
                    element.setAttribute('content', text);
                }
            } else {
                element.textContent = text;
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLang;
    }

    /**
     * Get human-readable language name
     */
    getLanguageName(lang) {
        const names = {
            ko: '한국어',
            en: 'English',
            ja: '日本語',
            zh: '中文',
            es: 'Español',
            pt: 'Português',
            id: 'Bahasa Indonesia',
            tr: 'Türkçe',
            de: 'Deutsch',
            fr: 'Français',
            hi: 'हिन्दी',
            ru: 'Русский'
        };
        return names[lang] || lang;
    }

    /**
     * Initialize i18n
     */
    async init() {
        // Load current language
        await this.loadTranslations(this.currentLang);

        // Load fallback (English)
        if (this.currentLang !== 'en') {
            await this.loadTranslations('en');
        }

        // Update UI
        this.updateUI();

        // Set HTML lang attribute
        document.documentElement.lang = this.currentLang;
    }
}

// Create global i18n instance
const i18n = new I18n();
