/* Magic Mirror
 * Module: MMM-MyQ
 *
 * By parnic https://github.com/parnic/MMM-MyQ
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const MyQ = require('myq-api');

module.exports = NodeHelper.create({
    customActions: {
        open: 'open',
        close: 'close'
    },

    start() {
        console.log(`Starting module helper: ${this.name}`);
    },

    resetUpdates() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.intervalId = setInterval(() => {
            this.getData();
        }, this.config.updateInterval);
    },

    async socketNotificationReceived(notification, payload) {
        if (notification === 'MYQ_CONFIG') {
            this.config = payload;
            this.account = new MyQ();

            let result = await this.account.login(this.config.email, this.config.password)
            if (result.code !== MyQ.constants.codes.OK) {
                let err = `login failed with code ${result.code}`;
                this.sendSocketNotification('MYQ_ERROR', {context: 'login', err});
                console.error(`${this.name} login error: ${err}`);
                return;
            }

            this.sendSocketNotification('MYQ_LOGGED_IN', {constants: MyQ.constants, actions: this.customActions});
            this.getData();

            this.resetUpdates();
        } else if (this.config) {
            if (notification === 'MYQ_TOGGLE') {
                const {device, action} = payload;
                const myqAction = action === this.customActions.open ? MyQ.actions.door.OPEN : MyQ.actions.door.CLOSE;

                let result = await this.account.setDoorState(device.serial_number, myqAction);
                this.sendSocketNotification('MYQ_TOGGLE_COMPLETE', result.returnCode === 0);
            } else if (notification === 'MYQ_UPDATE') {
                this.getData();
            }
        }
    },

    async getData() {
        this.resetUpdates();

        let result = await this.account.getDevices();
        if (result.code !== MyQ.constants.codes.OK) {
            let err = `getDevices failed with code ${result.code}`;
            this.sendSocketNotification('MYQ_ERROR', {context: 'getDevices', err});
            console.error(`${this.name} getDevices error: ${err}`);
            return;
        }

        let devices = result.devices.filter((device) => this.config.types.includes(device.device_type));
        this.sendSocketNotification('MYQ_DEVICES_FOUND', devices);

        devices.forEach((device) => {
            this.account.getDoorState(device.serial_number)
                .then((state) => {
                    if (state.code === MyQ.constants.codes.OK) {
                        this.sendSocketNotification('MYQ_DEVICE_STATE', { device, state });
                    } else {
                        let err = `getDoorState failed with code ${result.code}`;
                        this.sendSocketNotification('MYQ_ERROR', {context: 'getDevices', err});
                        console.error(`${this.name} getDoorState error: ${err}`);
                    }
                });
        });
    }
});
