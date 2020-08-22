/* Magic Mirror
 * Module: MMM-MyQ
 *
 * By parnic https://github.com/parnic/MMM-MyQ
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const MyQ = require('myq-api');

module.exports = NodeHelper.create({
    _customActions: {
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

    socketNotificationReceived(notification, payload) {
        if (notification === 'MYQ_CONFIG') {
            this.config = payload;
            this.account = new MyQ();
            this.login();
        } else if (this.config) {
            if (notification === 'MYQ_TOGGLE') {
                const {device, action} = payload;
                const myqAction = action === this._customActions.open ? MyQ.actions.door.OPEN : MyQ.actions.door.CLOSE;

                this.account.setDoorState(device.serial_number, myqAction)
                    .then((result) => {
                        this.sendSocketNotification('MYQ_TOGGLE_COMPLETE', result.code === 0);
                    })
                    .catch((error) => this.handleError(error, 'setDoorState', true));
            } else if (notification === 'MYQ_UPDATE') {
                this.getData();
            }
        }
    },

    getData() {
        this.resetUpdates();

        this.account.getDevices()
            .then((result) => {
                if (result.code !== MyQ.constants.codes.OK) {
                    this.handleError(result, 'getDevices - then', true);
                    return;
                }

                let devices = result.devices.filter((device) => this.config.types.includes(device.device_type));
                this.sendSocketNotification('MYQ_DEVICES_FOUND', devices);
            })
            .catch((error) => this.handleError(error, 'getDevices', true));
    },

    login() {
        this.account.login(this.config.email, this.config.password)
            .then((result) => {
                if (result.code !== MyQ.constants.codes.OK) {
                    this.handleError(result, 'login - then');
                    return;
                }

                this.sendSocketNotification('MYQ_LOGGED_IN', {constants: MyQ.constants, actions: this._customActions});
                this.getData();
            })
            .catch((error) => this.handleError(error, 'login'));
    },

    handleError(error, context, attemptLogin) {
        if (attemptLogin && error.code === MyQ.constants.codes.LOGIN_REQUIRED) {
            this.login();
        } else {
            let err = `${context} failed with code ${error.code}`;
            this.sendSocketNotification('MYQ_ERROR', {context, err});
            console.error(`${this.name} ${context} error: ${err}`);
        }
    }
});
