

const MySwitchAccessory = require('./MySwitchAccessory');
const ContactSensor1Accessory = require('./ContactSensor1Accessory');
const ContactSensor2Accessory = require('./ContactSensor2Accessory');

module.exports = (api) => {
  api.registerPlatform('homebridge-piotr-platform05', 'PiotrPlatform05', PiotrPlatform05);
};

class PiotrPlatform05 {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;
    this.accessories = []; // Initialize an empty array for accessories

    if (!config) {
      this.log('No configuration found for PiotrPlatform05');
      return;
    }

    api.on('didFinishLaunching', () => {
      this.log('PiotrPlatform05 has finished launching.');
      this.setupAccessories();
    });
  }

  /**
   * This method is required for Homebridge to remember cached accessories.
   * When Homebridge starts, it will call this method for each cached accessory.
   */
  configureAccessory(accessory) {
    this.log(`Loading cached accessory: ${accessory.displayName}`);
    this.accessories.push(accessory);
  }

  setupAccessories() {
    if (!this.config.accessories || !Array.isArray(this.config.accessories)) {
      this.log('No accessories found in config.json');
      return;
    }

    this.config.accessories.forEach((accessoryConfig) => {
      let accessoryInstance;
      let uuid = this.api.hap.uuid.generate(accessoryConfig.name);

      switch (accessoryConfig.accessory) {
        case 'MySwitch':
          accessoryInstance = new MySwitchAccessory(this.log, accessoryConfig, this.api.hap);
          break;
        case 'GarageOpenedSensor':
          accessoryInstance = new ContactSensor1Accessory(this.log, accessoryConfig, this.api.hap);
          break;
        case 'GarageClosedSensor':
          //accessoryInstance = new ContactSensor2Accessory(this.log, accessoryConfig, this.api.hap);
          accessoryInstance = new ContactSensor2Accessory(this.log, accessoryConfig);
          break;
        default:
          this.log(`Unknown accessory type: ${accessoryConfig.accessory}`);
          return;
      }

      // Check if accessory is already registered
      let existingAccessory = this.accessories.find(acc => acc.UUID === uuid);

      if (existingAccessory) {
        this.log(`Restoring existing accessory: ${accessoryConfig.name}`);
        existingAccessory.services = accessoryInstance.getServices();
      } else {
        this.log(`Adding new accessory: ${accessoryConfig.name}`);
        let newAccessory = new this.api.platformAccessory(accessoryConfig.name, uuid);
        newAccessory.addService(accessoryInstance.getServices()[0]);
        this.accessories.push(newAccessory);
        this.api.registerPlatformAccessories('homebridge-piotr-platform05', 'PiotrPlatform05', [newAccessory]);
      }
    });
  }
}