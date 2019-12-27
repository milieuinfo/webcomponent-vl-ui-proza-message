import { VlElement, define } from '/node_modules/vl-ui-core/vl-core.js';
import '/node_modules/vl-ui-button/vl-button.js';
import '/node_modules/vl-ui-icon/vl-icon.js';
import '/node_modules/vl-ui-typography/vl-typography.js';
import '/node_modules/tinymce/tinymce.min.js';

/**
 * VlProzaMessage
 * @class
 * @classdesc De vl-proza-message webcomponent kan gebruikt worden om teksten te laten beheren door de business. De edit modus wordt geactiveerd door op het potlood icoon te klikken. De edit modus kan gedactiveerd worden door op enter te duwen of een focus te geven aan een ander element op de pagina. Wanneer de gebruiker op escape klikt zal de edit modus afgesloten worden en zullen de wijzigingen ongedaan gemaakt worden.
 *
 * @extends VlElement
 *
 * @property {string} data-vl-domain - Het Proza domein waarin het Proza bericht zit.
 * @property {string} data-vl-code - De code die het Proza bericht identificeert.
 *
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-proza-message/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-proza-message/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-proza-message.html|Demo}
 *
 */
export class VlProzaMessage extends VlElement(HTMLElement) {
    static get _observedAttributes() {
        return ['data-vl-domain', 'data-vl-code'];
    }

    constructor() {
        super();
        this.appendChild(this.__createWysiwygElement());
        this._shadow(`
            <style>
                @import '../style.css';
                @import '/node_modules/vl-ui-button/style.css';
                @import '/node_modules/vl-ui-icon/style.css';
            </style>
            <div>
                <slot></slot>
            </div>
        `);
    }

    connectedCallback() {
        this.__processToegelatenOperaties();
    }

    get _wysiwygElement() {
        return this.querySelector('#wysiwyg');
    }

    get _buttonElement() {
        return this._shadow.querySelector('button');
    }

    get _typographyElement() {
        return this.querySelector('vl-typography');
    }

    _getEditButtonTemplate() {
        const button = this._template(`
            <button is="vl-button-link" type="button">
                <span is="vl-icon" icon="edit"></span>
            </button>
        `);
        button.firstElementChild.addEventListener('click', () => this.__initWysiwyg());
        return button;
    }

    _data_vl_domainChangedCallback() {
        this._loadMessage();
    }

    _data_vl_codeChangedCallback() {
        this._loadMessage();
    }

    get _domain() {
        return this.dataset.vlDomain;
    }

    get _code() {
        return this.dataset.vlCode;
    }

    get _wysiwygConfig() {
        return {
            target: this._wysiwygElement,
            menubar: false,
            inline: true,
            toolbar: false,
            plugins: ['quickbars'],
            quickbars_selection_toolbar: 'bold italic underline',
            powerpaste_word_import: 'clean',
            powerpaste_html_import: 'clean',
            content_css: '/style.css',
            verify_html: false,
            forced_root_block: '',
            suffix: '.min'
        }
    }

    get _activeWysiwygEditor() {
        return tinyMCE.activeEditor;
    }

    _loadMessage() {
        if (this._domain && this._code) {
            VlProzaMessage._getMessage(this._domain, this._code).then(message => {
                this._wysiwygElement.innerHTML = message;
                this.__wrapWysiwygElement();
            });
        } else {
            this._wysiwygElement.innerHTML = null;
        }
    }

    static _getMessage(domain, code) {
        if (VlProzaMessagePreloader.isPreloaded(domain)) {
            return VlProzaMessagePreloader.getMessage(domain, code);
        } else {
            const messageCache = VlProzaMessage.__getMessageCacheForDomain(domain);
            if (!messageCache[code]) {
                messageCache[code] = ProzaRestClient.getMessage(domain, code);
            }
            return messageCache[code];
        }
    }

    static _getToegelatenOperaties(domain) {
        let toegelatenOperatiesCache = VlProzaMessage.__getToegelatenOperatiesCacheForDomain(domain);
        if (!toegelatenOperatiesCache) {
            toegelatenOperatiesCache = ProzaRestClient.getToegelatenOperaties(domain);
            VlProzaMessage.__setToegelatenOperatiesCacheForDomain(domain, toegelatenOperatiesCache);
        }
        return toegelatenOperatiesCache;
    }

