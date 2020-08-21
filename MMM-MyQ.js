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

    getStyles() {
        return ['MMM-MyQ.css'];
    },

    start() {
        Log.info(`Starting module: ${this.name}`);
        this.sendSocketNotification('MYQ_CONFIG', this.config);
    },

    socketNotificationReceived(notification, payload) {
        if (notification === 'MYQ_LOGGED_IN') {
            Log.log('logged in');
            Log.log(payload);
            this.constants = payload;
        } else if (notification === 'MYQ_ERROR') {
            const {context, err} = payload;
            Log.error(`context=${context}, err=${err}`);
        } else if (notification === 'MYQ_TOGGLE_COMPLETE') {
            Log.log(`toggled. success=${payload}`);
        } else if (notification === 'MYQ_DEVICE_FOUND') {
            this.device = payload;
            Log.log('found a device');
            Log.log(this.device);

            this.updateDom();
        } else if (notification === 'MYQ_DEVICE_STATE') {
            const {device, state} = payload;
            Log.log('got device state');
            Log.log(device);
            Log.log(state);
        }
    },

    getDom() {
        const wrapper = document.createElement('div');
        const scores = document.createElement('div');
        const header = document.createElement('header');
        header.innerHTML = 'MyQ';
        scores.appendChild(header);

        if (!this.scores) {
            const text = document.createElement('div');
            const btn = document.createElement('button');
            if (this.device) {
                btn.onclick = () => {
                    this.sendSocketNotification('MYQ_TOGGLE', {device: this.device, action: this.constants.doorCommands.close});
                }
            }
            btn.textContent = 'close';
            text.innerHTML = this.translate('LOADING');
            text.classList.add('dimmed', 'light');
            scores.appendChild(text);
            scores.appendChild(btn);
        } else {
            const table = document.createElement('table');
            table.classList.add('small', 'table');

            table.appendChild(this.createLabelRow());

            const max = Math.min(this.rotateIndex + this.config.matches, this.scores.length);
            for (let i = this.rotateIndex; i < max; i += 1) {
                this.appendDataRow(this.scores[i], table);
            }

            scores.appendChild(table);
        }

        wrapper.appendChild(scores);

        return wrapper;
    }
});
