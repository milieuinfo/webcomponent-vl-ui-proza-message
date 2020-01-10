const { VlElement } = require('vl-ui-core');
const { By, until, Key } = require('selenium-webdriver');
const { assert } = require('vl-ui-core').Test;

class VlProzaMessage extends VlElement {

    async _getWysiwyg() {
        return this.findElement(By.css('#wysiwyg'));
    }

    async clickOnPencil() {
        const pencilButton = await this.shadowRoot.findElement(By.css('#edit-button'));
        return pencilButton.click();
    }

    async isEditable() {
        const wysiwyg = await this._getWysiwyg();
        const contentEditable = await wysiwyg.getAttribute('contenteditable');
        return contentEditable == 'true';
    }

}

module.exports = VlProzaMessage;
