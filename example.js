const VL53L1X = require('./vl53l1x');
const I2C = require('raspi-i2c').I2C;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main () {
    const sensor = new VL53L1X({
        i2c: new I2C(),
    });

    const sensorId = await sensor.getSensorId();
    console.log(`sensorId = ${sensorId}`);
    console.log(sensorId);  // EEAC instead of 0xEEAC ?

    const bootState = await sensor.bootState();
    console.log(`bootState = ${bootState}`);

    console.log('sensor init');
    await sensor.sensorInit();

    const distanceMode = await sensor.getDistanceMode();
    console.log(`distanceMode = ${distanceMode === VL53L1X.DISTANCE_MODE_SHORT ? 'SHORT' : 'LONG'}`);

    const timingBudgetInMs = await sensor.getTimingBudgetInMs();
    console.log(`timing budget = ${timingBudgetInMs}ms`);

    const iM = await sensor.getInterMeasurementInMs();
    console.log(`inter measurement interval = ${iM}ms`);

    try {
        console.log('StartRanging...');
        await sensor.startRanging();
        const start = new Date();
        for (let i = 0; i < 10; i += 1) {
            await sensor.waitForDataReady();
            const distance = await sensor.getDistance();
            console.log(`Distance = ${distance}`);

            const rangeStatus = await sensor.getRangeStatus();
            console.log(`Range status = ${rangeStatus}`);

            await sensor.clearInterrupt();
            await sleep(500);
        }

        console.log('switch to short distance mode');
        await sensor.setDistanceMode(VL53L1X.DISTANCE_MODE_SHORT);

        const distanceMode2 = await sensor.getDistanceMode();
        console.log(`distanceMode = ${distanceMode2 === VL53L1X.DISTANCE_MODE_SHORT ? 'SHORT' : 'LONG'}`);

        const timingBudgetInMs2 = await sensor.getTimingBudgetInMs();
        console.log(`timing budget = ${timingBudgetInMs2}ms`);

        for (let i = 0; i < 10; i += 1) {
            await sensor.waitForDataReady();
            const distance = await sensor.getDistance();
            console.log(`Distance = ${distance}`);
            await sensor.clearInterrupt();
            await sleep(500);
        }

        const end = new Date();
        console.log(`Rate: ${100000/(end-start)}Hz`);
    } finally {

        await sensor.stopRanging();
    }
}

main();

module.exports = VL53L1X;