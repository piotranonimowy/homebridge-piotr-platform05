const { Service, Characteristic } = require('hap-nodejs');
const { RaspberryPi_5B, Edge } = require('opengpio');

class ContactSensor1Accessory {
    constructor(log, config) {
      this.log = log;
      this.name = config.name || 'Garage Opened Sensor';
      this.contactState = 1;
      this.chipLine = config.chipline1 || { chip: 4, line: 17 };
  
      this.service = new Service.ContactSensor(this.name, 'garage-opened');
      this.contactCharacteristic = this.service.getCharacteristic(Characteristic.ContactSensorState);
      this.contactCharacteristic.onGet(this.handleGet.bind(this));

      this.watch = RaspberryPi_5B.watch(this.chipLine, Edge.Both);
      this.watch.on('change', (value) => {
        this.contactState = value ? 0 : 1; 
        this.log('CS1 change occured');
        this.contactCharacteristic.updateValue(this.contactState);
      });
    }

    handleGet() {
      this.log(`Getting Garage Opened state: ${this.contactState}`);
      return this.contactState;
    }
  
    getServices() {
      return [this.service];
    }
  }
  
  module.exports = ContactSensor1Accessory;