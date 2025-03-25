import Homey from 'homey';

class MySolaredgeApp extends Homey.App {
  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('MySolaredgeApp has been initialized');
  }
}

module.exports = MySolaredgeApp;
