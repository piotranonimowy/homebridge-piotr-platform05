const { Service, Characteristic } = require('hap-nodejs');

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
    }
  
    handleGet() {
      this.log(`Getting switch state: ${this.switchState}`);
      return this.switchState;
    }
  
    handleSet(value) {
      this.log(`Setting switch state to: ${value}`);
      this.switchState = value;
    }
  
    getServices() {
      return [this.service];
    }
  }
  
  module.exports = MySwitchAccessory;