const { Service, Characteristic } = require('hap-nodejs');
const { RaspberryPi_5B, Edge } = require('opengpio');

class ContactSensor2Accessory {
    constructor(log, config) {
      this.log = log;
      this.name = config.name || 'Garage Closed Sensor';
      this.contactState = 1; // Default "Open" state
      this.chipLine = config.chipline2 || { chip: 4, line: 27 };

      // Create Contact Sensor Service
      this.service = new Service.ContactSensor(this.name, 'garage-closed');
      this.contactCharacteristic = this.service.getCharacteristic(Characteristic.ContactSensorState);

      // Handle GET Requests
      this.contactCharacteristic.onGet(this.handleGet.bind(this));

      // Watch GPIO pin for state changes
      this.watch = RaspberryPi_5B.watch(this.chipLine, Edge.Both);
      
      this.watch.on('change', (value) => {
          this.contactState = value ? 0 : 1; // Convert value to HomeKit format (0 = Closed, 1 = Open)
          
          this.log(`CS2 change occurred: ${this.contactState === 0 ? 'Closed' : 'Open'}`);

          // 🔥 Ensure HomeKit detects the change
          this.contactCharacteristic.updateValue(this.contactState);
      });
    }
  
    handleGet() {
      this.log(`Getting Garage Closed state: ${this.contactState}`);
      return this.contactState;
    }
  
    getServices() {
      return [this.service];
    }
}

module.exports = ContactSensor2Accessory;