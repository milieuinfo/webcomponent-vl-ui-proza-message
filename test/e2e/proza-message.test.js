const {assert, driver} = require('vl-ui-core').Test.Setup;
const VlProzaMessagePage = require('./pages/vl-proza-message.page');

describe('vl-proza-message', async () => {
  const vlProzaMessagePage = new VlProzaMessagePage(driver);
  let message;

  beforeEach(() => {
    message = undefined;
  });

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
    message = await vlProzaMessagePage.getMessageFirstDemo();
    await message.edit();
    await message.clear();
    await message.confirm();
    message = await vlProzaMessagePage.getMessageFirstDemo();
    await assert.eventually.equal(message.getText(), '');
  });

  it('als gebruiker kan ik op de escape-toets drukken om mijn wijzigingen te annuleren', async () => {
    let message = await vlProzaMessagePage.getMessageFirstDemo();
    await assert.eventually.equal(message.getText(), 'foobar');
    await message.edit();
    await message.type('decibel');
    await message.cancel();
    message = await vlProzaMessagePage.getMessageFirstDemo();
    await assert.eventually.equal(message.getText(), 'foobar');
  });

  it('als de gebruiker kan ik op de enter-toets drukken om mijn wijzigingen te bewaren', async () => {
    message = await vlProzaMessagePage.getMessageFirstDemo();
    await message.edit();
    await message.type('decibel');
    await message.confirm();
    message = await vlProzaMessagePage.getMessageFirstDemo();
    await assert.eventually.equal(message.getText(), 'decibel');
  });

  it('als gebruiker kan ik enter+shift invoeren om een line-break toe te voegen', async () => {
    message = await vlProzaMessagePage.getMessageFirstDemo();
    await message.edit();
    await message.type('line');
    await message.shiftEnter();
    await message.append('break');
    await message.confirm();
    message = await vlProzaMessagePage.getMessageFirstDemo();
    await assert.eventually.include(message.getText(), '\n');
  });

  it('als gebruiker kan ik de wysiwyg activeren door alle tekst te selecteren', async () => {
    message = await vlProzaMessagePage.getMessageFirstDemo();
    await message.edit();
    await message.selectAllText();
    await message.waitUntilWysiwygIsPresent();
    await assert.eventually.isTrue(message.isWysiwygPresent());
    await message.confirm();
  });

  it('als gebruiker kan ik bold stijl toevoegen door in de wysiwyg de stijl knop te gebruiken', async () => {
    message = await vlProzaMessagePage.getMessageFirstDemo();
    await enableWysiwyg(message);
    await assert.eventually.isFalse(message.hasBoldStyle());
    await message.clickWysiwygBoldButton();
    await message.confirm();
    await assert.eventually.isTrue(message.hasBoldStyle());
  });

  it('als gebruiker kan ik italic stijl toevoegen door in de wysiwyg de stijl knop te gebruiken', async () => {
    message = await vlProzaMessagePage.getMessageFirstDemo();
    await enableWysiwyg(message);
    await assert.eventually.isFalse(message.hasItalicStyle());
    await message.clickWysiwygItalicButton();
    await message.confirm();
    await assert.eventually.isTrue(message.hasItalicStyle());
  });

  it('als gebruiker kan ik underline stijl toevoegen door in de wysiwyg de stijl knop te gebruiken', async () => {
    message = await vlProzaMessagePage.getMessageFirstDemo();
    await enableWysiwyg(message);
    await assert.eventually.isFalse(message.hasUnderlineStyle());
    await message.clickWysiwygUnderlineButton();
    await message.confirm();
    await assert.eventually.isTrue(message.hasUnderlineStyle());
  });

  async function enableWysiwyg(message) {
    await message.edit();
    await message.selectAllText();
    await message.waitUntilWysiwygIsPresent();
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
    await assert.eventually.isTrue(alert.isError());
    await assert.eventually.equal(alert.getTitle(), 'Technische storing');
  });

  it('als gebruiker zie ik de parameter values in lees modus', async () => {
    const message = await vlProzaMessagePage.getMessageWithParameters();
    await assert.eventually.equal(message.getText(), 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis iaculis molestie feugiat. Lorem ipsum eros, consequat et venenatis ac, scelerisque feugiat nunc. Nam molestie tincidunt lectus, nec volutpat ante egestas at. Curabitur quis odio metus. Morbi at purus ac purus convallis tempus at eu est. Nunc id ligula quis justo semper ullamcorper. Donec orci nisi, tempus varius massa ut, vulputate imperdiet nibh. Maecenas tempus lectus quis turpis cursus, ac vehicula ligula fermentum.\nPraesent consequat diam nec semper congue. ipsum tempor ut erat nec aliquam. Quisque ullamcorper sapien magna, sit amet porta ipsum pulvinar aliquam. Sed eleifend fringilla augue in vehicula. Sed leo sem, imperdiet non ornare maximus, bibendum facilisis massa. Nunc condimentum leo mi, quis porta ante mattis ut. Quisque eu enim vel metus consequat iaculis. Donec malesuada odio quis quam vulputate vestibulum.');
  });

  it('als gebruiker zie ik de parameter keys in bewerk modus', async () => {
    const message = await vlProzaMessagePage.getMessageWithParameters();
    await message.edit();
    await assert.eventually.equal(message.getWysiwygText(), 'Lorem ${parameter.key2} dolor sit amet, consectetur adipiscing elit. Duis iaculis molestie feugiat. Lorem ${parameter.key2} eros, consequat et venenatis ac, scelerisque feugiat nunc. Nam molestie tincidunt lectus, nec volutpat ante egestas at. Curabitur quis odio metus. Morbi at purus ac purus convallis ${parameter.key1} at eu est. Nunc id ligula quis justo semper ullamcorper. Donec orci nisi, ${parameter.key1} varius massa ut, vulputate imperdiet nibh. Maecenas ${parameter.key1} lectus quis turpis cursus, ac vehicula ligula fermentum.\n\nPraesent consequat diam nec semper congue. ${parameter.key2} tempor ut erat nec aliquam. Quisque ullamcorper sapien magna, sit amet porta ${parameter.key2} pulvinar aliquam. Sed eleifend fringilla augue in vehicula. Sed leo sem, imperdiet non ornare maximus, bibendum facilisis massa. Nunc condimentum leo mi, quis porta ante mattis ut. Quisque eu enim vel metus consequat iaculis. Donec malesuada odio quis quam vulputate vestibulum.');
  });

  afterEach(async () => {
    if (message) {
      await message.edit();
      await message.type('foobar');
      await message.confirm();
    }
  });
});
