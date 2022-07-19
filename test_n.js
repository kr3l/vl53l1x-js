const fs = require('fs');
const VL53L1X = require('./vl53l1x');
const I2C = require('raspi-i2c').I2C;
const NUM_OF_DATA = 128;
const NUM_OF_CAL = 50;
const DEFAULT_OFFSETS_FILE = "./vl53l1x-offsets.json";
const DEFAULT_XTALKS_FILE = "./vl53l1x-xtalks.json";

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

const i2c = new I2C();

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

function getCurrentEpochMs() {
    return (new Date()).valueOf()
}

async function getSensors(addresses, changeAddresses = false) {
    const sensors = new Array(addresses.length)
        .fill(null)
        .map((_, i) => new VL53L1X({
            i2c,
            address: changeAddresses ? 0x29 : addresses[i]
        }));

    if (changeAddresses) {
        console.log(`Setting address${addresses.length > 1 ? 'es' : ''} to ${addresses.map(numberToHex).join(', ')}`);

        for (const i in sensors) {
            const sensor = sensors[i];
            await waitForEnter(`Press enter to set address of sensor ${i} to ${numberToHex(addresses[i])}...`);
            await sensor.waitForBooted();
            await sensor.sensorInit();
            await sensor.setDistanceMode(VL53L1X.DISTANCE_MODE_LONG);
            await sensor.changeAddress(addresses[i]);
        }
    } else {
        for (const sensor of sensors) {
            await sensor.waitForBooted();
            await sensor.sensorInit();
            await sensor.setDistanceMode(VL53L1X.DISTANCE_MODE_LONG);
            
        }
    }

    return sensors;
}

async function getSavedJSON(offsetsFile) {
    const exists = await new Promise((res, rej) => {
        fs.stat(offsetsFile, (err, stats) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res(false);
                } else {
                    rej(err);
                }
            } else {
                res(stats.isFile());
            }
        });
    });

    if (exists) {
        return JSON.parse(await new Promise((res, rej) => {
            fs.readFile(offsetsFile, (err, data) => {
                if (err) {
                    rej(err);
                } else {
                    res(data.toString("utf8"));
                }
            });
        }));
    }

    return null;
}

function saveJSON(offsets, offsetsFile) {
    return new Promise((res, rej) => {
        fs.writeFile(offsetsFile, JSON.stringify(offsets), err => {
            if (err) {
                rej(err);
            } else {
                res();
            }
        });
    });
}

async function calibrateSensorsOffsets(sensors, savedOffsets) {
    if (!savedOffsets || savedOffsets.length !== sensors.length) {
        console.log("Calibrating sensors' offsets (use 140mm distance as reference)...")
        savedOffsets = new Array(sensors.length).fill(0);
        for (const i in sensors) {
            const sensor = sensors[i];
            await waitForEnter(`Press enter to calibrate sensor ${i} (${numberToHex(sensor.address)})...`);
            const offset = await sensor.calculateOffsetCalibration(140);
            console.log(`Sensor ${i} offset: ${offset}`);
            savedOffsets[i] = offset;
        }
    }

    for (const i in sensors) {
        const sensor = sensors[i];
        await sensor.setOffset(savedOffsets[i]);
    }

    return savedOffsets;
}

// Crosstalk calibration distance
async function getXcd(sensor) {
    // console.log(`Press enter to get the cross-talk calibration distance of sensor at address ${numberToHex(sensor.address)}...`);
    const startTime = getCurrentEpochMs();
    let xcd = 0;
    await sensor.startRanging();
    while (getCurrentEpochMs() - startTime < 10000) {
        xcd = Math.max(xcd, await sensor.getDistance());
        await sleep(1);
    }
    await sensor.stopRanging();
    return xcd;
}

async function calibrateSensorsXTalk(sensors, savedXTalks) {
    if (!savedXTalks || savedXTalks.length !== sensors.length) {
        console.log("Calibrating sensors' xtalk (increase the distance from the sensor over 10 seconds)...")
        savedXTalks = new Array(sensors.length).fill(0);
        for (const i in sensors) {
            const sensor = sensors[i];
            await waitForEnter(`Press enter to start calibrating sensor ${i}'s xtalk (${numberToHex(sensor.address)})...`);
            const xcd = await getXcd(sensor);
            await waitForEnter(`Set the distance from sensor ${i} to ${xcd}mm and press enter...`);
            //Aqui estava calculateOffsetCalibration em vez de calibrateSensorsXTalk
            const xtalk = await sensor.calculateXTalkCalibration(xcd);
            console.log(`Sensor ${i} xtalk: ${xtalk} (xcd = ${xcd})`);
            savedXTalks[i] = xtalk;
        }
    }

    for (const i in sensors) {
        await sensors[i].setXTalk(savedXTalks[i]);
    }

    return savedXTalks;
}

