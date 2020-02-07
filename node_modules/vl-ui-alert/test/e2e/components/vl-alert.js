const { VlElement } = require('vl-ui-core').Test;
const { By } = require('vl-ui-core').Test.Setup;

class VlAlert extends VlElement {  
    constructor(driver, selector) {
        super(driver, selector);
    }

    async _getAlert() {
        return this.shadowRoot;
    }

    async _exists(selector) {
        return (await this._getAlert()).findElement(By.css(selector)) != null;
    }

    async _innerText(selector) {
        const element = await (await this._getAlert()).findElement(By.css(selector));
        return this.driver.executeScript('return arguments[0].innerText', element);
    }

    async _alertHasClass(clazz) {
        const classes =  await (await this._getAlert()).getAttribute('class');
        return classes.indexOf(clazz) > 0;
    }

    async getCloseButton() {
        return (await this._getAlert()).findElement(By.css('#close'));
    }
    
    async isPresent() {
        return this.driver.findElements(By.css(this.selector)).size > 0
    }
    
    async getTitle() {
        return this._innerText('#title');
    }

    async getMessage() {
        return this._innerText('#message');
    }

    async getActions() {
        return this._innerText('#actions');
    }

    async hasIcon() {
        return this._exists('.vl-alert__icon');
    }

    async hasTitle() {
        return this._exists('#title');
    }

    async isClosable() {
        return this._exists('.vl-alert__close');
    }
    
    async isSuccess() {
        return this._exists('[icon="check"]');
    }

    async isWarning() {
        return this._exists('[icon="alert-triangle"]');
    }

    async isError() {
        return this._exists('[icon="warning"]');
    }
    
    async isCta() {
        return this._exists('[icon="info"]');
    }

    async isSmall() {
        return this._alertHasClass('vl-alert--small');
    }
    
    async isLarge() {
        return this._alertHasClass('vl-alert--large');
    }

    async close() {
        const button = await this.getCloseButton();
        return button.click();
    }
}

module.exports = VlAlert
