import { config } from 'dotenv';
config()

import startEverything from './routines/init.js'

await startEverything()
console.log("started :)")