    static get __domainCache() {
        if (!VlProzaMessage.__cache) {
            VlProzaMessage.__cache = {};
        }
        return VlProzaMessage.__cache;
    }

    static __getCacheForDomain(domain) {
        const cache = VlProzaMessage.__domainCache;
        if (!cache[domain]) {
            cache[domain] = {};
        }
        return cache[domain];
    }

    static __getToegelatenOperatiesCacheForDomain(domain) {
        return VlProzaMessage.__getCacheForDomain(domain).toegelatenOperaties;
    }

    static __setToegelatenOperatiesCacheForDomain(domain, toegelatenOperaties) {
        VlProzaMessage.__getCacheForDomain(domain).toegelatenOperaties = toegelatenOperaties;
    }

    static __getMessageCacheForDomain(domain) {
        const cache = VlProzaMessage.__getCacheForDomain(domain);
        if (!cache.messages) {
            cache.messages = {};
        }
        return cache.messages;
    }

    async __processToegelatenOperaties() {
        const toegelatenOperaties = await VlProzaMessage._getToegelatenOperaties(this._domain);
        if (toegelatenOperaties.update) {
            this._element.appendChild(this._getEditButtonTemplate());
        }
    }

    __initWysiwyg() {
        this.__unwrapWysiwygElement();
        tinyMCE.baseURL = '/node_modules/tinymce';
        tinyMCE.init(this._wysiwygConfig);
        this._activeWysiwygEditor.on('init', () => {
            this.__focusWysiwyg();
            this.__configureWysiwygStyle();
            this.__hideWysiwygButton();
            this.__bindWysiwygEvents();
        });
    }

    __focusWysiwyg() {
        const editor = this._activeWysiwygEditor;
        editor.focus();
        editor.selection.select(editor.getBody(), true);
        editor.selection.collapse(false);
    }

    __configureWysiwygStyle() {
        this._activeWysiwygEditor.bodyElement.classList.add('vl-typography');
    }

    __bindWysiwygEvents() {
        const editor = this._activeWysiwygEditor;
        editor.on('keydown', (e) => this.__processKeydownEvent(e));
        editor.on('blur', (e) => this.__processBlurEvent(e));
    }

    __processKeydownEvent(e) {
        if (this.__isEscapeKey(e)) {
            this.__undoAllWysiwygChanges();
            this.__stopWysiwyg();
        }
        if (this.__isEnterKey(e) && !this.__isShiftKey(e)) {
            this.__undoWysiwygChange();
            this.__stopWysiwyg();
        }
    }

    __isEscapeKey(e) {
        return e.keyCode === 27;
    }

    __isEnterKey(e) {
        return e.keyCode === 13;
    }

    __isShiftKey(e) {
        return e.shiftKey;
    }

    __undoWysiwygChange() {
        const editor = this._activeWysiwygEditor;
        if (editor.undoManager.hasUndo()) {
            editor.undoManager.undo();
        }
    }

    __undoAllWysiwygChanges() {
        const editor = this._activeWysiwygEditor;
        while (editor.undoManager.hasUndo()) {
            editor.undoManager.undo();
        }
    }

    __processBlurEvent() {
        this.__stopWysiwyg();
    }

    __stopWysiwyg() {
        const editor = this._activeWysiwygEditor;
        editor.destroy();
        this.__showWysiwygButton();
        this.__wrapWysiwygElement();
    }

    __hideWysiwygButton() {
        this._buttonElement.hidden = true;
    }

    __showWysiwygButton() {
        this._buttonElement.hidden = false;
    }

    __createWysiwygElement() {
        const div = document.createElement('div');
        div.id = "wysiwyg";
        div.style = "display: inline;";
        return div;
    }

    __wrapWysiwygElement() {
        if (!this._typographyElement) {
            const typography = document.createElement('vl-typography');
            typography.appendChild(this._wysiwygElement);
            this.appendChild(typography);
        }
    }

    __unwrapWysiwygElement() {
        if (this._typographyElement) {
            const typography = this._typographyElement;
            const wysiwyg = typography.firstChild;
            this.appendChild(wysiwyg);
            typography.remove();
        }
    }
}

