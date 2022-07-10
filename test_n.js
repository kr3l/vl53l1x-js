const VL53L1X = require('./vl53l1x');
const I2C = require('raspi-i2c').I2C;
const NUM_OF_DATA = 500;
const NUM_OF_CAL = 50;
const DEFAULT_OFFSETS_FILE = "./vl53l1x-offsets.json";
const DEFAULT_XTALKS_FILE = "./vl53l1x-xtalks.json";

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

// -n
const nSensors = (() => {
    const nSensors = argv.n ?? 1;

    if (typeof nSensors !== 'number' || Number.isNaN(nSensors) || nSensors < 1) {
        console.error('Invalid number of sensors');
        process.exit(1);
    }

    return Math.floor(nSensors);
})();
// -i, --init
const shouldInitAddresses = argv.init ?? argv.i ?? false;
// --co, --calibrate-offsets
const shouldCalibrateOffsets = argv["calibrate-offsets"] ?? argv.co ?? false;
// --of, --offsets-file
const offsetsFile = argv["offsets-file"] ?? argv.of ?? DEFAULT_OFFSETS_FILE;
// --cx, --calibrate-xtalks
const shouldCalibrateXTalks = argv["calibrate-xtalks"] ?? argv.cx ?? false;
// --xf, --xtalks-file
const xTalksFile = argv["xtalks-file"] ?? argv.xf ?? DEFAULT_XTALKS_FILE;
// -v
const verbose = argv.v ?? false;
// -x
const addresses = (() => {
    let addresses = argv.x;

    if(!addresses) {
        // no -x was passed, so we'll use the default addresses
        if(nSensors === 1) {
            // if it's only one sensor, we'll use the default address 0x29 when we don't
            // want to init the addresses or 0x2A when we do
            addresses = shouldInitAddresses ? [0x2A] : [0x29];
        } else {
            // if it's more than one sensor, we'll use the default addresses [0x2A, 0x2B, 0x2C, 0x2D, ...]
            addresses = new Array(nSensors).fill(null).map((_, i) => 0x2A + i);
        }
    } else {
        if(typeof addresses === 'number') {
            addresses = [addresses];
        } else if (!Array.isArray(addresses)) {
            console.error('Invalid address');
            process.exit(1);
        }

        if(addresses.length !== nSensors) {
            console.error('Please provide the correct amount of addresses');
            process.exit(1);
        }

        addresses.forEach(address => {
            if(typeof address !== 'number' || Number.isNaN(address) || address < 1 || address > 0xFF) {
                console.error(`Invalid address ${address}`);
                process.exit(1);
            }
        });
    }

    return addresses;
})();

const log = verbose ? console.log : () => {};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForEnter(msg) {
    if (msg && typeof msg === 'string') {
        process.stdout.write(msg);
    }
    return new Promise(resolve => {
        process.stdin.once('data', () => resolve());
    });
}

function numberToHex(n) {
    return `0x${n.toString(16).toUpperCase()}`;
}

