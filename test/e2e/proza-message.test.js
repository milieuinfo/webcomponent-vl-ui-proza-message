const { assert, driver } = require('vl-ui-core').Test.Setup;
const VlProzaMessagePage = require('./pages/vl-proza-message.page');

describe('vl-proza-message', async () => {
    const vlProzaMessagePage = new VlProzaMessagePage(driver);

    before(() => {
        return vlProzaMessagePage.load();
    });

    it('als gebruiker kan ik een potlood zien bij een proza component', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        const button = await message.getEditButton();
        await assert.eventually.isTrue(button.hasIcon());
        const icon = await button.getIcon();
        await assert.eventually.equal(icon.getType(), 'edit');
    });

    it('als gebruiker kan ik een tekst editeerbaar maken door op het potlood te klikken', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await message.edit();
        await assert.eventually.isTrue(message.isEditable());
        await message.cancel();
    });

    it('als gebruiker kan ik een tekst verwijderen', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await message.edit();
        await message.clear();
        await message.confirm();
        await assert.eventually.equal(message.getText(), '');
        await _resetMessage(message);
    });

    it('als gebruiker kan ik op de escape-toets drukken om mijn wijzigingen te annuleren', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await assert.eventually.equal(message.getText(), 'foobar');
        await message.edit();
        await message.type('decibel');
        await message.cancel();
        await assert.eventually.equal(message.getText(), 'foobar');
    });

    it('als de gebruiker kan ik op de enter-toets drukken om mijn wijzigingen te bewaren', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await message.edit();
        await message.type('decibel');
        await message.confirm();
        await assert.eventually.equal(message.getText(), 'decibel');
        await _resetMessage(message);
    });

    it('als gebruiker kan ik enter+shift invoeren om een line-break toe te voegen', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await message.edit();
        await message.type('line');
        await message.shiftEnter();
        await message.append('break');
        await message.confirm();
        await assert.eventually.include(message.getText(), '\n');
        await _resetMessage(message);
    });

    it('als gebruiker kan ik bold stijl toevoegen aan de tekst door tekst te selecteren en dan de stijl knop te gebruiken', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await _enableWysiwyg(message);
        await assert.eventually.isFalse(message.hasBoldStyle());
        await vlProzaMessagePage.clickWysiwygBoldButton();
        await message.confirm();
        await assert.eventually.isTrue(message.hasBoldStyle());
        await _resetMessage(message);
    });

    it('als gebruiker kan ik italic stijl toevoegen aan de tekst door tekst te selecteren en dan de stijl knop te gebruiken', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await _enableWysiwyg(message);
        await assert.eventually.isFalse(message.hasItalicStyle());
        await vlProzaMessagePage.clickWysiwygItalicButton();
        await message.confirm();
        await assert.eventually.isTrue(message.hasItalicStyle());
        await _resetMessage(message);
    });

    it('als gebruiker kan ik underline stijl toevoegen aan de tekst door tekst te selecteren en dan de stijl knop te gebruiken', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await _enableWysiwyg(message);
        await assert.eventually.isFalse(message.hasUnderlineStyle());
        await vlProzaMessagePage.clickWysiwygUnderlineButton();
        await message.confirm();
        await assert.eventually.isTrue(message.hasUnderlineStyle());
        await _resetMessage(message);
    });

    async function _enableWysiwyg(message) {
        await message.edit();
        await message.selectAllText();
        await vlProzaMessagePage.waitUntilWysiwygOfMessageFirstDemoIsPresent();
        await assert.eventually.isTrue(message.isWysiwygPresent());
    }

    it('als gebruiker kan ik buiten het tekstveld klikken om de bewerk modus te sluiten en mijn wijzigingen te bewaren', async () => {
        const message = await vlProzaMessagePage.getMessageFirstDemo();
        await assert.eventually.equal(message.getText(), 'foobar');
        await message.edit();
        await message.type('decibel');
        await assert.eventually.isTrue(message.isEditable());
        await message.blur();
        await assert.eventually.isFalse(message.isEditable());
        await assert.eventually.equal(message.getText(), 'decibel');
    });

    it('als gebruiker zie ik een waarschuwing in een alert als het updaten misgaat', async () => {
        const message = await vlProzaMessagePage.getMessageWithError();
        await assert.eventually.equal(message.getText(), 'update zal fout gaan');
        await message.edit();
        await message.type('decibel');
        await message.confirm();
        const toaster = await vlProzaMessagePage.getToaster();
        await assert.eventually.lengthOf(toaster.getAlerts(), 1);
        const alert = (await toaster.getAlerts())[0];
        await assert.eventually.isTrue(alert.isWarning());
        await assert.eventually.equal(alert.getTitle(), 'Technische storing');
    });

    async function _resetMessage(message) {
        await message.edit();
        await message.type('foobar');
        await message.confirm();
    }
});
