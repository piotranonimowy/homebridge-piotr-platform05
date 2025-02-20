class MySwitchAccessory {
  constructor(log, config, api) {
    this.log = log;
    this.api = api;
    this.name = config.name || 'SmSwitch';
    this.switchState = false;

    this.Service = this.api.hap.Service;
    this.Characteristic = this.api.hap.Characteristic;

    this.service = new this.Service.Switch(this.name);

    this.service
      .getCharacteristic(this.Characteristic.On)
      .onGet(this.handleGet.bind(this))
      .onSet(this.handleSet.bind(this));

    try {
      const { RaspberryPi_5B } = require('opengpio');
      this.outputPin = RaspberryPi_5B.output({ chip: 4, line: 22 });
      this.outputPin.value = 0;
    } catch (error) {
      this.log.error('Error initializing GPIO:', error);
    }
  }

  async handleGet() {
    this.log.info(`Getting switch state: ${this.switchState}`);
    return this.switchState;
  }

  async handleSet(value) {
    this.log.info(`Setting switch state to: ${value}`);
    try {
      this.outputPin.value = value ? 1 : 0;
      this.switchState = value;
    } catch (error) {
      this.log.error('Error setting GPIO state:', error);
    }
  }

  getServices() {
    return [this.service];
  }
}

module.exports = MySwitchAccessory;