const { Service, Characteristic } = require('hap-nodejs');
const { RaspberryPi_5B, Edge } = require('opengpio');

class MySwitchAccessory {
    constructor(log, config) {
      this.log = log;
      this.name = config.name || 'SmSwitch';
      this.switchState = false;
  
      this.service = new Service.Switch(this.name);
      this.service
        .getCharacteristic(Characteristic.On)
        .onGet(this.handleGet.bind(this))
        .onSet(this.handleSet.bind(this));

        this.outputPin = RaspberryPi_5B.output({ chip: 4, line: 22 });
        this.outputPin.value = 0;
    }
  
    handleGet() {
      this.log(`Getting switch state: ${this.switchState}`);
      return this.switchState;
    }
  
    handleSet(value) {
      this.log(`Setting switch state to: ${value}`);
      try {
      this.outputPin.value = value ? 1 : 0;
      this.switchState = value;
      } catch (error) {
        this.log('Error setting GPIO state:', error);
      }
    }
  
    getServices() {
      return [this.service];
    }
  }
  
  module.exports = MySwitchAccessory;