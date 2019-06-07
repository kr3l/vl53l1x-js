const VL53L1X = require('./index'); // require('vl53xl1-js')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
        const start = new Date();
        for (let i = 0; i < 100; i += 1) {
            let isReady = 0;
            while (!isReady) {
                isReady = VL53L1X.CheckForDataReady(device);
                await sleep(10);
            }
            const distance = VL53L1X.GetDistance(device);
            console.log(`Distance = ${distance}`);
            VL53L1X.ClearInterrupt(device);
            // await sleep(1000);
        }
        const end = new Date();
        console.log(`Rate: ${100000/(end-start)}Hz`);
    } finally {

        VL53L1X.StopRanging(device);
    }
}

main();

module.exports = VL53L1X;