//index.js
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
        await sleep(100);

        console.log(`Distance(mm): ${distance.getDistance()}`);

    }
}

main();