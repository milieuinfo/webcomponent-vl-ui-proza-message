
const { assert, driver } = require('vl-ui-core').Test;
const VlProzaMessagePage = require('./pages/vl-proza-message.page');

describe('vl-proza-message', async () => {
    const vlProzaMessagePage = new VlProzaMessagePage(driver);

    before(() => {
        return vlProzaMessagePage.load();
    });

    it('de tekst word aanpasbaar als ik op het potlood klik', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await message.clickOnPencil();
        await assert.eventually.isTrue(message.isEditable());
        await message.exitEditMode();
    });

    it('als de gebruiker op de escape-toets drukt, worden de wijzigingen niet bewaard', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await message.clickOnPencil()
        await message.type('decibel')
        const text = await (await message._getWysiwyg()).getText();
        assert.equal(text, 'foobar');
    });


});
