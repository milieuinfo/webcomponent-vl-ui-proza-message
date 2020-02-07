import { VlElement, define } from 'vl-ui-core';

/**
 * VlTypography
 * @class
 * @classdesc Gebruik de typograhpy component om de standaard elementen te visualiseren binnen een container. De typography component wordt voornamelijk gebruikt om de stijl van de inhoud van een wysiwyg-editor correct te renderen.
 * 
 * @extends VlElement
 * 
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-typography/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-typography/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-typography.html|Demo}
 * 
 */
export class VlTypography extends VlElement(HTMLElement) {
    constructor() {
        super(`
            <style>
                @import '../style.css';
            </style>
            <div id="content" class="vl-typography"></div>
        `);
        this._observer = this.__observeSlotElements(() => this.__processSlotElements());
    }

    connectedCallback() {
        this.__processSlotElements();
    }

	disconnectedCallback() {
		this._observer.disconnect();
	}

    __processSlotElements() {
        this.__clearChildren();
        [... this.childNodes].forEach((element) => this._element.appendChild(element.cloneNode(true)));
    }

	__clearChildren() {
		while (this._element.hasChildNodes()) {
			this._element.firstChild.remove();
		}
	}

	__observeSlotElements(callback) {
        const observer = new MutationObserver(callback);
        observer.observe(this, { attributes: true, childList: true, characterData: true, subtree: true });
        return observer;
	}
}

define('vl-typography', VlTypography);

