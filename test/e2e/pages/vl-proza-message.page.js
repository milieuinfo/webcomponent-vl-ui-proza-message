const VlProzaMessage = require('../components/vl-proza-message');
const { Page, Config } = require('vl-ui-core');

class VlProzaMessagePage extends Page {
    async _getProzaMessage(selector) {
        return new VlProzaMessage(this.driver, selector);
    }

    async load() {
        await super.load(Config.baseUrl + '/demo/vl-proza-message.html');
    }
}

module.exports = VlProzaMessagePage;
