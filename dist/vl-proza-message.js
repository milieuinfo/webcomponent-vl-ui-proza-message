import {vlElement, define, awaitUntil} from '/node_modules/vl-ui-core/dist/vl-core.js';
import {VlTypography} from '/node_modules/vl-ui-typography/dist/vl-typography.js';
import '/node_modules/vl-ui-button/dist/vl-button.js';
import '/node_modules/vl-ui-icon/dist/vl-icon.js';
import '/node_modules/vl-ui-toaster/dist/vl-toaster.js';
import '/node_modules/vl-ui-alert/dist/vl-alert.js';
import '/node_modules/tinymce/tinymce.min.js';

/**
 * VlProzaMessage
 * @class
 * @classdesc De vl-proza-message webcomponent kan gebruikt worden om teksten te laten beheren door de business. De edit modus wordt geactiveerd door op het potlood icoon te klikken. De edit modus kan gedactiveerd worden door op enter te duwen of een focus te geven aan een ander element op de pagina. Wanneer de gebruiker op escape klikt zal de edit modus afgesloten worden en zullen de wijzigingen ongedaan gemaakt worden.
 *
 * @extends HTMLElement
 * @mixes vlElement
 *
 * @property {string} data-vl-domain - Het Proza domein waarin het Proza bericht zit.
 * @property {string} data-vl-code - De code die het Proza bericht identificeert.
 * @property {string} data-vl-block - Attribuut om aan te duiden dat de inhoud van het Proza bericht een block element is.
 * @property {string} data-vl-parameters - De key/value parameters die verwerkt en getoond zullen worden in het content element.
 *
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-proza-message/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-proza-message/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-proza-message.html|Demo}
 *
 */
export class VlProzaMessage extends vlElement(HTMLElement) {
  static get _observedAttributes() {
    return ['domain', 'code', 'block', 'parameters'];
  }

  constructor() {
    super();
    this.shadow(`
      <style>
        @import '/node_modules/vl-ui-proza-message/dist/style.css';
        @import '/node_modules/vl-ui-button/dist/style.css';
        @import '/node_modules/vl-ui-icon/dist/style.css';
      </style>
      <div>
        <slot></slot>
      </div>
    `);
    this._toaster = this.__initProzaMessageToaster();
  }

  __initProzaMessageToaster() {
    const toaster = this.__addToasterElement();
    this.__addToasterStyle();
    return toaster;
  }

  __addToasterElement() {
    const id = 'vl-proza-message-toaster';
    if (!document.getElementById(id)) {
      document.body.appendChild(this._template(`<div is='vl-toaster' data-vl-top-right id=${id}></div>`));
    }
    return document.getElementById(id);
  }

  __addToasterStyle() {
    const id = 'vl-proza-message-toaster-style';
    if (!document.getElementById(id)) {
      document.head.appendChild(this._template(`
        <style id=${id}>
          @import '/node_modules/vl-ui-toaster/dist/style.css';
        </style>
    `));
    }
    return document.getElementById(id);
  }

  connectedCallback() {
    if (!this.__initialized) {
      this.appendChild(this.__createWysiwygElement());
      this.__processToegelatenOperaties();
      this.__initialized = true;
    }
  }

