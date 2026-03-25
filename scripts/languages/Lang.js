// scripts/languages/Lang.js

class Lang {
    constructor(lang = 'ru') {
        this.currentLanguage = lang;
        this.translations = {};
        this.fallbackLanguage = lang;
        this.loaded = false;
        this.init(lang);
    }

    /**
     * Инициализация языкового менеджера
     * @param {string} language - код языка (ru, en, de, fr, hi)
     */
    init(language = 'ru') {
        this.currentLanguage = language;
        this.loadLanguage(language);
    }

    /**
     * Загрузка языкового файла
     * @param {string} language - код языка
     */
    loadLanguage(language) {
        return new Promise((resolve, reject) => {
            // Проверяем, загружен ли уже язык
            if (this.translations[language]) {
                this.loaded = true;
                resolve(this.translations[language]);
                return;
            }

            // Загружаем файл с переводами
            const script = document.createElement('script');
            const version = getScriptParam('v');

            script.src = `./scripts/languages/${language}.js?v=${version}`;
            script.onload = () => {
                if (window[`LANG_${language.toUpperCase()}`]) {
                    this.translations[language] = window[`LANG_${language.toUpperCase()}`];
                    this.loaded = true;
                    this.applyToDOM();
                    resolve(this.translations[language]);
                } else {
                    reject(new Error(`Language ${language} not found`));
                }
            };
            script.onerror = () => {
                console.warn(`Failed to load language ${language}, using fallback`);
                if (language !== this.fallbackLanguage) {
                    this.loadLanguage(this.fallbackLanguage).then(resolve).catch(reject);
                } else {
                    reject(new Error(`Failed to load fallback language ${language}`));
                }
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Получение переведенной строки
     * @param {string} key - ключ строки
     * @param {Object} params - параметры для подстановки
     * @returns {string}
     */
    get(key, params = {}) {
        if (!this.translations[this.currentLanguage]) {
            return key;
        }

        let text = this.translations[this.currentLanguage][key];
        
        // Если перевод не найден, пробуем на fallback языке
        if (!text && this.currentLanguage !== this.fallbackLanguage) {
            text = this.translations[this.fallbackLanguage]?.[key];
        }
        
        // Если все еще не найден, возвращаем ключ
        if (!text) {
            return key;
        }

        // Замена параметров вида %1, %2 и т.д.
        return text.replace(/%(\d+)/g, (match, num) => {
            return params[num] !== undefined ? params[num] : match;
        });
    }

    /**
     * Смена языка
     * @param {string} language - новый язык
     * @returns {Promise}
     */
    setLanguage(language) {
        if (this.currentLanguage === language && this.translations[language]) {
            this.applyToDOM();
            return Promise.resolve(this.translations[language]);
        }

        return this.loadLanguage(language).then(() => {
            this.currentLanguage = language;
            this.applyToDOM();
            
            // Сохраняем выбор в localStorage
            try {
                localStorage.setItem('preferred_language', language);
            } catch (e) {}
            
            // Генерируем событие
            $(document).trigger('languageChanged', language);
            
            return this.translations[language];
        });
    }

    /**
     * Применение переводов к DOM элементам
     */
    applyToDOM() {
        if (!this.loaded) return;

        // Обрабатываем элементы с data-lang атрибутом
        $('[data-lang]').each((index, element) => {
            const $el = $(element);
            const key = $el.data('lang');
            const text = this.get(key);
            
            // Определяем, куда вставлять текст
            if ($el.is('input, textarea, select')) {
                $el.attr('placeholder', text);
            } else {
                $el.html(text);
            }
        });

        // Обрабатываем элементы с data-lang-title
        $('[data-lang-title]').each((index, element) => {
            const $el = $(element);
            const key = $el.data('lang-title');
            $el.attr('title', this.get(key));
        });

        // Обрабатываем элементы с data-lang-placeholder
        $('[data-lang-placeholder]').each((index, element) => {
            const $el = $(element);
            const key = $el.data('lang-placeholder');
            $el.attr('placeholder', this.get(key));
        });

        // Обновляем язык в HTML теге
        $('html').attr('lang', this.currentLanguage);
    }

    /**
     * Добавление новых переводов
     * @param {string} language - код языка
     * @param {Object} translations - объект с переводами
     */
    addTranslations(language, translations) {
        if (!this.translations[language]) {
            this.translations[language] = {};
        }
        Object.assign(this.translations[language], translations);
    }

    /**
     * Проверка наличия ключа
     * @param {string} key - ключ строки
     * @returns {boolean}
     */
    has(key) {
        return !!(this.translations[this.currentLanguage]?.[key] || 
                 this.translations[this.fallbackLanguage]?.[key]);
    }
}

function getPreferrerLang() {
     let preferredLanguage = 'ru';
    
    try {
        // Из URL параметра
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('lang')) {
            preferredLanguage = urlParams.get('lang');
        }
        // Из localStorage
        else if (localStorage.getItem('preferred_language')) {
            preferredLanguage = localStorage.getItem('preferred_language');
        }
        // Из браузера
        else {
            const browserLang = navigator.language.split('-')[0];
            if (['ru', 'en', 'de', 'fr', 'hi'].includes(browserLang)) {
                preferredLanguage = browserLang;
            }
        }
    } catch (e) {}

    return preferredLanguage;
}

window.lang = new Lang(getPreferrerLang());