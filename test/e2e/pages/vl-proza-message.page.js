const VlProzaMessage = require('../components/vl-proza-message');
const { Page, Config } = require('vl-ui-core');
const { By } = require('selenium-webdriver');

class VlProzaMessagePage extends Page {
    async _getProzaMessage(selector) {
        return new VlProzaMessage(this.driver, selector);
    }

    async getMessageFirstDemo() {
        return this._getProzaMessage('#message-1');
    }

    async load() {
        await super.load(Config.baseUrl + '/demo/vl-proza-message.html');
    }
}

module.exports = VlProzaMessagePage;
