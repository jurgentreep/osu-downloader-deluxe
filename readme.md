# osu! downloader deluxe

Download all beatmaps from a list of mappers

## Installation

1. Install node.js from their [website](https://nodejs.org)
2. Install the dependencies
```
npm install
```
3. Create an environment file
```
cp .env.example .env
```
4. Fill out the `.env` file
5. Create a `mappers.txt` file and add the names or ids of your favorite mappers to it (one per line)

## Usage

1. Run the app
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
