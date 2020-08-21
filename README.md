# MMM-MyQ

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://raw.githubusercontent.com/parnic/MMM-MyQ/main/LICENSE)

MyQ module for MagicMirror²

## Dependencies

* An installation of [MagicMirror²](https://github.com/MichMich/MagicMirror)
* npm

## Installation

1. Clone this repo into `~/MagicMirror/modules` directory.
1. Configure your `~/MagicMirror/config/config.js`:

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
| `updateInterval` | `5 * 60 * 1000` | How often to update the state of your devices, in milliseconds. |
