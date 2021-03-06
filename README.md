# MMM-MyQ

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://raw.githubusercontent.com/parnic/MMM-MyQ/main/LICENSE)

MyQ module for MagicMirror². Enables display and control of MyQ devices (specifically garage door openers) from Chamberlain, LiftMaster.

Currently only supports garage doors. Support for lights/other MyQ devices is possible, but not currently planned.

## Dependencies

* An installation of [MagicMirror²](https://github.com/MichMich/MagicMirror)
* npm

## Installation

1. Clone this repo into `MagicMirror/modules` directory.
1. Configure your `MagicMirror/config/config.js`:

    ```js
    {
        module: 'MMM-MyQ',
        position: 'top_right',
        config: {
            email: 'you@example.com',
            password: 'correct horse battery staple'
        }
    }
    ```

1. Run command `npm install --production` in your `modules/MMM-MyQ` directory.

## Config Options

| **Option** | **Default** | **Description** |
| --- | --- | --- |
| `email` | `''` | Your MyQ login address. (required) |
| `password` | `''` | Your MyQ login password. (required) |
| `types` | `['wifigaragedooropener']` | The types of MyQ devices to track. See [here](https://github.com/parnic/myq-api/blob/develop/src/constants.js#L8-L11) for a list of known device types. |
| `updateInterval` | `5 * 60 * 1000` (5 minutes) | How often to update the state of your devices, in milliseconds. |
