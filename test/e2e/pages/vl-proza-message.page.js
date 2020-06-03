const VlProzaMessage = require('../components/vl-proza-message');
const {VlToaster} = require('vl-ui-toaster').Test;
const {Page, Config} = require('vl-ui-core').Test;
const {By} = require('vl-ui-core').Test.Setup;

class VlProzaMessagePage extends Page {
  async _getProzaMessage(selector) {
    return new VlProzaMessage(this.driver, selector);
  }

  async getMessageFirstDemo() {
    return this._getProzaMessage('#message-1');
  }

  async getMessageWithError() {
    return this._getProzaMessage('#message-2');
  }

  async getToaster() {
    const toaster = await this.driver.findElement(By.css('[is="vl-toaster"]'));
    if (toaster) {
      return new VlToaster(this.driver, toaster);
    }
  }

  async getFirstMessageWithPreloading() {
    return this._getProzaMessage('#message-3');
  }

  async getSecondMessageWithPreloading() {
    return this._getProzaMessage('#message-4');
  }

  async getFirstMessageWithButton() {
    return this._getProzaMessage('#message-5');
  }

  async getSecondMessageWithButton() {
    return this._getProzaMessage('#message-6');
  }

  async getThirdMessageWithButton() {
    return this._getProzaMessage('#message-7');
  }

  async getFourthMessageWithButton() {
    return this._getProzaMessage('#message-8');
  }

  async getMessageWithTypo() {
    return this._getProzaMessage('#message-9');
  }

  async getMessageWithTitle() {
    return this._getProzaMessage('#message-10');
  }

  async getMessageWithList() {
    return this._getProzaMessage('#message-11');
  }

  async getMessageWithMarkup() {
    return this._getProzaMessage('#message-12');
  }

  async getMessageWithTable() {
    return this._getProzaMessage('#message-13');
  }

  async load() {
    await super.load(Config.baseUrl + '/demo/vl-proza-message.html');
  }
}

module.exports = VlProzaMessagePage;
