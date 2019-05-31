//index.js
const VL53L1X = require('./build/Release/VL53L1X.node');


console.log(VL53L1X);

console.log(VL53L1X.GetSWVersion());

module.exports = VL53L1X;