/**
 * VlProzaMessagePreloader
 * @class
 * @classdesc
 *
 * @extends VlElement
 *
 * @property {string} data-vl-domain - Het Proza domein waarin de Proza berichten zitten.
 *
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-proza-message/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-proza-message/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-proza-message.html|Demo}
 *
 */
export class VlProzaMessagePreloader extends VlElement(HTMLElement) {
    static get _observedAttributes() {
        return ['data-vl-domain'];
    }

    constructor() {
        super();
        this._preload();
    }

    _data_vl_domainChangedCallback() {
        this._preload();
    }

    get _domain() {
        return this.dataset.vlDomain;
    }

    _preload() {
        if (this._domain) {
            VlProzaMessagePreloader._preload(this._domain);
        }
    }

    static _preload(domain) {
        if (!VlProzaMessagePreloader.isPreloaded(domain)) {
            VlProzaMessagePreloader.__setPreloadedMessagesCacheForDomain(domain, ProzaRestClient.getMessages(domain));
        }
    }

    /**
     * Geeft een Proza bericht terug.
     *
     * @param domain - Het Proza domein waarin het Proza bericht zit.
     * @param code - De code die het Proza bericht identificeert.
     * @returns {Promise<string>} Resolved naar het Proza bericht indien teruggevonden en anders wordt de Promise rejected.
     */
    static getMessage(domain, code) {
        return VlProzaMessagePreloader._getMessages(domain).then(messages => {
            const message = messages[code];
            if (message) {
                return message;
            } else {
                throw Error(`Bericht voor {domein: ${domain}, code: ${code}} niet gevonden`);
            }
        });
    }

    /**
     * Geeft terug of het Proza domein al reeds preloaded werd.
     *
     * @param domain - Het Proza domein.
     * @returns {boolean}
     */
    static isPreloaded(domain) {
        return !!VlProzaMessagePreloader.__getPreloadedMessagesCacheForDomain(domain);
    }

    static _getMessages(domain) {
        if (VlProzaMessagePreloader.isPreloaded(domain)) {
            return VlProzaMessagePreloader.__getPreloadedMessagesCacheForDomain(domain);
        } else {
            return Promise.reject(new Error(`Berichten voor domein ${domain} zijn niet preloaded`));
        }
    }

    static get __domainCache() {
        if (!VlProzaMessagePreloader.__cache) {
            VlProzaMessagePreloader.__cache = {};
        }
        return VlProzaMessagePreloader.__cache;
    }

    static __getCacheForDomain(domain) {
        const cache = VlProzaMessagePreloader.__domainCache;
        if (!cache[domain]) {
            cache[domain] = {};
        }
        return cache[domain];
    }

    static __getPreloadedMessagesCacheForDomain(domain) {
        return VlProzaMessagePreloader.__getCacheForDomain(domain).messages;
    }

    static __setPreloadedMessagesCacheForDomain(domain, messages) {
        VlProzaMessagePreloader.__getCacheForDomain(domain).messages = messages;
    }
}

class ProzaRestClient {
    static getMessage(domain, code) {
        return ProzaRestClient.__fetchJson(`proza/domein/${domain}/${code}`)
            .then(message => message.tekst)
            .catch(error => {
                console.error(`Er is iets fout gelopen bij het ophalen van het Proza bericht voor {domein: ${domain}, code: ${code}}`, error);
                return Promise.reject(error);
            });
    }

    static getMessages(domain) {
        return ProzaRestClient.__fetchJson(`proza/domein/${domain}`)
            .then(messages => Object.assign({}, ...(messages.map(message => ({ [message.code]: message.tekst })))))
            .catch(error => {
                console.error(`Er is iets fout gelopen bij het ophalen van de Proza berichten voor domein ${domain}`, error);
                return Promise.reject(error);
            });
    }

    static getToegelatenOperaties(domain) {
        return ProzaRestClient.__fetchJson(`proza/domein/${domain}/toegelatenoperaties`).catch(error => {
            console.error(`Er is iets fout gelopen bij het ophalen van de toegelaten Proza operaties voor domein ${domain}`, error);
            return Promise.reject(error);
        });
    }

    static __fetchJson(url) {
        return fetch(url).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw Error(`Response geeft aan dat er een fout is: ${response.statusText}`);
            }
        });
    }
}

define('vl-proza-message-preloader', VlProzaMessagePreloader);
define('vl-proza-message', VlProzaMessage);