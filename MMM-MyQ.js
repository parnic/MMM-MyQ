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
        columns: 1,
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
        this.devices = [];
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
            payload.forEach((entry) => {
                let existingDevice = this.getDeviceBySerial(entry.serial_number);
                if (!existingDevice) {
                    this.devices.push(entry);
                    existingDevice = entry;
                } else {
                    existingDevice.state = entry.state;
                }

                if (existingDevice.desiredState) {
                    if (existingDevice.state.door_state !== existingDevice.desiredState) {
                        this.scheduleUpdate();
                    } else {
                        existingDevice.desiredState = null;
                    }
                }
            });

            this.updateDom();
        }
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

        let table = document.createElement('table');
        wrapper.appendChild(table);

        let cols = -1;

        let row;
        this.devices.forEach((device) => {
            cols++;
            if (cols % this.config.columns === 0) {
                row = document.createElement('tr');
                table.appendChild(row);
            }

            let cell = document.createElement('td');
            cell.classList.add('btn');
            cell.appendChild(this.getDeviceDom(device));
            row.appendChild(cell);
        });

        return wrapper;
    },

    getDeviceDom(device) {
        const nameLabel = document.createElement('div');
        nameLabel.textContent = device.name;

        const btn = document.createElement('button');
        btn.appendChild(nameLabel);

        if (device.desiredState) {
            btn.disabled = true;
        } else {
            const actionLabel = document.createElement('div');
            let action = this.actions.close;
            actionLabel.textContent = this.translate('Opened');
            if (device.state.door_state === this.states.closed) {
                action = this.actions.open;
                actionLabel.textContent = this.translate('Closed');
            }

            btn.dataset['action'] = action;
            btn.appendChild(actionLabel);
        }

        btn.dataset['serial_number'] = device.serial_number;
        btn.classList.add('control', 'light');
        btn.addEventListener('click', (evt) => { this.deviceBtnAction(btn); });

        return btn;
    },

    deviceBtnAction(btn) {
        let device = this.getDeviceBySerial(btn.dataset['serial_number']);
        let action = btn.dataset['action'];

        if (device && action) {
            device.desiredState = action === this.actions.close ? this.states.closed : this.states.open;
            this.sendSocketNotification('MYQ_TOGGLE', {device, action});
            this.updateDom();
        }
    },

    getDeviceBySerial(serialNumber) {
        return this.devices.find((device) => device.serial_number === serialNumber);
    }
});