async function main () {
    log(addresses);

    const sensors = await getSensors(addresses, shouldInitAddresses);

    let exitCode = 0;
    let roi_center = await sensors[0].getROICenter();
    console.log(`ROI Center: ${roi_center}`);

    let roi_xy = await sensors[0].getROI_XY();
    console.log(`ROI_XY: ${roi_xy}`);
    
    await sensors[0].setROI(4,4);
    roi_xy = await sensors[0].getROI_XY();
    console.log(`ROI_XY: ${roi_xy}`);
    
    await sensors[0].setROI(16,16);
    roi_xy = await sensors[0].getROI_XY();
    console.log(`ROI_XY: ${roi_xy}`);

    try {
        // console.log(sensors);

        {
            let offsets = shouldCalibrateOffsets ? null : await getSavedJSON(offsetsFile);

            if (!offsets || !Array.isArray(offsets) || offsets.length !== sensors.length) {
                offsets = await calibrateSensorsOffsets(sensors);
                await saveJSON(offsets, offsetsFile);
            } else {
                const usedOffsets = await calibrateSensorsOffsets(sensors, offsets);
                if (usedOffsets !== offsets) {
                    offsets = usedOffsets;
                    await saveJSON(offsets, offsetsFile);
                }
            }

            //console.log({offsets});
        }

        {
            let xTalks = shouldCalibrateXTalks ? null : await getSavedJSON(xTalksFile);

            if (!xTalks || !Array.isArray(xTalks) || xTalks.length !== sensors.length) {
                xTalks = await calibrateSensorsXTalk(sensors);
                await saveJSON(xTalks, xTalksFile);
            } else {
                const usedXtalks = await calibrateSensorsXTalk(sensors, xTalks);
                if (usedXtalks !== xTalks) {
                    xTalks = usedXtalks;
                    await saveJSON(xTalks, xTalksFile);
                }
            }

            //console.log({xTalks});
        }
        let real = 50; //real distance;
        let measures = [real];
        let distance = 0;
        let header = ['real distance'];
        for (const i in sensors) {
            const sensor = sensors[i];
            header.push(sensor.address);
        }
        console.log(header.join(","));

        while(real <= 4000) {
            await waitForEnter(`Set the distance from sensors to ${real/10}cm. Press ENTER to continue...`);
            for (let j = 0; j < NUM_OF_DATA; j++) {
                for (const i in sensors) {
                    const sensor = sensors[i];
                    await sensor.startRanging();
                    
                    distance = await sensor.getDistance();
                    await sleep(10);
        
                    measures.push([distance]);
                    header.push(sensor.address);
                    await sensor.stopRanging();
                }
                console.log(measures.join(","));
                measures = [real];
            }
            
            real += 50;
        }
        


    } catch (e) {
        console.error(e)
        exitCode = 1;
    } finally {
        for (const i in sensors) {
            await sensors[i].stopRanging();
        }
        process.exit(exitCode);
    }

    return;

    //Sensor ID
    //const sensorId = await sensor.getSensorId();
    //console.log(`sensorId = ${sensorId}`);

    //Boot State
    //await sensor.waitForBooted(2000);

    //Initiate the sensor
    //await sensor.sensorInit();

    //await sensor.changeAddress(0x29);

    //Distance Mode = LONG
    await sensors.setDistanceMode(VL53L1X.DISTANCE_MODE_LONG);
    sensors.forEach(await this.setDistanceMode(VL53L1X.DISTANCE_MODE_LONG));
    const distanceMode = await sensors.getDistanceMode();
    console.log(`distanceMode = ${distanceMode === VL53L1X.DISTANCE_MODE_SHORT ? 'SHORT' : 'LONG'}`);

    //Timing Budget
    const timingBudgetInMs = await sensors.getTimingBudgetInMs();
    console.log(`timing budget = ${timingBudgetInMs}ms`);

    //Inter Measurement Interval
    const iM = await sensors.getInterMeasurementInMs();
    console.log(`inter measurement interval = ${iM}ms`);
    
    
    try {

        const d = new Date();
        console.log(`\n${d}\n`);

        //RefSPAD Calibration
        //??

        //Ofset Calibration
        //normal procedure:
        await sensors.setOffset(await sensors.calculateOffsetCalibration(140));
        //await sensor.setOffset(7.633599999999999);
        console.log('\nOffset: ' + await sensors.getOffset() + '\n');
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
        await sensors.startRanging();
        let data_array = [];
        let time_array = [];
        let distance_array = [];

        
        //Long Distance Mode set of data
        const start = new Date();
        let count = 0;
        let real = 3500; //real distance
        console.log('Real distance,Distance measured');
        for (let i = 0; i < NUM_OF_DATA; i += 1) {
            await sensors.waitForDataReady();
            const distance = await sensors.getDistance();
            //console.log(`Distance = ${distance} mm`);
            console.log(`${real},${distance}`);
            count += distance;
            const aux = new Date();
            let timex = aux-start;
            //console.log(`Time = ${timex/1000} s`);
            const rangeStatus = await sensors.getRangeStatus();
            //console.log(`Range status = ${rangeStatus}`);
            data_array.push({"time": timex, "distance": distance});
            time_array.push(timex);
            distance_array.push(distance);
            await sensors.clearInterrupt();
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
        await sensors.stopRanging();
    }

}

main().catch(console.error);


module.exports = VL53L1X;