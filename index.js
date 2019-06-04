//index.js
const VL53L1X = require('./build/Release/VL53L1X.node');

async function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

async function main () {
    console.log(VL53L1X);

    console.log('GetSWVersion...');
    const a = VL53L1X.GetSWVersion();
    console.log(a);

    console.log('SetupPort...');
    const device = VL53L1X.SetupPort();
    console.log(`Device: ${device}`);

    console.log('SensorInit...');
    const status = VL53L1X.SensorInit(device);
    console.log(`SensorInit status: ${status}`);

    try {
        console.log('StartRanging...');
        const status1 = VL53L1X.StartRanging(device);
        console.log(`StartRanging status: ${status1}`);

        while (true) {
            console.log('CheckForDataReady...');
            let isReady = 0;
            while (!isReady) {
                isReady = VL53L1X.CheckForDataReady(device);
                console.log(`CheckForDataReady ready = ${isReady}`);
                await sleep(100);
            }
            console.log(`ready!`);

            console.log('GetDistance...');
            const distance = VL53L1X.GetDistance(device);
            console.log(`Distance = ${distance}`);
            await sleep(1000);
        }
    } finally {
        VL53L1X.ClearInterrupt(device);
        VL53L1X.StopRanging(device);
    }
}

main();

module.exports = VL53L1X;