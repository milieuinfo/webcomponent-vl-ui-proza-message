import{VlElement,define}from"/node_modules/vl-ui-core/vl-core.js";import"/node_modules/vl-ui-button/vl-button.js";import"/node_modules/vl-ui-icon/vl-icon.js";import"/node_modules/vl-ui-typography/vl-typography.js";import"/node_modules/vl-ui-toaster/vl-toaster.js";import"/node_modules/vl-ui-alert/vl-alert.js";import"/node_modules/tinymce/tinymce.min.js";export class VlProzaMessage extends(VlElement(HTMLElement)){static get _observedAttributes(){return["data-vl-domain","data-vl-code","data-vl-block"]}constructor(){super(),this.appendChild(this.__createWysiwygElement()),this.shadow("\n            <style>\n                @import '/node_modules/vl-ui-proza-message/style.css';\n                @import '/node_modules/vl-ui-button/style.css';\n                @import '/node_modules/vl-ui-icon/style.css';\n            </style>\n            <div>\n                <slot></slot>\n            </div>\n        "),this._toaster=this.__initProzaMessageToaster()}__initProzaMessageToaster(){const e="vl-proza-message-toaster";if(null==document.getElementById(e)){const t=document.createElement("div",{is:"vl-toaster"});t.setAttribute("top-right",""),t.id=e,document.body.appendChild(t)}return document.getElementById(e)}connectedCallback(){this.__processToegelatenOperaties()}get _wysiwygElement(){return this.querySelector("#wysiwyg")}get _buttonElement(){return this._shadow.querySelector("button")}get _typographyElement(){return this.querySelector("vl-typography")}_getEditButtonTemplate(){const e=this._template('\n            <button is="vl-button-link" type="button">\n                <span is="vl-icon" icon="edit"></span>\n            </button>\n        ');return e.firstElementChild.addEventListener("click",e=>this.__initWysiwyg(e)),e}_data_vl_domainChangedCallback(){this._loadMessage()}_data_vl_codeChangedCallback(){this._loadMessage()}_data_vl_blockChangedCallback(e,t){null!=t?this.classList.add("vl-proza-message__block"):this.classList.remove("vl-proza-message__block")}get _domain(){return this.dataset.vlDomain}get _code(){return this.dataset.vlCode}get _wysiwygConfig(){return{target:this._wysiwygElement,menubar:!1,inline:!0,toolbar:!1,plugins:["quickbars"],quickbars_selection_toolbar:"bold italic underline",powerpaste_word_import:"clean",powerpaste_html_import:"clean",content_css:"/style.css",verify_html:!1,forced_root_block:"",suffix:".min"}}get _activeWysiwygEditor(){return tinyMCE.activeEditor}_loadMessage(){this._domain&&this._code?VlProzaMessage._getMessage(this._domain,this._code).then(e=>{this._wysiwygElement.innerHTML=e,this.__wrapWysiwygElement(),this.__containsBlockElement(e)&&this.setAttribute("data-vl-block","")}):this._wysiwygElement.innerHTML=null}static _getMessage(e,t){const s=VlProzaMessage.__getMessageCacheForDomain(e);return s[t]?s[t]:VlProzaMessage.__getMessageFromPreloaderCache(e,t).catch(()=>VlProzaMessage.__getSingleMessage(e,t))}static __getMessageFromPreloaderCache(e,t){return VlProzaMessagePreloader.getMessage(e,t).catch(s=>{throw VlProzaMessagePreloader.isPreloaded(e)&&console.warn(`Bericht voor {domein: ${e}, code: ${t}} kon niet opgevraagd worden uit de preload cache`,s),s})}static __getSingleMessage(e,t){const s=VlProzaMessage.__getMessageCacheForDomain(e);return s[t]||VlProzaMessage._putInCache(e,t,ProzaRestClient.getMessage(e,t)),s[t]}static _putInCache(e,t,s){VlProzaMessage.__getMessageCacheForDomain(e)[t]=s}static _getToegelatenOperaties(e){let t=VlProzaMessage.__getToegelatenOperatiesCacheForDomain(e);return t||(t=ProzaRestClient.getToegelatenOperaties(e),VlProzaMessage.__setToegelatenOperatiesCacheForDomain(e,t)),t}static get __domainCache(){return VlProzaMessage.__cache||(VlProzaMessage.__cache={}),VlProzaMessage.__cache}static __getCacheForDomain(e){const t=VlProzaMessage.__domainCache;return t[e]||(t[e]={}),t[e]}static __getToegelatenOperatiesCacheForDomain(e){return VlProzaMessage.__getCacheForDomain(e).toegelatenOperaties}static __setToegelatenOperatiesCacheForDomain(e,t){VlProzaMessage.__getCacheForDomain(e).toegelatenOperaties=t}static __getMessageCacheForDomain(e){const t=VlProzaMessage.__getCacheForDomain(e);return t.messages||(t.messages={}),t.messages}async __processToegelatenOperaties(){(await VlProzaMessage._getToegelatenOperaties(this._domain)).update&&this._element.appendChild(this._getEditButtonTemplate())}__initWysiwyg(e){e.stopPropagation(),this.__unwrapWysiwygElement(),tinyMCE.baseURL="/node_modules/tinymce",tinyMCE.init(this._wysiwygConfig),this._activeWysiwygEditor.on("init",()=>{this.__focusWysiwyg(),this.__configureWysiwygStyle(),this.__hideWysiwygButton(),this.__bindWysiwygEvents()})}__focusWysiwyg(){const e=this._activeWysiwygEditor;e.focus(),e.selection.select(e.getBody(),!0),e.selection.collapse(!1)}__configureWysiwygStyle(){this._activeWysiwygEditor.bodyElement.classList.add("vl-typography")}__bindWysiwygEvents(){const e=this._activeWysiwygEditor;e.on("keydown",e=>this.__processKeydownEvent(e)),e.on("blur",e=>this.__processBlurEvent(e))}__processKeydownEvent(e){this.__isEscapeKey(e)&&this.__cancel(),this.__isEnterKey(e)&&!this.__isShiftKey(e)&&(this.__undoWysiwygChange(),this.__save())}__processBlurEvent(){this.__save()}__save(){ProzaRestClient.saveMessage(this._domain,this._code,this._activeWysiwygEditor.getContent()).then(e=>{VlProzaMessage._putInCache(this._domain,this._code,Promise.resolve(e)),this.__stopWysiwyg()}).catch(e=>{this.__showErrorAlert(),this.__cancel()})}__showErrorAlert(){const e=this.__getProzaSaveErrorAlertTemplate().cloneNode(!0);this._toaster.push(e.firstElementChild)}__getProzaSaveErrorAlertTemplate(){return this._template('\n\t\t\t<vl-alert type="error" icon="alert-triangle" title="Technische storing" closable>\n          \t\t<p>Uw wijziging kon niet bewaard worden. Probeer het later opnieuw of neem contact op met de helpdesk als het probleem zich blijft voordoen.</p>\n        \t</vl-alert>\n    \t')}__cancel(){this.__undoAllWysiwygChanges(),this.__stopWysiwyg()}__isEscapeKey(e){return 27===e.keyCode}__isEnterKey(e){return 13===e.keyCode}__isShiftKey(e){return e.shiftKey}__undoWysiwygChange(){const e=this._activeWysiwygEditor;e.undoManager.hasUndo()&&e.undoManager.undo()}__undoAllWysiwygChanges(){const e=this._activeWysiwygEditor;for(;e.undoManager.hasUndo();)e.undoManager.undo()}__stopWysiwyg(){this._activeWysiwygEditor.destroy(),this.__showWysiwygButton(),this.__wrapWysiwygElement()}__hideWysiwygButton(){this._buttonElement.hidden=!0}__showWysiwygButton(){this._buttonElement.hidden=!1}__createWysiwygElement(){const e=document.createElement("div");return e.id="wysiwyg",e.style="display: inline;",e}__wrapWysiwygElement(){if(!this._typographyElement){const e=document.createElement("vl-typography");e.appendChild(this._wysiwygElement),this.appendChild(e)}}__unwrapWysiwygElement(){if(this._typographyElement){const e=this._typographyElement,t=e.firstChild;this.appendChild(t),e.remove()}}__containsBlockElement(){return[...this._wysiwygElement.children].some(e=>["block","inline-block","flex","grid","table"].includes(window.getComputedStyle(e).display))}};export class VlProzaMessagePreloader extends(VlElement(HTMLElement)){static get _observedAttributes(){return["data-vl-domain"]}constructor(){super(),this._preload()}_data_vl_domainChangedCallback(){this._preload()}get _domain(){return this.dataset.vlDomain}_preload(){this._domain&&VlProzaMessagePreloader._preload(this._domain)}static _preload(e){VlProzaMessagePreloader.isPreloaded(e)||VlProzaMessagePreloader.__setPreloadedMessagesCacheForDomain(e,ProzaRestClient.getMessages(e))}static getMessage(e,t){return VlProzaMessagePreloader._getMessages(e).then(s=>{const o=s[t];if(o)return o;throw Error(`Bericht voor {domein: ${e}, code: ${t}} niet gevonden`)})}static isPreloaded(e){return!!VlProzaMessagePreloader.__getPreloadedMessagesCacheForDomain(e)}static _getMessages(e){return VlProzaMessagePreloader.isPreloaded(e)?VlProzaMessagePreloader.__getPreloadedMessagesCacheForDomain(e):Promise.reject(new Error(`Berichten voor domein ${e} zijn niet preloaded`))}static get __domainCache(){return VlProzaMessagePreloader.__cache||(VlProzaMessagePreloader.__cache={}),VlProzaMessagePreloader.__cache}static __getCacheForDomain(e){const t=VlProzaMessagePreloader.__domainCache;return t[e]||(t[e]={}),t[e]}static __getPreloadedMessagesCacheForDomain(e){return VlProzaMessagePreloader.__getCacheForDomain(e).messages}static __setPreloadedMessagesCacheForDomain(e,t){VlProzaMessagePreloader.__getCacheForDomain(e).messages=t}};class ProzaRestClient{static saveMessage(e,t,s){return fetch(`proza/domein/${e}/${t}`,{method:"PUT",body:s}).then(e=>ProzaRestClient.__handleError(e)).then(e=>e.tekst).catch(s=>(console.error(`Er is iets fout gelopen bij het bewaren van het Proza bericht voor {domein: ${e}, code: ${t}}`,s),Promise.reject(s)))}static getMessage(e,t){return ProzaRestClient.__fetchJson(`proza/domein/${e}/${t}`).then(e=>e.tekst).catch(s=>(console.error(`Er is iets fout gelopen bij het ophalen van het Proza bericht voor {domein: ${e}, code: ${t}}`,s),Promise.reject(s)))}static getMessages(e){return ProzaRestClient.__fetchJson(`proza/domein/${e}`).then(e=>Object.assign({},...e.map(e=>({[e.code]:e.tekst})))).catch(t=>(console.error(`Er is iets fout gelopen bij het ophalen van de Proza berichten voor domein ${e}`,t),Promise.reject(t)))}static getToegelatenOperaties(e){return ProzaRestClient.__fetchJson(`proza/domein/${e}/toegelatenoperaties`).catch(t=>(console.error(`Er is iets fout gelopen bij het ophalen van de toegelaten Proza operaties voor domein ${e}`,t),Promise.reject(t)))}static __fetchJson(e){return fetch(e).then(ProzaRestClient.__handleError)}static __handleError(e){if(e.ok)return e.json();throw Error(`Response geeft aan dat er een fout is: ${e.statusText}`)}}define("vl-proza-message-preloader",VlProzaMessagePreloader),define("vl-proza-message",VlProzaMessage);