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
    this.accessories = new Map(); // Use a Map for better performance with UUID lookup

    if (!config) {
      this.log.error('No configuration found for PiotrPlatform05');
      return;
    }

    this.api.on('didFinishLaunching', () => {
      this.log.info('PiotrPlatform05 has finished launching.');
      this.setupAccessories();
    });
  }

  /**
   * This method is required for Homebridge to remember cached accessories.
   * When Homebridge starts, it will call this method for each cached accessory.
   */
  configureAccessory(accessory) {
    this.log.info(`Loading cached accessory: ${accessory.displayName}`);
    this.accessories.set(accessory.UUID, accessory);
  }

  setupAccessories() {
    if (!Array.isArray(this.config.accessories)) {
      this.log.warn('No accessories found in config.json');
      return;
    }

    this.config.accessories.forEach((accessoryConfig) => {
      const uuid = this.api.hap.uuid.generate(accessoryConfig.name);
      let existingAccessory = this.accessories.get(uuid);

      let accessoryInstance;
      switch (accessoryConfig.accessory) {
        case 'MySwitch':
          accessoryInstance = new MySwitchAccessory(this.log, accessoryConfig, this.api);
          break;
        case 'GarageOpenedSensor':
          accessoryInstance = new ContactSensor1Accessory(this.log, accessoryConfig, this.api);
          break;
        case 'GarageClosedSensor':
          accessoryInstance = new ContactSensor2Accessory(this.log, accessoryConfig, this.api);
          break;
        default:
          this.log.warn(`Unknown accessory type: ${accessoryConfig.accessory}`);
          return;
      }

      if (existingAccessory) {
        this.log.info(`Restoring existing accessory: ${accessoryConfig.name}`);
        existingAccessory.context = accessoryConfig;
        existingAccessory.services = accessoryInstance.getServices();
        this.api.updatePlatformAccessories([existingAccessory]);
      } else {
        this.log.info(`Adding new accessory: ${accessoryConfig.name}`);
        const newAccessory = new this.api.platformAccessory(accessoryConfig.name, uuid);
        newAccessory.addService(accessoryInstance.getServices()[0]);
        newAccessory.context = accessoryConfig;
        this.api.registerPlatformAccessories('homebridge-piotr-platform05', 'PiotrPlatform05', [newAccessory]);
        this.accessories.set(uuid, newAccessory);
      }
    });
  }
}