async function main () {
    const sensor = new VL53L1X ({
        //acrescentar array de sensor addresses
        i2c: new I2C(),
        address: 0x2A
    });

    const sensor2 = new VL53L1X ({

    });

    //Sensor ID
    const sensorId = await sensor.getSensorId();
    console.log(`sensorId = ${sensorId}`);

    //Boot State
    await sensor.waitForBooted(2000);

    //Initiate the sensor
    await sensor.sensorInit();

    await sensor.changeAddress(0x2A);

    //Distance Mode = LONG
    await sensor.setDistanceMode(VL53L1X.DISTANCE_MODE_LONG);
    const distanceMode = await sensor.getDistanceMode();
    console.log(`distanceMode = ${distanceMode === VL53L1X.DISTANCE_MODE_SHORT ? 'SHORT' : 'LONG'}`);

    //Timing Budget
    const timingBudgetInMs = await sensor.getTimingBudgetInMs();
    console.log(`timing budget = ${timingBudgetInMs}ms`);

    //Inter Measurement Interval
    const iM = await sensor.getInterMeasurementInMs();
    console.log(`inter measurement interval = ${iM}ms`);
    
    /*const jsonData = fetch(configs.json); 
    const file = JSON.parse(jsonData);
    console.log("tou aqui");
    console.log(file);*/

    
    try {

        const d = new Date();
        console.log(`\n${d}\n`);

        //RefSPAD Calibration
        //??

        //Ofset Calibration
        //normal procedure:
        await sensor.setOffset(await sensor.calculateOffsetCalibration(0));
        //await sensor.setOffset(7.633599999999999);
        console.log('\nOffset: ' + await sensor.getOffset() + '\n');
/*
        //for tests, calibrate offset 50 times and get the medium value for the tests in this situation
        console.log('\nAvg Distance,Offset');
        let sum_offset = 0;
        let sum_dist = 0;
        for (let index = 0; index < NUM_OF_CAL; index++) {
            let a = await sensor.calculateOffsetCalibration(140);
            sum_offset += a;
            //await sensor.setOffset(a);
            //let b = await sensor.getDistance();
            //sum_dist += b;
        }
        sum_offset = sum_offset/NUM_OF_CAL;
        console.log(`AVG OFFSET VALUE = ${sum_offset} mm`);
        //sum_dist = sum_dist/NUM_OF_CAL;
        //console.log(`Avg distance measured each offset: ${sum_dist} mm`);
        await sensor.setOffset(sum_offset);
        console.log('\nOffset: ' + await sensor.getOffset() + '\n');
*/

        //Xtalk Calibration (should only be performed if there is a cover glass)
        //await sensor.setXtalk(await sensor.calibrateXtalk(140));


        //Start Ranging
        await sensor.startRanging();
        let data_array = [];
        let time_array = [];
        let distance_array = [];

        
        //Long Distance Mode set of data
        const start = new Date();
        let count = 0;
        let real = 3500; //real distance
        console.log('Real distance,Distance measured');
        for (let i = 0; i < NUM_OF_DATA; i += 1) {
            await sensor.waitForDataReady();
            const distance = await sensor.getDistance();
            //console.log(`Distance = ${distance} mm`);
            console.log(`${real},${distance}`);
            count += distance;
            const aux = new Date();
            let timex = aux-start;
            //console.log(`Time = ${timex/1000} s`);
            const rangeStatus = await sensor.getRangeStatus();
            //console.log(`Range status = ${rangeStatus}`);
            data_array.push({"time": timex, "distance": distance});
            time_array.push(timex);
            distance_array.push(distance);
            await sensor.clearInterrupt();
            await sleep(500);
        }
        //console.log(data_array);
        console.log(`\nAverage measuremt: ${count/NUM_OF_DATA} mm`);
        const end = new Date();
        console.log(`Tempo de medição: ${(end.getTime() - start.getTime())/1000}`);

        //export_to_csv(data_array,"data.csv");
        
        //stringify(data_array, { header: true }, function (err, output) {
        //    fs.writeFile(__dirname+'/someData.csv', output);
        //    console.log('File created successfuly');
        //});

        
        /*
        //Distance Mode = SHORT
        await sensor.setDistanceMode(VL53L1X.DISTANCE_MODE_SHORT);
        const distanceMode2 = await sensor.getDistanceMode();
        console.log(`distanceMode = ${distanceMode2 === VL53L1X.DISTANCE_MODE_SHORT ? 'SHORT' : 'LONG'}`);
        const timingBudgetInMs2 = await sensor.getTimingBudgetInMs();
        //console.log(`timing budget = ${timingBudgetInMs2}ms`);

        //Short Distance Mode set of data
        for (let i = 0; i < NUM_OF_DATA; i += 1) {
            await sensor.waitForDataReady();
            const distance = await sensor.getDistance();
            console.log(`Distance = ${distance} mm`);
            const rangeStatus = await sensor.getRangeStatus();
            console.log(`Range status = ${rangeStatus}`);
            await sensor.clearInterrupt();
            await sleep(500);
        }

        const end = new Date();
        console.log(`Rate: ${100000/(end-start)}Hz`);
        */

    } finally {
        await sensor.stopRanging();
    }

}

main();


module.exports = VL53L1X;