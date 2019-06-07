# vl53l1x-js

Javascript library for the VL53L1X Laser Ranger. It wraps the ST C++ API code using napi.

# Installation

```
npm install https://github.com/kr3l/vl53l1x-js#1.0.1 --save
```

This should start a node-gyp rebuild.

# Usage


```js
const VL53L1X = require('vl53xl1-js');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main () {
    const device = VL53L1X.SetupPort();
    VL53L1X.SensorInit(device);

    try {
        VL53L1X.StartRanging(device);

        for (let i = 0; i < 100; i += 1) {
            let isReady = 0;
            while (!isReady) {
                isReady = VL53L1X.CheckForDataReady(device);
                await sleep(100);
            }
            const distance = VL53L1X.GetDistance(device);
            console.log(`Distance = ${distance}`);
            VL53L1X.ClearInterrupt(device);
        }
    } finally {

        VL53L1X.StopRanging(device);
    }
}

main();
```

# References

* The API code from ST is in ```cppsrc/ST```. I renamed the ```.c``` files to ```.cpp``` to avoid problems.
* The ```vl53l1_platform.cpp``` file contains the I2c communication. ST provides empty functions, they were
implemented based on the I2C communication code in <https://www.waveshare.com/wiki/VL53L1X_Distance_Sensor>.
* The code in ```cppsrc/wrapper``` wraps the most important calls in ```cppsrc/ST/VL53L1X_api.cpp``` using napi, so they are exposed to javascript. 
The wrapping is based on the excellent tutorial at <https://medium.com/@atulanand94/beginners-guide-to-writing-nodejs-addons-using-c-and-n-api-node-addon-api-9b3b718a9a7f>.

# Remaining work

The basics work, but not all methods in ```vl53l1_platform.cpp``` are exposed to javascript yet. Not even all methods in ```vl53l1_platform.cpp``` are implemented already.
