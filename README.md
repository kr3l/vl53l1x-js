# vl53l1x-js
js library for the VL53L1X Laser Ranger

# Installation

```
npm install https://github.com/kr3l/vl53l1x-js#1.0.1 --save
```

This should start a node-gyp rebuild.

# References

* The API code from ST is in ```cppsrc/ST```. I renamed the ```.c``` files to ```.cpp``` to avoid problems.
* The ```vl53l1_platform.cpp``` file contains the I2c communication. ST provides empty functions, they were
implemented based on the I2C communication code in <https://www.waveshare.com/wiki/VL53L1X_Distance_Sensor>.
* The code in ```cppsrc/wrapper``` wraps the most important calls in ```cppsrc/ST/VL53L1X_api.cpp``` using napi, so they are exposed to javascript. 
The wrapping is based on the excellent tutorial at <https://medium.com/@atulanand94/beginners-guide-to-writing-nodejs-addons-using-c-and-n-api-node-addon-api-9b3b718a9a7f>.

# Remaining work

The basics work, but not all methods in ```vl53l1_platform.cpp``` are exposed to javascript yet. Not even all methods in ```vl53l1_platform.cpp``` are implemented already.

# Usage

```js
const VL53L1X = require('./index');

async function sleep(ms) {
    return new Promise((resolve, reject) => {
          setTimeout(resolve, ms);
    });
}

async function main () {

    const distance = new VL53L1X();

    distance.begin();

    distance.startMeasurement(0);
    for (let i = 0; i < 100; i += 1) {
        while(distance.newDataReady() == false){
            await sleep(10);
        }
        await sleep(100); // optional

        console.log(`Distance(mm): ${distance.getDistance()}`);

    }
}

main();
```