/* Magic Mirror
 * Module: MMM-MyQ
 *
 * By parnic https://github.com/parnic/MMM-MyQ
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');

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

    async socketNotificationReceived(notification, payload) {
        if (notification === 'MYQ_CONFIG') {
            if (!this.config) {
                this.config = payload;
                const MyQ = await import('@hjdhjd/myq');
                this.account = new MyQ.myQApi(this.config.email, this.config.password, null, 'east');
            }
            this.sendSocketNotification('MYQ_LOGGED_IN', this._customActions);
            this.getData();
        } else if (this.config) {
            if (notification === 'MYQ_TOGGLE') {
                const {device, action} = payload;
                this.execute(device, action);
            } else if (notification === 'MYQ_UPDATE') {
                this.getData();
            }
        }
    },

    getData() {
        this.resetUpdates();
        this.refreshDevices();
    },

    async refreshDevices() {
        let result = await this.account.refreshDevices();
        if (!result) {
            this.handleError('refreshDevices returned false');
            return;
        }

        let devices = this.account.devices.filter((device) => this.config.types.includes(device.device_type));
        this.sendSocketNotification('MYQ_DEVICES_FOUND', devices);
    },

    async execute(device, action) {
        let result = await this.account.execute(device, action);
        if (result) {
            this.sendSocketNotification('MYQ_TOGGLE_COMPLETE', result);
        } else {
            this.handleError('execute');
        }
    },

    handleError(context) {
        let err = `${context} failed`;
        this.sendSocketNotification('MYQ_ERROR', {context, err});
        console.error(`${this.name} ${context} error: ${err}`);
    }
});
