const VL53L1X = require('./vl53l1x');
const I2C = require('raspi-i2c').I2C;

async function main () {
    const sensor = new VL53L1X({
        i2c: new I2C(),
    });

    const sensorId = await sensor.getSensorId();
    console.log(`sensorId = ${sensorId}`);
    console.log(sensorId);  // EEAC instead of 0xEEAC ?

    console.log('sensor init');
    await sensor.sensorInit();

    try {
        console.log('StartRanging...');
        await sensor.startRanging();
        const start = new Date();
        for (let i = 0; i < 100; i += 1) {
            console.log('waitForDataReady...');
            await sensor.waitForDataReady();
            console.log('getDistance...');
            const distance = await sensor.getDistance();
            console.log(`Distance = ${distance}`);
            await sensor.clearInterrupt();
            // await sleep(1000);
        }
        const end = new Date();
        console.log(`Rate: ${100000/(end-start)}Hz`);
    } finally {

        await sensor.stopRanging();
    }
}

main();

module.exports = VL53L1X;