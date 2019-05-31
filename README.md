# vl53l1x-js
js library for the VL53L1X Laser Ranger

A js wrapper around the Raspberry PI sample code distributed with 
Waveshare VL53L1X distance sensor (https://www.waveshare.com/wiki/VL53L1X_Distance_Sensor). This sample code
is in turn based on code written by Nathan Seidle @ SparkFun Electronics, April 12th, 2018 (https://www.sparkfun.com/products/14667).

# Installation

```
npm install https://github.com/kr3l/vl53l1x-js#1.0.1 --save
```

This should start a node-gyp rebuild.

# Usage

```js
const VL53L1X = require('vl53l1x-js');

async function sleep(ms) {
    return new Promise((resolve, reject) => {
          setTimeout(resolve, ms);
    });
}

async function main () {

    const distance = new VL53L1X.VL53L1X();

    distance.begin();

    distance.startMeasurement(0);
    for (let i = 0; i < 100; i += 1) {
        while(distance.newDataReady() == false){
            await sleep(10);
        }
        await sleep(100);

        console.log(`Distance(mm): ${distance.getDistance()}`);

    }
}

main();
```