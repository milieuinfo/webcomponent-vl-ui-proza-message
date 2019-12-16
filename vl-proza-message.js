import{VlElement,define}from"/node_modules/vl-ui-core/vl-core.js";export class VlProzaMessage extends VlElement(HTMLElement){constructor(){super(`
            <span>Dit is een proza tekst</span>
        `)}};define("vl-proza-message",VlProzaMessage);