/* Magic Mirror
 * Module: MMM-MyQ
 *
 * By parnic https://github.com/parnic/MMM-MyQ
 * MIT Licensed.
 */

Module.register('MMM-MyQ', {
    defaults: {
        email: '',
        password: '',
        types: ['wifigaragedooropener'],
        updateInterval: 5 * 60 * 1000 // every 5 minutes
    },

    states: {
        closed: 'closed',
        open: 'open',
        closing: 'closing',
        opening: 'opening'
    },

    getStyles() {
        return ['MMM-MyQ.css'];
    },

    start() {
        Log.info(`Starting module: ${this.name}`);
        this.deviceStates = new Map();
        this.sendSocketNotification('MYQ_CONFIG', this.config);
    },

    socketNotificationReceived(notification, payload) {
        if (notification === 'MYQ_LOGGED_IN') {
            let {constants, actions} = payload;
            this.constants = constants;
            this.actions = actions;
        } else if (notification === 'MYQ_ERROR') {
            const {context, err} = payload;
            Log.error(`context=${context}, err=${err.message}`);
        } else if (notification === 'MYQ_TOGGLE_COMPLETE') {
            this.scheduleUpdate();
        } else if (notification === 'MYQ_DEVICES_FOUND') {
            this.devices = payload;
        } else if (notification === 'MYQ_DEVICE_STATE') {
            const {device, state} = payload;

            let existingDevice = this.getDevice(device);
            if (!existingDevice) {
                this.deviceStates.set(device, {state});
                existingDevice = device;
            } else {
                existingDevice.state = device.state;
            }

            let entry = this.deviceStates.get(existingDevice);
            entry.state = state;
            if (entry.desiredState) {
                if (state.deviceState !== entry.desiredState) {
                    this.scheduleUpdate();
                } else {
                    entry.desiredState = null;
                }
            }

            if (!entry.desiredState) {
                this.updateDom();
            }
        }
    },

    getDevice(inDevice) {
        if (this.deviceStates && inDevice) {
            for (let device of this.deviceStates.keys()) {
                if (device.serialNumber === inDevice.serialNumber) {
                    return device;
                }
            }
        }

        return null;
    },

    scheduleUpdate() {
        if (!this.timeout) {
            this.timeout = setTimeout(() => {
                this.timeout = null;
                this.sendSocketNotification('MYQ_UPDATE');
            }, 5000);
        }
    },

    getDom() {
        const wrapper = document.createElement('div');

        if (this.deviceStates) {
            for (let [device, deviceData] of this.deviceStates) {
                wrapper.appendChild(this.getDeviceDom(device, deviceData));
            }
        }

        return wrapper;
    },

    getDeviceDom(device, deviceData) {
        const nameLabel = document.createElement('div');
        nameLabel.textContent = device.name;

        const actionLabel = document.createElement('div');
        let action = this.actions.close;
        actionLabel.textContent = this.translate('Opened');
        if (deviceData.state.deviceState === this.states.closed) {
            action = this.actions.open;
            actionLabel.textContent = this.translate('Closed');
        }

        const btn = document.createElement('button');

        btn.classList.add('control', 'light');
        btn.onclick = () => {
            this.sendSocketNotification('MYQ_TOGGLE', {device, action});
            btn.disabled = true;
            actionLabel.textContent = '';
            deviceData.desiredState = action === this.actions.close ? this.states.closed : this.states.open;
        }

        btn.appendChild(nameLabel);
        btn.appendChild(actionLabel);

        return btn;
    }
});
