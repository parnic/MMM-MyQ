# MMM-MyQ

## Stop-development notice

Chamberlain is being actively hostile toward third party uses of the MyQ API, and this is module is not valuable enough to me to fight a cat-and-mouse game with them, so I'd rather just cease development of the module and eventually replace my garage door opener with something different.

See <https://www.theverge.com/23949612/chamberlain-myq-smart-garage-door-controller-homebridge-integrations> among others.

## About

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
| `columns` | `1` | How many columns of buttons should be used when there are multiple devices. 1 column with 2 devices will stack them vertically while 2 columns would align them horizontally. |
| `updateInterval` | `5 * 60 * 1000` (5 minutes) | How often to update the state of your devices, in milliseconds. |
