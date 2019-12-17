import { VlElement, define } from '/node_modules/vl-ui-core/vl-core.js';
import '/node_modules/vl-ui-button/vl-button.js';
import '/node_modules/vl-ui-icon/vl-icon.js';

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
        super(`
            <style>
                @import '/node_modules/vl-ui-button/style.css';
                @import '/node_modules/vl-ui-icon/style.css';
                
                :host > div {
                    display: inline;
                }
            </style>
            <div>
                <span id="content"></span>
            </div>
        `);
    }

    connectedCallback() {
        this.__processToegelatenOperaties();
    }

    get _contentElement() {
        return this._element.querySelector('#content');
    }

    get _shouldPreload() {
        return this.dataset.vlPreload != undefined;
    }

    _getEditButtonTemplate() {
        return this._template(`
            <button is="vl-button-link" type="button">
                <span is="vl-icon" icon="edit"></span>
            </button>
        `);
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
            this._getMessage(this._domain, this._code).then(message => this._contentElement.innerHTML = message);
        } else {
            this._contentElement.innerHTML = null;
        }
    }

    _getMessage(domain, code) {
        if (this._shouldPreload) {
            return VlProzaMessage._getPreloadedMessage(domain, code);
        } else {
            return VlProzaMessage._getMessage(domain, code);
        }
    }

    static _getMessage(domain, code) {
        const messageCache = VlProzaMessage.__getMessageCacheForDomain(domain);
        if (!messageCache[code]) {
            messageCache[code] = VlProzaMessage.__fetchMessage(domain, code).then(message => message.tekst);
        }
        return messageCache[code];
    }

    static _getPreloadedMessage(domain, code) {
        return VlProzaMessage._getMessages(domain).then(messages => {
            const message = messages[code];
            if (message) {
                return message;
            } else {
                throw Error(`Bericht voor {domein: ${domain}, code: ${code}} niet gevonden`);
            }
        });
    }

    static _getMessages(domain) {
        let messageCache = VlProzaMessage.__getPreloadedMessagesCacheForDomain(domain);
        if (!messageCache) {
            messageCache = VlProzaMessage.__fetchMessages(domain).then(messages => {
                return Object.assign({}, ...(messages.map(message => ({ [message.code]: message.tekst }) )));
            });
            VlProzaMessage.__setPreloadedMessagesCacheForDomain(domain, messageCache);
        }
        return messageCache;
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
        return VlProzaMessage.__fetchJson(`proza/domein/${domain}/${code}`).catch(error => {
            console.error(`Er is iets fout gelopen bij het ophalen van het Proza bericht voor {domein: ${domain}, code: ${code}}`, error);
            return Promise.reject(error);
        });
    }

    static __fetchMessages(domain) {
        return VlProzaMessage.__fetchJson(`proza/domein/${domain}`).catch(error => {
            console.error(`Er is iets fout gelopen bij het ophalen van de Proza berichten voor domein ${domain}`, error);
            return Promise.reject(error);
        });
    }

    static __fetchToegelatenOperaties(domain) {
        return VlProzaMessage.__fetchJson(`proza/domein/${domain}/toegelatenoperaties`).catch(error => {
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

    static __getPreloadedMessagesCacheForDomain(domain) {
        return VlProzaMessage.__getCacheForDomain(domain).preloadedMessages;
    }

    static __setPreloadedMessagesCacheForDomain(domain, messages) {
        VlProzaMessage.__getCacheForDomain(domain).preloadedMessages = messages;
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
}

define('vl-proza-message', VlProzaMessage);
