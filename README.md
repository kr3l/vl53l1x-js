# vl53l1x-js

Javascript library for the VL53L1X Laser Ranger. This code is a javascript port of some of the 
C api code provided by STMicroelectronics.

Tested on Raspberry PI Zero.

# Installation

```
npm install https://github.com/kr3l/vl53l1x-js#1.0.1 --save
```

# Usage

```js
const VL53L1X = require('vl53xl1-js');
const I2C = require('raspi-i2c').I2C;

async function main () {
    const sensor = new VL53L1X({
        i2c: new I2C(),
    });
    await sensor.sensorInit();
    try {
        console.log('StartRanging...');
        await sensor.startRanging();
        const start = new Date();
        for (let i = 0; i < 100; i += 1) {
            await sensor.waitForDataReady();
            const distance = await sensor.getDistance();
            console.log(`Distance = ${distance}`);
            await sensor.clearInterrupt();
        }
        const end = new Date();
        console.log(`Rate: ${100000/(end-start)}Hz`);
    } finally {
        await sensor.stopRanging();
    }
}

main();
```

# References

* Original code in C: https://www.st.com/en/imaging-and-photonics-solutions/vl53l1x.html#tools-software

# Remaining work

Only the basics were ported: get distance measurements