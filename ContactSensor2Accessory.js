class ContactSensor2Accessory {
  constructor(log, config, api) {
    this.log = log;
    this.api = api;
    this.name = config.name || 'Garage Closed Sensor';
    this.contactState = 1; // Default "Open" state
    this.chipLine = config.chipline2 || { chip: 4, line: 27 };

    this.Service = this.api.hap.Service;
    this.Characteristic = this.api.hap.Characteristic;

    // Create Contact Sensor Service
    this.service = new this.Service.ContactSensor(this.name, 'garage-closed');
    this.contactCharacteristic = this.service.getCharacteristic(this.Characteristic.ContactSensorState);

    // Handle GET Requests
    this.contactCharacteristic.onGet(this.handleGet.bind(this));

    try {
      const { RaspberryPi_5B, Edge } = require('opengpio');
      this.watch = RaspberryPi_5B.watch(this.chipLine, Edge.Both);

      this.watch.on('change', (value) => {
        this.contactState = value ? 0 : 1; // Convert value to HomeKit format (0 = Closed, 1 = Open)
        this.log.info(`Garage Closed Sensor state changed: ${this.contactState === 0 ? 'Closed' : 'Open'}`);

        // 🔥 Ensure HomeKit detects the change
        this.contactCharacteristic.updateValue(this.contactState);
      });
    } catch (error) {
      this.log.error('Error initializing GPIO watch:', error);
    }
  }

  async handleGet() {
    this.log.info(`Getting Garage Closed Sensor state: ${this.contactState}`);
    return this.contactState;
  }

  getServices() {
    return [this.service];
  }
}

module.exports = ContactSensor2Accessory;