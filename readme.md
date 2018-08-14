# osu! downloader deluxe

Download all beatmaps from a list of mappers

## Installation

1. Install node.js (version 8 or later) from their [website](https://nodejs.org).
2. Install the dependencies.
    ```
    npm install
    ```
3. Run the app once and let it create the required files.
    ```
    node app.js
    ```
4. Fill out the information in the `.env` file and add mappers to `mappers.txt` file.

## Usage

1. Run the app.
    ```
    node app.js
    ```

## Todo
* Show progress
* Parrallel downloads
    * RxJs
* Npm run scripts
* Functional programming
* Speed limitation
* GUI
* Detect when network connection has dropped
* Store cookie somewhere and use it to login
