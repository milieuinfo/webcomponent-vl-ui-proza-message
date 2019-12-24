import {VlElement, define} from '/node_modules/vl-ui-core/vl-core.js';
import '/node_modules/vl-ui-button/vl-button.js';
import '/node_modules/vl-ui-icon/vl-icon.js';

/**
 * VlProzaMessage
 * @class
 * @classdesc
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

    _getEditButtonTemplate() {
        return this._template(`
            <button is="vl-button-link" type="button">
                <span is="vl-icon" icon="edit"></span>
            </button>
        `);
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

    _loadMessage() {
        if (this._domain && this._code) {
            VlProzaMessage._getMessage(this._domain, this._code).then(message => this._contentElement.innerHTML = message);
        } else {
            this._contentElement.innerHTML = null;
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
            .then(messages => Object.assign({}, ...(messages.map(message => ({[message.code]: message.tekst})))))
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
