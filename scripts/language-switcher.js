// scripts/language-switcher.js

class LanguageSwitcher {
    constructor() {
        this.createSwitcher();
        this.bindEvents();
    }

    createSwitcher() {
        const languages = [
            { code: 'ru', name: 'Русский', flag: '🇷🇺' },
            { code: 'en', name: 'English', flag: '🇬🇧' },
            { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
            { code: 'fr', name: 'Français', flag: '🇫🇷' },
            { code: 'hi', name: 'हिंदी', flag: '🇮🇳' }
        ];

        const $switcher = $('<div class="language-switcher"></div>');
        const $button = $('<button class="lang-current"><span class="lang-flag">🇷🇺</span> Русский <i class="bi bi-chevron-down"></i></button>');
        const $menu = $('<div class="lang-menu"></div>');

        languages.forEach(lang => {
            const $item = $(`<div class="lang-item" data-lang="${lang.code}">
                <span class="lang-flag">${lang.flag}</span> ${lang.name}
            </div>`);
            $menu.append($item);
        });

        $switcher.append($button);
        $switcher.append($menu);
        $('body').append($switcher);

        // Стили для переключателя
        $('<style>')
            .text(`
                .language-switcher {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    z-index: 10000;
                    font-family: Arial, sans-serif;
                }
                .lang-current {
                    background: rgba(0,0,0,0.7);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    border-radius: 20px;
                    padding: 8px 15px;
                    cursor: pointer;
                    backdrop-filter: blur(5px);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .lang-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 5px;
                    background: rgba(0,0,0,0.9);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 10px;
                    overflow: hidden;
                    display: none;
                    min-width: 150px;
                }
                .language-switcher:hover .lang-menu {
                    display: block;
                }
                .lang-item {
                    padding: 10px 15px;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: background 0.2s;
                }
                .lang-item:hover {
                    background: rgba(255,255,255,0.1);
                }
                .lang-flag {
                    font-size: 1.2em;
                }
            `)
            .appendTo('head');
    }

    bindEvents() {
        $('.lang-item').on('click', (e) => {
            const $target = $(e.currentTarget);
            const langCode = $target.data('lang');
            
            // Обновляем отображение
            $('.lang-current').html(`
                <span class="lang-flag">${$target.find('.lang-flag').text()}</span> 
                ${$target.text().replace(/[🇷🇺🇬🇧🇩🇪🇫🇷🇮🇳]/g, '').trim()} 
                <i class="bi bi-chevron-down"></i>
            `);

            // Меняем язык
            lang.setLanguage(langCode);
        });
    }
}

// Инициализируем после загрузки DOM
$(document).ready(() => {
    if (DEV) {
        new LanguageSwitcher();
    }
});