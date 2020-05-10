# osu! downloader deluxe

Download all beatmaps from a list of mappers

## Installation

1. Install node.js (version 8 or later) from their [website](https://nodejs.org).
2. Install the dependencies.

    ```
    npm ci
    ```

3. Run the app once and let it create the required files.

    ```
    npm start
    ```

4. Fill out the information in the `.env` file and add mappers to `mappers.txt` file.

## Usage

1. Run the app.

    ```
    npm start
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
