
const { assert, driver } = require('vl-ui-core').Test;
const VlProzaMessagePage = require('./pages/vl-proza-message.page');
const { Key } = require('selenium-webdriver');

describe('vl-proza-message', async () => {
    const vlProzaMessagePage = new VlProzaMessagePage(driver);

    before(() => {
        return vlProzaMessagePage.load();
    });

    it('de tekst word aanpasbaar als ik op het potlood klik', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await message.clickOnPencil();
        await assert.eventually.isTrue(message.isEditable());
    });


});
