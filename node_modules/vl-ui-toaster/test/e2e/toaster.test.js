
const { assert, driver } = require('vl-ui-core').Test.Setup;
const VlToasterPage = require('./pages/vl-toaster.page');

describe('vl-toaster', async () => {
    const vlToasterPage = new VlToasterPage(driver);

    before(() => {
        return vlToasterPage.load();
    });
    
    after(async () => { 
        return driver.quit();
    });
});
