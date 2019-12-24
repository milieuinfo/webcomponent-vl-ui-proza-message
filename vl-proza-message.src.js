import { VlElement, define, awaitScript } from '/node_modules/vl-ui-core/vl-core.js';
import '/node_modules/vl-ui-button/vl-button.js';
import '/node_modules/vl-ui-icon/vl-icon.js';
import '/node_modules/vl-ui-typography/vl-typography.js';

awaitScript('tinymce', '/node_modules/tinymce/tinymce.min.js').then(() => define('vl-proza-message', VlProzaMessage));

/**
 * VlProzaMessage
 * @class
 * @classdesc 
 * 
 * @extends VlElement
 * 
 * @property 
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

    get _contentElement() {
        return this._element.querySelector('slot').assignedElements()[0];
    }

    get _buttonElement() {
        return this._shadow.querySelector('button');
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

    _data_vl_domainChangedCallback(oldValue, newValue) {
        this._domain = newValue;
        this._loadMessage();
    }

    _data_vl_codeChangedCallback(oldValue, newValue) {
        this._code = newValue;
        this._loadMessage();
    }

    _loadMessage() {
        if (this._domain && this._code) {
            VlProzaMessage._getMessage(this._domain, this._code).then(message => {
                this._contentElement.innerHTML = message.tekst;
                this.__wrapWysiwygElement();
            });
        } else {
            this._contentElement.innerHTML = null;
        }
    }

    static _getMessage(domain, code) {
        const messageCache = VlProzaMessage.__getMessageCacheForDomain(domain);
        if (!messageCache[code]) {
            messageCache[code] = VlProzaMessage.__fetchMessage(domain, code);
        }
        return messageCache[code];
    }

    static _getToegelatenOperaties(domain) {
        let toegelatenOperatiesCache = VlProzaMessage.__getToegelatenOperatiesCacheForDomain(domain);
        if (!toegelatenOperatiesCache) {
            toegelatenOperatiesCache = VlProzaMessage.__fetchToegelatenOperaties(domain);
            VlProzaMessage.__setToegelatenOperatiesCacheForDomain(domain, toegelatenOperatiesCache);
        }
        return toegelatenOperatiesCache;
    }

    static __fetchMessage(domain, code) {
        return fetch("proza/domein/" + domain + "/" + code).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw Error('Ophalen van Proza bericht is mislukt: ' + response.statusText);
            }
        }).catch(error => {
            console.error('Er is iets fout gelopen bij het ophalen van de Proza berichten', error);
            return Promise.reject(error);
        });
    }

    static __fetchToegelatenOperaties(domain) {
        return fetch("proza/domein/" + domain + "/toegelatenoperaties").then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw Error('Ophalen toegelaten Proza operaties is mislukt: ' + response.statusText);
            }
        }).catch(error => {
            console.error('Er is iets fout gelopen bij het ophalen van de toegelaten Proza operaties', error);
            return Promise.reject(error);
        });
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

    static __getMessageCacheForDomain(domain) {
        const cache = VlProzaMessage.__getCacheForDomain(domain);
        if (!cache.messages) {
            cache.messages = {};
        }
        return cache.messages;
    }

    static __getToegelatenOperatiesCacheForDomain(domain) {
        return VlProzaMessage.__getCacheForDomain(domain).toegelatenOperaties;
    }

    static __setToegelatenOperatiesCacheForDomain(domain, toegelatenOperaties) {
        const cache = VlProzaMessage.__getCacheForDomain(domain);
        cache.toegelatenOperaties = toegelatenOperaties;
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
        const editor = tinyMCE.init({
            target: this._shadow.querySelector('slot').assignedElements()[0],
            menubar: false,
            inline: true,
            toolbar: false,
            plugins: ['quickbars'],
            quickbars_selection_toolbar: 'bold italic underline',
            powerpaste_word_import: 'clean',
            powerpaste_html_import: 'clean',
            content_css: '/style.css',
            verify_html: false,
            forced_root_block : ""
        });
        editor.then(([editor]) => {
            editor.focus();
            editor.selection.select(editor.getBody(), true);
            editor.selection.collapse(false);
            editor.bodyElement.classList.add('vl-typography');
            this._buttonElement.remove();
            editor.on('keydown', (e) => {
                if (e.keyCode === 27) {
                    while (editor.undoManager.hasUndo()) {
                        editor.undoManager.undo();
                    }
                    this.__stopWysiwyg(editor);
                }
                if (e.keyCode === 13 && !e.shiftKey) {
                    this.__stopWysiwyg(editor);
                }
            });
            editor.on('blur', () => {
                this.__stopWysiwyg(editor);
            });
        });
    }

    __stopWysiwyg(editor) {
        editor.destroy();
        this._element.appendChild(this._getEditButtonTemplate());
        this.__wrapWysiwygElement();
    }

    __createWysiwygElement() {
        const div = document.createElement('div');
        div.id = "wysiwyg";
        div.style = "display: inline;";
        return div;
    }

    __wrapWysiwygElement() {
        const typography = document.createElement('vl-typography');
        typography.appendChild(this._contentElement);
        this.appendChild(typography);
    }

    __unwrapWysiwygElement() {
        const typography = this.querySelector('vl-typography');
        const wysiwyg = typography.firstElementChild;
        this.appendChild(wysiwyg);
        typography.remove();
    }
}