  disconnectedCallback() {
    this.__destroyWysiwyg();
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
      <button id="edit-button" is="vl-button-link" type="button">
        <span is="vl-icon" data-vl-icon="edit"></span>
      </button>
    `);
    button.firstElementChild.addEventListener('click', (event) => this.__initWysiwyg(event));
    return button;
  }

  _domainChangedCallback() {
    this._loadMessage();
  }

  _codeChangedCallback() {
    this._loadMessage();
  }

  _blockChangedCallback(oldValue, newValue) {
    const blockClass = 'vl-proza-message__block';
    if (newValue != undefined) {
      this.classList.add(blockClass);
    } else {
      this.classList.remove(blockClass);
    }
  }

  _parametersChangedCallback(oldValue, newValue) {
    if (this._typographyElement && this.dataset.vlParameters) {
      this._typographyElement.dataset.vlParameters = this.dataset.vlParameters;
    }
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
      content_css: '/node_modules/vl-ui-proza-message/dist/style.css',
      verify_html: false,
      forced_root_block: '',
    };
  }

  get _activeWysiwygEditor() {
    return tinyMCE.activeEditor;
  }

  _loadMessage() {
    awaitUntil(() => this._wysiwygElement).then(() => {
      if (this._domain && this._code) {
        VlProzaMessage.getMessage(this._domain, this._code).then((message) => {
          this._wysiwygElement.innerHTML = message;
          this.__wrapWysiwygElement();
          if (this.__containsBlockElement(message)) {
            this.setAttribute('data-vl-block', '');
          }
        });
      } else {
        this._wysiwygElement.innerHTML = null;
      }
    });
  }

  /**
   * Geeft een Proza bericht terug.
   *
   * @param {string} domain Het Proza domein waarin het Proza bericht zit.
   * @param {string} code De code die het Proza bericht identificeert.
   * @param {object} [parameters] Eventuele parameters die gebruikt kunnen worden om placeholders in het Proza bericht te vervangen.
   * @return {Promise<string>} Resolved naar het Proza bericht indien teruggevonden en anders wordt de Promise rejected.
   */
  static async getMessage(domain, code, parameters) {
    const message = await VlProzaMessage.__getRawMessage(domain, code);

    if (parameters) {
      return VlTypography.replaceTemplateParameters(message, parameters);
    } else {
      return message;
    }
  }

  static async __getRawMessage(domain, code) {
    const messageCache = VlProzaMessage.__getMessageCacheForDomain(domain);

    if (messageCache[code]) {
      return await messageCache[code];
    } else {
      try {
        return await VlProzaMessage.__getMessageFromPreloaderCache(domain, code);
      } catch {
        return await VlProzaMessage.__getSingleMessage(domain, code);
      }
    }
  }

  static __getMessageFromPreloaderCache(domain, code) {
    return VlProzaMessagePreloader.getMessage(domain, code).catch((error) => {
      if (VlProzaMessagePreloader.isPreloaded(domain)) {
        console.warn(`Bericht voor {domein: ${domain}, code: ${code}} kon niet opgevraagd worden uit de preload cache`, error);
      }
      throw error;
    });
  }

  static __getSingleMessage(domain, code) {
    const messageCache = VlProzaMessage.__getMessageCacheForDomain(domain);
    if (!messageCache[code]) {
      VlProzaMessage._putInCache(domain, code, ProzaRestClient.getMessage(domain, code));
    }
    return messageCache[code];
  }

  static _putInCache(domain, code, messagePromise) {
    VlProzaMessage.__getMessageCacheForDomain(domain)[code] = messagePromise;
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
      this.__setupUpdatableMessage();
    }
  }

  __setupUpdatableMessage() {
    this._element.classList.add('vl-proza-message--updatable');
    this._element.appendChild(this._getEditButtonTemplate());
  }

  __initWysiwyg(event) {
    event.stopPropagation();
    event.preventDefault();
    this.__unwrapWysiwygElement();
    tinyMCE.baseURL = '/node_modules/tinymce';
    this.__hideWysiwygButton();
    tinyMCE.init(this._wysiwygConfig);
    this._activeWysiwygEditor.on('init', () => {
      this.__focusWysiwyg();
      this.__configureWysiwygStyle();
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
      this.__cancel();
    }
    if (this.__isEnterKey(e) && !this.__isShiftKey(e)) {
      this.__undoWysiwygChange(); // enter verwijderen
      this.__save();
    }
  }

  __processBlurEvent() {
    this.__save();
  }

  __save() {
    ProzaRestClient.saveMessage(this._domain, this._code, this._activeWysiwygEditor.getContent()).then((message) => {
      VlProzaMessage._putInCache(this._domain, this._code, Promise.resolve(message));
      this.__stopWysiwyg();
    }).catch((error) => {
      this.__showErrorAlert();
      this.__cancel();
    });
  }

  __showErrorAlert() {
    const alert = this.__getProzaSaveErrorAlertTemplate().cloneNode(true);
    this._toaster.push(alert.firstElementChild);
  }

  __getProzaSaveErrorAlertTemplate() {
    return this._template(`
      <vl-alert data-vl-type="error" data-vl-icon="warning" data-vl-title="Technische storing" data-vl-closable>
        <p>Uw wijziging kon niet bewaard worden. Probeer het later opnieuw of neem contact op met de helpdesk als het probleem zich blijft voordoen.</p>
      </vl-alert>
    `);
  }

  __cancel() {
    this.__undoAllWysiwygChanges();
    this.__stopWysiwyg();
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
    if (editor && editor.undoManager.hasUndo()) {
      editor.undoManager.undo();
    }
  }

  __undoAllWysiwygChanges() {
    const editor = this._activeWysiwygEditor;
    while (editor && editor.undoManager.hasUndo()) {
      editor.undoManager.undo();
    }
  }

  __stopWysiwyg() {
    this.__destroyWysiwyg();
    this.__showWysiwygButton();
    this.__wrapWysiwygElement();
  }

  __destroyWysiwyg() {
    const editor = this._activeWysiwygEditor;
    if (editor) {
      editor.destroy();
    }
  }

  __hideWysiwygButton() {
    this._buttonElement.hidden = true;
  }

  __showWysiwygButton() {
    this._buttonElement.hidden = false;
  }

  __createWysiwygElement() {
    const div = document.createElement('div');
    div.id = 'wysiwyg';
    div.style = 'display: inline;';
    return div;
  }

  __wrapWysiwygElement() {
    if (!this._typographyElement) {
      const typography = document.createElement('vl-typography');
      typography.appendChild(this._wysiwygElement);
      if (this.dataset.vlParameters) {
        typography.dataset.vlParameters = this.dataset.vlParameters;
      }
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

  __containsBlockElement() {
    return [...this._wysiwygElement.children].some((element) => {
      return ['block', 'inline-block', 'flex', 'grid', 'table'].includes(window.getComputedStyle(element)['display']);
    });
  }
}

/**
 * VlProzaMessagePreloader
 * @class
 * @classdesc Proza preloader dient om proza codes op voorhand op te halen zodat deze sneller getoond kunnen worden aan de gebruiker.
 *
 * @extends HTMLElement
 * @mixes vlElement
 *
 * @property {string} data-vl-domain - Het Proza domein waarin de Proza berichten zitten.
 *
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-proza-message/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-proza-message/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-proza-message.html|Demo}
 *
 */
export class VlProzaMessagePreloader extends vlElement(HTMLElement) {
  static get _observedAttributes() {
    return ['domain'];
  }

  constructor() {
    super();
    this._preload();
  }

  _domainChangedCallback() {
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
    * @param {String} domain - Het Proza domein waarin het Proza bericht zit.
    * @param {String} code - De code die het Proza bericht identificeert.
    * @return {Promise<string>} Resolved naar het Proza bericht indien teruggevonden en anders wordt de Promise rejected.
    */
  static getMessage(domain, code) {
    return VlProzaMessagePreloader._getMessages(domain).then((messages) => {
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
    * @param {String} domain - Het Proza domein.
    * @return {boolean}
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

export class ProzaRestClient {
  static saveMessage(domain, code, text) {
    return fetch(`proza/domein/${domain}/${code}`, {
      method: 'PUT',
      body: text,
    })
        .then((response) => ProzaRestClient.__handleError(response))
        .then((message) => message.tekst)
        .catch((error) => {
          console.error(`Er is iets fout gelopen bij het bewaren van het Proza bericht voor {domein: ${domain}, code: ${code}}`, error);
          return Promise.reject(error);
        });
  }

  static getMessage(domain, code) {
    return ProzaRestClient.__fetchJson(`proza/domein/${domain}/${code}`)
        .then((message) => message.tekst)
        .catch((error) => {
          console.error(`Er is iets fout gelopen bij het ophalen van het Proza bericht voor {domein: ${domain}, code: ${code}}`, error);
          return Promise.reject(error);
        });
  }

  static getMessages(domain) {
    return ProzaRestClient.__fetchJson(`proza/domein/${domain}`)
        .then((messages) => Object.assign({}, ...(messages.map((message) => ({[message.code]: message.tekst})))))
        .catch((error) => {
          console.error(`Er is iets fout gelopen bij het ophalen van de Proza berichten voor domein ${domain}`, error);
          return Promise.reject(error);
        });
  }

  static getToegelatenOperaties(domain) {
    return ProzaRestClient.__fetchJson(`proza/domein/${domain}/toegelatenoperaties`).catch((error) => {
      console.error(`Er is iets fout gelopen bij het ophalen van de toegelaten Proza operaties voor domein ${domain}`, error);
      return Promise.reject(error);
    });
  }

  static __fetchJson(url) {
    return fetch(url).then(ProzaRestClient.__handleError);
  }

  static __handleError(response) {
    if (response.ok) {
      return response.json();
    } else {
      throw Error(`Response geeft aan dat er een fout is: ${response.statusText}`);
    }
  }
}

define('vl-proza-message-preloader', VlProzaMessagePreloader);
define('vl-proza-message', VlProzaMessage);
