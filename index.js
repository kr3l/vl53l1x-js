//index.js
const VL53L1X = require('./build/Release/VL53L1X.node');


console.log(VL53L1X);

const a = VL53L1X.GetSWVersion();
console.log(a);

module.exports = VL53L1X;