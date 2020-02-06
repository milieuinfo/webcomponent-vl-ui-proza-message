
const { assert, driver } = require('vl-ui-core').Test.Setup;
const VlProzaMessagePage = require('./pages/vl-proza-message.page');

describe('vl-proza-message', async () => {
    const vlProzaMessagePage = new VlProzaMessagePage(driver);

    before(() => {
        return vlProzaMessagePage.load();
    });

    it('als gebruiker kan ik een tekst wijzigen door op het potlood te klikken', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await message.edit();
        await assert.eventually.isTrue(message.isEditable());
        await message.cancel();
    });

    it('als gebruiker kan ik op de escape-toets drukken om mijn wijzigingen te annuleren', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await assert.eventually.equal(message.getText(), 'foobar');
        await message.edit()
        await message.clear();
        await message.type('decibel')
        await message.cancel();
        await assert.eventually.equal(message.getText(), 'foobar');
    });

    it('als de gebruiker kan ik op de enter-toets drukken om mijn wijzigingen te bewaren', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await message.edit();
        await message.clear();
        await message.type('decibel');
        await message.confirm();
        await assert.eventually.equal(message.getText(), 'decibel');
        await message.edit();
        await message.clear();
        await message.type('foobar');
        await message.confirm();
    });

    it('als gebruiker kan ik enter+shift invoeren om een line-break toe te voegen', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await message.edit();
        await message.clear();
        await message.type('line');
        await message.shiftEnter();
        await message.append('break');
        await message.confirm();
        const text = await message.getText();
        assert.isTrue(text.indexOf('\n') > 0);
        await message.edit();
        await message.clear();
        await message.type('foobar');
        await message.confirm();
    });

    it('als gebruiker kan ik WYSIWYG stijl toevoegen aan de tekst door tekst te selecteren', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await message.edit();
        await message.selectAllText();
        await message.waitUntilWysiwygPresent();
        await message.cancel();
    });

    it('als gebruiker kan ik buiten het tekstveld klikken om de bewerk modus te sluiten en mijn wijzigingen te bewaren', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await assert.eventually.equal(message.getText(), 'foobar');
        await message.edit();
        await message.clear();
        await message.type('decibel');
        await assert.eventually.isTrue(message.isEditable());
        await message.blur();
        await assert.eventually.isFalse(message.isEditable());
        await assert.eventually.equal(message.getText(), 'decibel');
    });
});
