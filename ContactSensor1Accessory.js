class ContactSensor1Accessory {
  constructor(log, config, api) {
    this.log = log;
    this.api = api;
    this.name = config.name || 'Garage Opened Sensor';
    this.contactState = 1;
    this.chipLine = config.chipline1 || { chip: 4, line: 17 };

    this.Service = this.api.hap.Service;
    this.Characteristic = this.api.hap.Characteristic;

    this.service = new this.Service.ContactSensor(this.name, 'garage-opened');
    this.contactCharacteristic = this.service.getCharacteristic(this.Characteristic.ContactSensorState);
    this.contactCharacteristic.onGet(this.handleGet.bind(this));

    try {
      const { RaspberryPi_5B, Edge } = require('opengpio');
      this.watch = RaspberryPi_5B.watch(this.chipLine, Edge.Both);
      this.watch.on('change', (value) => {
        this.contactState = value ? 0 : 1; 
        this.log.info('Garage Opened Sensor state changed:', this.contactState);
        this.contactCharacteristic.updateValue(this.contactState);
      });
    } catch (error) {
      this.log.error('Error initializing GPIO watch:', error);
    }
  }

  async handleGet() {
    this.log.info(`Getting Garage Opened Sensor state: ${this.contactState}`);
    return this.contactState;
  }

  getServices() {
    return [this.service];
  }
}

module.exports = ContactSensor1Accessory;