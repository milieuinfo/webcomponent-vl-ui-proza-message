const { assert, driver } = require('vl-ui-core').Test.Setup;
const VlAlertPage = require('./pages/vl-alert.page');

describe('vl-alert', async () => {
    const vlAlertPage = new VlAlertPage(driver);

    before(() => {
        return vlAlertPage.load();
    });

    it('Als ik een alert met title gebruik, wordt de text onder messages gerenderd', async () => {
        const alert = await vlAlertPage.getAlertWithIconAndTitle();
        await assert.eventually.equal(alert.getTitle(), 'Dit is een melding met pictogram en titel. Een titel kan enkel tekst bevatten.');
        await assert.eventually.isOk(alert.hasIcon());
    });

    it('Als ik een alert met icon gebruik, wordt het icon gerenderd', async () => {
        const alert = await vlAlertPage.getAlertWithIconAndTitle();
        await assert.eventually.isOk(alert.hasIcon());
    });

    it('Als ik een message meegeef wordt die correct weergegeven', async () => {
        const alert = await vlAlertPage.getAlertWithIconAndMessage();
        await assert.eventually.notStrictEqual(alert.getMessage(), 'De boodschap bestaat uit standaard HTML. De boodschap kan dus uit meerdere paragrafen bestaan en links en andere HTML elementen bevatten.');
    });

    it('Als ik een alert sluit is deze niet meer zichtbaar', async () => {
        const alert = await vlAlertPage.getClosableAlert();
        await alert.close();
        await assert.eventually.isFalse(alert.isPresent());
    });

    it('Als ik een alert als success definieer wordt de juiste icon getoond', async () => {
        const alert = await vlAlertPage.getSuccessAlert();
        await assert.eventually.isTrue(alert.isSuccess());
    });

    it('Als ik een alert als warning definieer wordt de juiste icon getoond', async () => {
        const alert = await vlAlertPage.getAlertWarning();
        await assert.eventually.isTrue(alert.isWarning());
    });

    it('Als ik een alert als error definieer wordt de juiste icon getoond', async () => {
        const alert = await vlAlertPage.getAlertError();
        await assert.eventually.isTrue(alert.isError());
    });

    it('Als ik een alert als cta definieer, wordt de juiste icon getoond', async () => {
        const alert = await vlAlertPage.getCtaAlert();
        await assert.eventually.isTrue(alert.isCta());
    });

    it('Als ik size als small definieer, zal de alert klein zijn', async () => {
        const alert = await vlAlertPage.getSmallAlert();
        await assert.eventually.isTrue(alert.isSmall());
    });

    it('Als ik size als large definieer, zal de alert groot zijn', async() => {
        const alert = await vlAlertPage.getLargeAlert();
        await assert.eventually.isTrue(alert.isLarge());
    });

    after((done) => { 
        if (driver) {
            driver.quit();
        }
        done();
    });
});
