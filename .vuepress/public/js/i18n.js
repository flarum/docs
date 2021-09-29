var locale, dir, file_path, tip, outdated_tip, processing_tip, is_processing;

function initTip(locale) {
    switch (locale) {
        case 'en':
            outdated_tip = 'The translation of this page may not be up to date, please refer to the <a>English document</a> for the latest information. If there is a problem with the translation, please <a>let us know</a>.';
            processing_tip = 'The translation of extend documents is still a work in progress, please refer to the <a>English document</a> for the latest information. If you have problems with the translation, please <a>let us know</a>.';
            is_processing = false;
            break;
        case 'zh':
            outdated_tip = '此页面的翻译可能更新不及时，最新信息请以<a>英文文档</a>为准。如果翻译有问题，请<a>告诉我们</a>。';
            processing_tip = '当前文档仍在翻译中（进度 6/23），有关最新信息，请查阅<a>英文文档</a>。如果翻译有问题，请<a>告诉我们</a>。';
            is_processing = true;
            break;
        case 'tr':
            outdated_tip = 'The translation of this page may not be up to date, please refer to the <a>English document</a> for the latest information. If there is a problem with the translation, please <a>let us know</a>.';
            processing_tip = 'The translation of extend documents is still a work in progress, please refer to the <a>English document</a> for the latest information. If you have problems with the translation, please <a>let us know</a>.';
            is_processing = true;
            break;
        case 'it':
            outdated_tip = 'The translation of this page may not be up to date, please refer to the <a>English document</a> for the latest information. If there is a problem with the translation, please <a>let us know</a>.';
            processing_tip = 'The translation of extend documents is still a work in progress, please refer to the <a>English document</a> for the latest information. If you have problems with the translation, please <a>let us know</a>.';
            is_processing = true;
            break;
        case 'es':
            outdated_tip = 'La traducción de esta página podría no estar actualizada, por favor consulte el <a>documento en Inglés</a> para obtener la información más reciente. Si hay algún problema con la traducción, por favor <a>háganoslo saber</a>.';
            processing_tip = 'La traducción de los documentos de extensión aún está en desarrollo, por favor, consulte el <a>documento en Inglés</a> para obtener la información más reciente. Si tiene problemas con la traducción, por favor <a>háganoslo saber</a>.';
            is_processing = true;
            break;
        default:
            break;
    }
}


var title = document.title;
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
var target = document.querySelector('head > title');
var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function () {
        if (title != document.title) {
            showTip();
            title = document.title;
        }
    });
});

observer.observe(target, {
    subtree: true,
    characterData: true,
    childList: true,
});


locale = document.getElementsByTagName("html").item(0).getAttribute("lang").substring(0, 2);
initTip(locale);

function showTip() {

    url = window.location.pathname;

    locale = document.getElementsByTagName("html").item(0).getAttribute("lang").substring(0, 2);
    if (locale != 'en') {
        dir = url.substring(3, url.lastIndexOf('/'));
        file_path = url.substring(url.lastIndexOf('/'));
        href = dir + file_path;

        initTip(locale);

        tip = (dir == '/extend' && is_processing) ? processing_tip : outdated_tip;
        try {
            document.querySelector('div.theme-default-content').insertAdjacentHTML('afterbegin', '<div class="notification-container blue"><div class="outdated-tip"><p>' + tip + '</p></div></div>'
            );

            var tip_a = document.querySelectorAll('div.outdated-tip p a');

            tip_a[0].setAttribute("href", href);
            tip_a[0].setAttribute("target", "_blank");
            tip_a[1].setAttribute("href", "https://github.com/flarum/docs/issues");
            tip_a[1].setAttribute("target", "_blank");
        } catch (error) {

        }
    }
}

window.onload = showTip;
