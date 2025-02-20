class MyTimedSwitch {
    constructor(log, config, api) {
      this.log = log;
      this.api = api;
      this.name = config.name || 'Timed Switch';
      this.switchState = false;
  
      // Ensure activationTime is between 200ms and 5000ms (5s)
      this.activationTime = Math.min(Math.max(config.activationTime || 1000, 200), 5000);
      this.remainingTime = 0; // Tracks countdown time
  
      // Set default GPIO line to 5 if not specified
      this.switchPin = config.switchPin || { chip: 4, line: 5 };
  
      this.Service = this.api.hap.Service;
      this.Characteristic = this.api.hap.Characteristic;
  
      // Create Stateful Timer Service (to show countdown in HomeKit)
      this.service = new this.Service.Valve(this.name);
      this.service
        .getCharacteristic(this.Characteristic.Active)
        .onGet(this.handleGet.bind(this))
        .onSet(this.handleSet.bind(this));
  
      // Required for HomeKit to show time remaining
      this.setDurationCharacteristic = this.service.getCharacteristic(this.Characteristic.SetDuration);
      this.remainingDurationCharacteristic = this.service.getCharacteristic(this.Characteristic.RemainingDuration);
  
      this.setDurationCharacteristic.onGet(() => this.activationTime / 1000); // Convert ms to seconds
      this.remainingDurationCharacteristic.onGet(() => this.remainingTime / 1000); // Convert ms to seconds
  
      try {
        const { RaspberryPi_5B } = require('opengpio');
        this.outputPin = RaspberryPi_5B.output(this.switchPin);
        this.outputPin.value = 0;
      } catch (error) {
        this.log.error('Error initializing GPIO:', error);
      }
    }
  
    async handleGet() {
      return this.switchState;
    }
  
    async handleSet(value) {
      if (value) {
        try {
          this.switchState = true;
          this.outputPin.value = 1;
          this.remainingTime = this.activationTime;
  
          this.log.info(`Switch activated. Countdown started: ${this.activationTime} ms`);
  
          // Start countdown & update HomeKit UI
          const interval = setInterval(() => {
            this.remainingTime -= 1000;
            this.remainingDurationCharacteristic.updateValue(this.remainingTime / 1000); // Update HomeKit every second
  
            if (this.remainingTime <= 0) {
              clearInterval(interval);
            }
          }, 1000);
  
          setTimeout(() => {
            this.switchState = false;
            this.outputPin.value = 0;
            this.service.getCharacteristic(this.Characteristic.Active).updateValue(false);
            this.remainingTime = 0;
            this.remainingDurationCharacteristic.updateValue(0);
            this.log.info('Switch automatically turned off.');
          }, this.activationTime);
  
        } catch (error) {
          this.log.error('Error setting GPIO state:', error);
        }
      }
    }
  
    getServices() {
      return [this.service];
    }
  }
  
  module.exports = MyTimedSwitch;