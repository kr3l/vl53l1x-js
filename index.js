//index.js
const VL53L1X = require('./build/Release/VL53L1X.node');

async function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

async function main () {
    console.log(VL53L1X);

    const a = VL53L1X.GetSWVersion();
    console.log(a);

    const device = VL53L1X.SetupPort();
    console.log(`Device: ${device}`);


    const status = VL53L1X.SensorInit(device);
    console.log(`SensorInit status: ${status}`);

    const status1 = VL53L1X.StartRanging(device);
    console.log(`StartRanging status: ${status1}`);

    let isReady = 0;
    while (!isReady) {
        isReady = VL53L1X.CheckForDataReady(device);
        console.log(`CheckForDataReady status: ${isReady}`);
        await sleep(50);
    }
    console.log(`ready!`);

    const distance = VL53L1X.GetDistance(device);
    console.log(`Distance = ${distance}`);
}

main();

module.exports = VL53L1X;