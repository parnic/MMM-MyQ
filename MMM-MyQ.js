/* Magic Mirror
 * Module: MMM-MyQ
 *
 * By parnic https://github.com/parnic/MMM-MyQ
 * MIT Licensed.
 */

Module.register('MMM-MyQ', {
    defaults: {
        colored: false,
        email: 'email',
        password: 'password',
        types: ['wifigaragedooropener'],
        updateInterval: 5 * 60 * 1000 // every 5 minutes
    },

    getStyles() {
        return ['MMM-MyQ.css'];
    },

    start() {
        Log.info(`Starting module: ${this.name}`);
        this.sendSocketNotification('MYQ_CONFIG', this.config);
        this.sendSocketNotification('MYQ_UPDATE');
    },

    socketNotificationReceived(notification, payload) {
        if (notification === 'SCORES') {
            this.scores = payload.scores;
            this.details = payload.details;
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
            text.innerHTML = this.translate('LOADING');
            text.classList.add('dimmed', 'light');
            scores.appendChild(text);
        } else {
            const table = document.createElement('table');
            table.classList.add('small', 'table');

            table.appendChild(this.createLabelRow());

            const max = Math.min(
                this.rotateIndex + this.config.matches,
                this.scores.length
            );
            for (let i = this.rotateIndex; i < max; i += 1) {
                this.appendDataRow(this.scores[i], table);
            }

            scores.appendChild(table);
        }

        wrapper.appendChild(scores);

        return wrapper;
    }
});
