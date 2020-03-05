const { VlElement } = require('vl-ui-core').Test;
const { By, Key } = require('selenium-webdriver');

class VlProzaMessage extends VlElement {
    async _getEditButton() {
        return this.shadowRoot.findElement(By.css('#edit-button'));
    }

    async _getWysiwyg() {
        return this.findElement(By.css('#wysiwyg'));
    }

    async _waitUntilEditable() {
        return this.driver.wait(async () => {
            return this.isEditable();
        });
    }

    async getText() {
        return (await this._getWysiwyg()).getAttribute('innerText');
    }

    async hasBoldStyle() {
        return this._hasStyleElement('strong');
    }

    async hasItalicStyle() {
        return this._hasStyleElement('em');
    }

    async hasUnderlineStyle() {
        return this._hasStyleElement('span[style="text-decoration: underline;"]');
    }

    async _hasStyleElement(selector) {
        const wysiwyg = await this._getWysiwyg();
        return wysiwyg.findElement(By.css(selector)).then(() => true).catch(() => false);
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

    async cancel() {
        const wysiwyg = await this._getWysiwyg();
        return wysiwyg.sendKeys(Key.ESCAPE);
    }

    async confirm() {
        const wysiwyg = await this._getWysiwyg();
        return wysiwyg.sendKeys(Key.ENTER);
    }

    async edit() {
        const pencilButton = await this._getEditButton();
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

    async isEditable() {
        const wysiwyg = await this._getWysiwyg();
        return wysiwyg.hasAttribute('contenteditable');
    }

    async selectAllText() {
        const input = await this._getWysiwyg();
        const actions = this.driver.actions({bridge: true});
        return await actions.doubleClick(input).perform();
    }

    async isWysiwygPresent() {
        return (await this.driver.findElement(By.css('.tox-pop'))).isDisplayed();
    }

    async blur() {
        return (await this.driver.findElement(By.css('#title'))).click();
    }
}

module.exports = VlProzaMessage;
