const { VlElement } = require('vl-ui-core');
const { By, until, Key, Actions } = require('selenium-webdriver');
const { assert } = require('vl-ui-core').Test;

class VlProzaMessage extends VlElement {

    async _getWysiwyg() {
        return this.findElement(By.css('#wysiwyg'));
    }

    async _waitUntilEditable() {
        return this.driver.wait(async () => {
            return this.isEditable();
        }, 5000);
    }

    async getText() {
        const wysiwyg = await this._getWysiwyg();
        return this.driver.executeScript('return arguments[0].innerText', wysiwyg);
    }

    async shiftEnter() {
        const wysiwyg = await this._getWysiwyg();
        const shiftEnter = Key.chord(Key.SHIFT, Key.ENTER);
        return wysiwyg.sendKeys(shiftEnter);
    }

    async clear() {
        const wysiwyg = await this._getWysiwyg();
        return this.driver.executeScript('return arguments[0].innerText = ""', wysiwyg);
    }
 
    async exitEditMode() {
        const wysiwyg = await this._getWysiwyg();
        return wysiwyg.sendKeys(Key.ESCAPE);
    }

    async confirm() {
        const wysiwyg = await this._getWysiwyg();
        return wysiwyg.sendKeys(Key.ENTER);
    }

    async clickOnPencil() {
        const pencilButton = await this.shadowRoot.findElement(By.css('#edit-button'));
        await pencilButton.click();
        return this._waitUntilEditable();
    }

    async type(text) {
        let input = await this._getWysiwyg();
        await this.clear();
        return input.sendKeys(text);
    }
    
    async append(text) {
        let input = await this._getWysiwyg();
        return input.sendKeys(text);
    }

    async typeAndConfirm(text) {
        await this.type(text);
        return this.confirm();
    }

    async isEditable() {
        const wysiwyg = await this._getWysiwyg();
        const contentEditable = await wysiwyg.getAttribute('contenteditable');
        return contentEditable == 'true';
    }
}

module.exports = VlProzaMessage;
