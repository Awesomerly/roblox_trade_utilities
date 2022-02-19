# rbxtradebot
![Graph](https://i.imgur.com/m4UhZpS.png)

## Setup
* Install node.js (I use v16 LTS) via whatever method you desire.
* Use npm or pnpm (`npm install -g pnpm`) to install the packages.
* Copy `.env.example` to a new file called `.env` and 
install packages then put your roblosecurity in a .env file like in the example
* Make sure to tweak the config file to your liking before running the program with `node index.js`
  * If you're feeling extra, you can use the included sample systemd service file to run your bot automatically on startup and restart whenever there's an uncaught error. [Here's a good blogpost.](https://blog.r0b.io/post/running-node-js-as-a-systemd-service/)  
  * A sample command for viewing logs from the bot is `journalctl -u tradebot -n 100 -o cat -f`

## Code map
* /api/ has wrappers for apis, including a fetch wrapper.
* /modules/ has random useful code bits
* /routines/ has all the tasks that run in a loop; init.js starts everything

## Features
Sniper, Pricewar, Bot Defender, Trade Message Archival, more to come.
