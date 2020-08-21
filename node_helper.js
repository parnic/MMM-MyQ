/* Magic Mirror
 * Module: MMM-MyQ
 *
 * By parnic https://github.com/parnic/MMM-MyQ
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const { myQ, constants } = require('myq-api');

module.exports = NodeHelper.create({
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

    socketNotificationReceived(notification, payload) {
        if (notification === 'MYQ_CONFIG') {
            this.config = payload;
            this.account = new myQ(this.config.email, this.config.password);

            this.account.login()
                .then((result) => {
                    if (result.returnCode !== 0) {
                        throw new Error('login failure');
                    }

                    this.sendSocketNotification('MYQ_LOGGED_IN', constants);
                    this.getData();

                    this.resetUpdates();
                })
                .catch((err) => {
                    this.sendSocketNotification('MYQ_ERROR', {context: 'login', err});
                    console.error(`${this.name} login error: ${err}`);
                });
        } else if (this.config) {
            if (notification === 'MYQ_TOGGLE') {
                const {device, action} = payload;
                this.account.setDeviceState(device.serialNumber, action)
                    .then((result) => {
                        this.sendSocketNotification('MYQ_TOGGLE_COMPLETE', result.returnCode === 0);
                    });
            } else if (notification === 'MYQ_UPDATE') {
                this.getData();
            }
        }
    },

    getData() {
        this.resetUpdates();

        this.account.getDevices()
            .then((result) => {
                if (result.returnCode !== 0) {
                    throw new Error('getDevices error');
                }

                result.devices.forEach((device) => {
                    if (this.config.types.includes(device.type)) {
                        this.sendSocketNotification('MYQ_DEVICE_FOUND', device);

                        this.account.getDoorState(device.serialNumber)
                            .then((state) => {
                                if (state.returnCode === 0) {
                                    this.sendSocketNotification('MYQ_DEVICE_STATE', { device, state });
                                }
                            });
                    }
                });
            })
            .catch((err) => {
                this.sendSocketNotification('MYQ_ERROR', {context: 'getDevices', err});
                console.error(`${this.name} getDevices error: ${err}`);
            });
    }
});
