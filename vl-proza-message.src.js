import { VlElement, define } from '/node_modules/vl-ui-core/vl-core.js';

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
    constructor() {
        super(`
            <span>Dit is een proza tekst</span>
        `);
    }
}

define('vl-proza-message', VlProzaMessage);
