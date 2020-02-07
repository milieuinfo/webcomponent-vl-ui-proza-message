const { assert, driver } = require('vl-ui-core').Test.Setup;
const VlTypographyPage = require('./pages/vl-typography.page');

describe('vl-typography', async () => {
    const vlTypographyPage = new VlTypographyPage(driver);

    before(() => {
        return vlTypographyPage.load();
    });

    after(async () => { 
        return driver.quit();
    });

    it('als gebruiker kan ik de inhoud van een vl-typography zien', async () => {
        const text = `
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod <a href="#">tempor
                        incididunt</a> ut labore et
                    dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo
                    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                    nulla pariatur.
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
                    est laborum.</p>
                <p>Lorem dolor sit amet, consectetur adipisicing elit. Deleniti, in.</p>
        `;
        const vlTypography = await vlTypographyPage.getTypographyPTag();
        const innerHTML = await vlTypography.getInnerHTML();
        assert.equal(innerHTML.trim(), text.trim());
    });

});
