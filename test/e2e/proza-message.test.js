
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
        await message.clear();
        await message.type('decibel')
        await message.exitEditMode();
        const text = await message.getText();
        assert.equal(text, 'foobar');
    });

    it('als de gebruiker op de enter-toets drukt, worden de wijzigingen bewaard', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await message.clickOnPencil();
        await message.clear();
        await message.typeAndConfirm('decibel');
        const text = await message.getText();
        assert.equal(text, 'decibel');
        await message.clickOnPencil();
        await message.clear();
        await message.typeAndConfirm('foobar');
    });

    it('als de gebruiker enter+shift invoert, dan word er een line-break toegevoegd', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await message.clickOnPencil();
        await message.clear();
        await message.type('line');
        await message.shiftEnter();
        await message.append('break');
        await message.confirm();
        const text = await message.getText();
        assert.isTrue(text.indexOf('\n') > 0);
    });

    it('als de gebruiker tekst selecteert, verschijnt de WYSIWYG', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await message.clickOnPencil();
        
    })


});
