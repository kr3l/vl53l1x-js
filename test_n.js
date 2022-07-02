const VL53L1X = require('./vl53l1x');
const I2C = require('raspi-i2c').I2C;
const NUM_OF_DATA = 500;
const NUM_OF_CAL = 50;


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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