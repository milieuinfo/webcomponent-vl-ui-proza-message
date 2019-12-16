const VlProzaMessage = require('../components/vl-proza-message');
const { Page, Config } = require('vl-ui-core');

class VlProzaMessagePage extends Page {
    
    async load() {
        await super.load(Config.baseUrl + '/demo/vl-proza-message.html');
    }
}

module.exports = VlProzaMessagePage;
