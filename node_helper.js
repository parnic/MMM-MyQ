/* Magic Mirror
 * Module: MMM-MyQ
 *
 * By parnic https://github.com/parnic/MMM-MyQ
 * MIT Licensed.
 */

/* eslint-env node */

const NodeHelper = require('node_helper');
const { myQ, _ } = require('myq-api');

module.exports = NodeHelper.create({
    start() {
        console.log(`Starting module helper: ${this.name}`);
    },

    socketNotificationReceived(notification, payload) {
        if (notification === 'MYQ_CONFIG') {
            this.config = payload;
            this.account = new myQ(this.config.email, this.config.password);
            console.log('config received');
            this.account
                .login()
                .then((result) => {
                    console.log('login complete');
                    if (result.returnCode !== 0) {
                        throw new Error('login failure');
                    }

                    this.sendSocketNotification('MYQ_LOGGED_IN');
                    this.getData();
                })
                .catch((err) => {
                    this.sendSocketNotification('MYQ_ERROR');
                    console.error(`login error: ${err}`);
                });

            setInterval(() => {
                this.getData();
            }, this.config.updateInterval);
        }
    },

    getData() {
        console.log('retrieving devices');
        this.account
            .getDevices()
            .then((result) => {
                console.log('devices retrieved');
                result.devices.forEach((device) => {
                    if (this.config.types.includes(device.type)) {
                        this.sendSocketNotification('MYQ_DEVICE_FOUND', device);

                        console.log('getting door state');
                        console.log(device);
                        this.account
                            .getDoorState(device.serialNumber)
                            .then((state) => {
                                console.log('state');
                                console.log(state);
                                if (state.returnCode === 0) {
                                    this.sendSocketNotification(
                                        'MYQ_DEVICE_STATE',
                                        { device, state }
                                    );
                                }
                            });
                    }
                });
            })
            .catch((err) => {
                this.sendSocketNotification('MYQ_ERROR');
                console.error(`getData error: ${err}`);
            });
    }
});
