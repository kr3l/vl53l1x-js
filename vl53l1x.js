/**
 * This code is a javascript adaptation of (a part of) the C API code provided by ST.
 *
 * https://www.st.com/en/imaging-and-photonics-solutions/vl53l1x.html#tools-software
 */

/*******************************************************************************
 Copyright Ã‚Â© 2018, STMicroelectronics International N.V.
 All rights reserved.
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 * Neither the name of STMicroelectronics nor the
 names of its contributors may be used to endorse or promote products
 derived from this software without specific prior written permission.
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
 NON-INFRINGEMENT OF INTELLECTUAL PROPERTY RIGHTS ARE DISCLAIMED.
 IN NO EVENT SHALL STMICROELECTRONICS INTERNATIONAL N.V. BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/

const util = require('util');

const SOFT_RESET = 0x0000;
const VL53L1_I2C_SLAVE__DEVICE_ADDRESS = 0x0001;
const VL53L1_VHV_CONFIG__TIMEOUT_MACROP_LOOP_BOUND = 0x0008;
const ALGO__CROSSTALK_COMPENSATION_PLANE_OFFSET_KCPS =	0x0016;
const ALGO__CROSSTALK_COMPENSATION_X_PLANE_GRADIENT_KCPS =	0x0018;
const ALGO__CROSSTALK_COMPENSATION_Y_PLANE_GRADIENT_KCPS =	0x001A;
const ALGO__PART_TO_PART_RANGE_OFFSET_MM = 0x001E;
const MM_CONFIG__INNER_OFFSET_MM = 0x0020;
const MM_CONFIG__OUTER_OFFSET_MM = 0x0022;
const GPIO_HV_MUX__CTRL	= 0x0030;
const GPIO__TIO_HV_STATUS = 0x0031;
const SYSTEM__INTERRUPT_CONFIG_GPIO	= 0x0046;
const PHASECAL_CONFIG__TIMEOUT_MACROP = 0x004B;
const RANGE_CONFIG__TIMEOUT_MACROP_A_HI = 0x005E;
const RANGE_CONFIG__VCSEL_PERIOD_A = 0x0060;
const RANGE_CONFIG__VCSEL_PERIOD_B = 0x0063;
const RANGE_CONFIG__TIMEOUT_MACROP_B_HI	= 0x0061;
const RANGE_CONFIG__TIMEOUT_MACROP_B_LO	= 0x0062;
const RANGE_CONFIG__SIGMA_THRESH = 0x0064;
const RANGE_CONFIG__MIN_COUNT_RATE_RTN_LIMIT_MCPS = 0x0066;
const RANGE_CONFIG__VALID_PHASE_HIGH = 0x0069;
const VL53L1_SYSTEM__INTERMEASUREMENT_PERIOD = 0x006C;
const SYSTEM__THRESH_HIGH = 0x0072;
const SYSTEM__THRESH_LOW = 0x0074;
const SD_CONFIG__WOI_SD0 = 0x0078;
const SD_CONFIG__INITIAL_PHASE_SD0 = 0x007A;
const ROI_CONFIG__USER_ROI_CENTRE_SPAD = 0x007F;
const ROI_CONFIG__USER_ROI_REQUESTED_GLOBAL_XY_SIZE = 0x0080;
const SYSTEM__SEQUENCE_CONFIG = 0x0081;
const VL53L1_SYSTEM__GROUPED_PARAMETER_HOLD = 0x0082;
const SYSTEM__INTERRUPT_CLEAR = 0x0086;
const SYSTEM__MODE_START = 0x0087;
const VL53L1_RESULT__RANGE_STATUS = 0x0089;
const VL53L1_RESULT__DSS_ACTUAL_EFFECTIVE_SPADS_SD0 = 0x008C;
const RESULT__AMBIENT_COUNT_RATE_MCPS_SD = 0x0090;
const VL53L1_RESULT__FINAL_CROSSTALK_CORRECTED_RANGE_MM_SD0 = 0x0096;
const VL53L1_RESULT__PEAK_SIGNAL_COUNT_RATE_CROSSTALK_CORRECTED_MCPS_SD0 = 0x0098;
const VL53L1_RESULT__OSC_CALIBRATE_VAL = 0x00DE;
const VL53L1_FIRMWARE__SYSTEM_STATUS = 0x00E5;
const VL53L1_IDENTIFICATION__MODEL_ID = 0x010F;
const VL53L1_ROI_CONFIG__MODE_ROI_CENTRE_SPAD = 0x013E;

const VL51L1X_DEFAULT_CONFIGURATION = [
    0x00, /* 0x2d : set bit 2 and 5 to 1 for fast plus mode (1MHz I2C), else don't touch */
    0x00, /* 0x2e : bit 0 if I2C pulled up at 1.8V, else set bit 0 to 1 (pull up at AVDD) */
    0x00, /* 0x2f : bit 0 if GPIO pulled up at 1.8V, else set bit 0 to 1 (pull up at AVDD) */
    0x01, /* 0x30 : set bit 4 to 0 for active high interrupt and 1 for active low (bits 3:0 must be 0x1), use SetInterruptPolarity() */
    0x02, /* 0x31 : bit 1 = interrupt depending on the polarity, use CheckForDataReady() */
    0x00, /* 0x32 : not user-modifiable */
    0x02, /* 0x33 : not user-modifiable */
    0x08, /* 0x34 : not user-modifiable */
    0x00, /* 0x35 : not user-modifiable */
    0x08, /* 0x36 : not user-modifiable */
    0x10, /* 0x37 : not user-modifiable */
    0x01, /* 0x38 : not user-modifiable */
    0x01, /* 0x39 : not user-modifiable */
    0x00, /* 0x3a : not user-modifiable */
    0x00, /* 0x3b : not user-modifiable */
    0x00, /* 0x3c : not user-modifiable */
    0x00, /* 0x3d : not user-modifiable */
    0xff, /* 0x3e : not user-modifiable */
    0x00, /* 0x3f : not user-modifiable */
    0x0F, /* 0x40 : not user-modifiable */
    0x00, /* 0x41 : not user-modifiable */
    0x00, /* 0x42 : not user-modifiable */
    0x00, /* 0x43 : not user-modifiable */
    0x00, /* 0x44 : not user-modifiable */
    0x00, /* 0x45 : not user-modifiable */
    0x20, /* 0x46 : interrupt configuration 0->level low detection, 1-> level high, 2-> Out of window, 3->In window, 0x20-> New sample ready , TBC */
    0x0b, /* 0x47 : not user-modifiable */
    0x00, /* 0x48 : not user-modifiable */
    0x00, /* 0x49 : not user-modifiable */
    0x02, /* 0x4a : not user-modifiable */
    0x0a, /* 0x4b : not user-modifiable */
    0x21, /* 0x4c : not user-modifiable */
    0x00, /* 0x4d : not user-modifiable */
    0x00, /* 0x4e : not user-modifiable */
    0x05, /* 0x4f : not user-modifiable */
    0x00, /* 0x50 : not user-modifiable */
    0x00, /* 0x51 : not user-modifiable */
    0x00, /* 0x52 : not user-modifiable */
    0x00, /* 0x53 : not user-modifiable */
    0xc8, /* 0x54 : not user-modifiable */
    0x00, /* 0x55 : not user-modifiable */
    0x00, /* 0x56 : not user-modifiable */
    0x38, /* 0x57 : not user-modifiable */
    0xff, /* 0x58 : not user-modifiable */
    0x01, /* 0x59 : not user-modifiable */
    0x00, /* 0x5a : not user-modifiable */
    0x08, /* 0x5b : not user-modifiable */
    0x00, /* 0x5c : not user-modifiable */
    0x00, /* 0x5d : not user-modifiable */
    0x01, /* 0x5e : not user-modifiable */
    0xcc, /* 0x5f : not user-modifiable */
    0x0f, /* 0x60 : not user-modifiable */
    0x01, /* 0x61 : not user-modifiable */
    0xf1, /* 0x62 : not user-modifiable */
    0x0d, /* 0x63 : not user-modifiable */
    0x01, /* 0x64 : Sigma threshold MSB (mm in 14.2 format for MSB+LSB), use SetSigmaThreshold(), default value 90 mm  */
    0x68, /* 0x65 : Sigma threshold LSB */
    0x00, /* 0x66 : Min count Rate MSB (MCPS in 9.7 format for MSB+LSB), use SetSignalThreshold() */
    0x80, /* 0x67 : Min count Rate LSB */
    0x08, /* 0x68 : not user-modifiable */
    0xb8, /* 0x69 : not user-modifiable */
    0x00, /* 0x6a : not user-modifiable */
    0x00, /* 0x6b : not user-modifiable */
    0x00, /* 0x6c : Intermeasurement period MSB, 32 bits register, use SetIntermeasurementInMs() */
    0x00, /* 0x6d : Intermeasurement period */
    0x0f, /* 0x6e : Intermeasurement period */
    0x89, /* 0x6f : Intermeasurement period LSB */
    0x00, /* 0x70 : not user-modifiable */
    0x00, /* 0x71 : not user-modifiable */
    0x00, /* 0x72 : distance threshold high MSB (in mm, MSB+LSB), use SetD:tanceThreshold() */
    0x00, /* 0x73 : distance threshold high LSB */
    0x00, /* 0x74 : distance threshold low MSB ( in mm, MSB+LSB), use SetD:tanceThreshold() */
    0x00, /* 0x75 : distance threshold low LSB */
    0x00, /* 0x76 : not user-modifiable */
    0x01, /* 0x77 : not user-modifiable */
    0x0f, /* 0x78 : not user-modifiable */
    0x0d, /* 0x79 : not user-modifiable */
    0x0e, /* 0x7a : not user-modifiable */
    0x0e, /* 0x7b : not user-modifiable */
    0x00, /* 0x7c : not user-modifiable */
    0x00, /* 0x7d : not user-modifiable */
    0x02, /* 0x7e : not user-modifiable */
    0xc7, /* 0x7f : ROI center, use SetROI() */
    0xff, /* 0x80 : XY ROI (X=Width, Y=Height), use SetROI() */
    0x9B, /* 0x81 : not user-modifiable */
    0x00, /* 0x82 : not user-modifiable */
    0x00, /* 0x83 : not user-modifiable */
    0x00, /* 0x84 : not user-modifiable */
    0x01, /* 0x85 : not user-modifiable */
    0x00, /* 0x86 : clear interrupt, use ClearInterrupt() */
    0x00  /* 0x87 : start ranging, use StartRanging() or StopRanging(), If you want an automatic start after VL53L1X_init() call, put 0x40 in location 0x87 */
];

const status_rtn = [ 255, 255, 255, 5, 2, 4, 1, 7, 3, 0,
    255, 255, 9, 13, 255, 255, 255, 255, 10, 6,
    255, 255, 11, 12
];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class VL53L1X {
    constructor(options) {
        this.i2c = options.i2c;
        this.address = options.address || 0x29;

        this.i2cWrite = util.promisify(this.i2c.write.bind(this.i2c, this.address));
        this.i2cRead = util.promisify(this.i2c.read.bind(this.i2c, this.address));
    }

    ////////////////////////////
    //Read and Write functions//
    ////////////////////////////

    async writeByte(index, byte) {
        const buffer = [];
        buffer[0] = index >> 8;
        buffer[1] = index & 0x00FF;
        buffer[2] = byte;
        await this.i2cWrite(Buffer.from(buffer));
        return 0;
    }

    async writeWord(index, data) {
        const buffer = [];
        buffer[0] = index >> 8;
        buffer[1] = index & 0x00FF;
        buffer[2] = data >> 8;
        buffer[3] = data & 0x00FF;
        await this.i2cWrite(Buffer.from(buffer));
        return 0;
    }

    async writeDoubleWord(index, data) {
        const buffer = [];
        buffer[0] = index >> 8;
        buffer[1] = index & 0x00FF;
        buffer[2] = (data >> 24) & 0x00FF;
        buffer[3] = (data >> 16) & 0x00FF;
        buffer[4] = (data >> 8) & 0x00FF;
        buffer[5] = data & 0x00FF;
        await this.i2cWrite(Buffer.from(buffer));
        return 0;
    }

    async readByte(index) {
        const buffer = [];
        buffer[0] = index >> 8;
        buffer[1] = index & 0x00FF;

        await this.i2cWrite(Buffer.from(buffer));

        const byte = await this.i2cRead(1)
            .then((buff) => {
                return buff[0];
            });
        return byte;
    }

    async readWord(index) {
        const buffer = [];
        buffer[0] = index >> 8;
        buffer[1] = index & 0x00FF;
        await this.i2cWrite(Buffer.from(buffer));

        const w = await this.i2cRead(2)
            .then((buff) => {
                return buff[0] << 8 | buff[1];
            });
        return w;
    }

    async readDoubleWord(index) {
        const buffer = [];
        buffer[0] = index >> 8;
        buffer[1] = index & 0x00FF;
        await this.i2cWrite(Buffer.from(buffer));
        const dw = await this.i2cRead(4)
            .then((buff) => {
                return buff[0] << 24 | buff[1] << 16 | buff[2] << 8 | buff[1];
            });
        return dw;
    }

    ///////////////////////////////
    //Mandatory Ranging functions//
    ///////////////////////////////

    async sensorInit() {
        for (let reg = 0x2D; reg <= 0x87; reg += 1) {
            await this.writeByte(reg, VL51L1X_DEFAULT_CONFIGURATION[reg - 0x2D]);
        }
        await this.startRanging();
        await this.waitForDataReady();
        await this.clearInterrupt();
        await this.stopRanging();

        await this.writeByte(VL53L1_VHV_CONFIG__TIMEOUT_MACROP_LOOP_BOUND, 0x09); /* two bounds VHV */
        await this.writeByte(0x0B, 0); /* start VHV from the previous temperature */
    }

    async startRanging() {
        await this.writeByte(SYSTEM__MODE_START, 0x40);	/* Enable VL53L1X */
    }

    async getSensorId() {
        const sensorId = await this.readWord(VL53L1_IDENTIFICATION__MODEL_ID);
        return sensorId;
    }

    async getInterruptPolarity() {
        let temp = await this.readByte(GPIO_HV_MUX__CTRL);
        temp = temp & 0x10;
        return (temp>>4) ? 0 : 1;
    }

    async checkForDataReady() {
        const intPol = await this.getInterruptPolarity();
        const temp = await this.readByte(GPIO__TIO_HV_STATUS);
        if ((temp & 1) === intPol) {
            return true;
        }
        return false;
    }

    async waitForDataReady() {
        let ready = await this.checkForDataReady();
        while (!ready) {
            await sleep(1);
            ready = await this.checkForDataReady();
        }
    }

    async clearInterrupt() {
        await this.writeByte(SYSTEM__INTERRUPT_CLEAR, 0x01);
    }

    async stopRanging() {
        await this.writeByte(SYSTEM__MODE_START, 0x00);	/* Disable VL53L1X */
    }

    async getDistance() {
        const distance = await this.readWord(VL53L1_RESULT__FINAL_CROSSTALK_CORRECTED_RANGE_MM_SD0);
        return distance;
    }


    /////////////////////////////
    //Optional driver functions//
    /////////////////////////////

    async bootState() {
        const tmp = await this.readByte(VL53L1_FIRMWARE__SYSTEM_STATUS);
        return tmp;
    }

    async getTimingBudgetInMs() {
        const temp = await this.readWord(RANGE_CONFIG__TIMEOUT_MACROP_A_HI);
        let timingBudget;
        switch (temp) {
            case 0x001D :
                timingBudget = 15;
                break;
            case 0x0051 :
            case 0x001E :
                timingBudget = 20;
                break;
            case 0x00D6 :
            case 0x0060 :
                timingBudget = 33;
                break;
            case 0x1AE :
            case 0x00AD :
                timingBudget = 50;
                break;
            case 0x02E1 :
            case 0x01CC :
                timingBudget = 100;
                break;
            case 0x03E1 :
            case 0x02D9 :
                timingBudget = 200;
                break;
            case 0x0591 :
            case 0x048F :
                timingBudget = 500;
                break;
            default:
                throw new Error(`Unexpected timing budget ${temp}`);
        }
        return timingBudget;
    }

    async setTimingBudgetInMs(timingBudgetInMs) {
        const distanceMode = await this.getDistanceMode();

        if (distanceMode === 0) {
            throw new Error('Unexpected Distance Mode');
        } else if (distanceMode === 1) {    /* Short DistanceMode */
            switch (timingBudgetInMs) {
                case 15: /* only available in short distance mode */
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_A_HI, 0x01D);
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_B_HI, 0x0027);
                    break;
                case 20:
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_A_HI, 0x0051);
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_B_HI, 0x006E);
                    break;
                case 33:
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_A_HI, 0x00D6);
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_B_HI, 0x006E);
                    break;
                case 50:
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_A_HI, 0x1AE);
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_B_HI, 0x01E8);
                    break;
                case 100:
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_A_HI, 0x02E1);
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_B_HI, 0x0388);
                    break;
                case 200:
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_A_HI, 0x03E1);
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_B_HI, 0x0496);
                    break;
                case 500:
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_A_HI, 0x0591);
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_B_HI, 0x05C1);
                    break;
                default:
                    status = 1;
                    break;
            }
        } else {
            switch (timingBudgetInMs) {
                case 20:
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_A_HI, 0x001E);
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_B_HI, 0x0022);
                    break;
                case 33:
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_A_HI, 0x0060);
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_B_HI, 0x006E);
                    break;
                case 50:
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_A_HI, 0x00AD);
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_B_HI, 0x00C6);
                    break;
                case 100:
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_A_HI, 0x01CC);
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_B_HI, 0x01EA);
                    break;
                case 200:
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_A_HI, 0x02D9);
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_B_HI, 0x02F8);
                    break;
                case 500:
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_A_HI, 0x048F);
                    await this.writeWord(RANGE_CONFIG__TIMEOUT_MACROP_B_HI, 0x04A4);
                    break;
                default:
                    throw new Error(`Unexpected timing budget ${timingBudgetInMs}`);
                    break;
            }
        }
    }

    async getDistanceMode() {
        const tempDM = await this.readByte(PHASECAL_CONFIG__TIMEOUT_MACROP);
        let distanceMode;
        if (tempDM === 0x14) {
            distanceMode = 1;
        } else if (tempDM === 0x0A) {
            distanceMode = 2;
        }
        return distanceMode;
    }

    async setDistanceMode(mode) {
        const timingBudget = await this.getTimingBudgetInMs();

        if (mode === 1) {
            await this.writeByte(PHASECAL_CONFIG__TIMEOUT_MACROP, 0x14);
            await this.writeByte(RANGE_CONFIG__VCSEL_PERIOD_A, 0x07);
            await this.writeByte(RANGE_CONFIG__VCSEL_PERIOD_B, 0x05);
            await this.writeByte(RANGE_CONFIG__VALID_PHASE_HIGH, 0x38);
            await this.writeByte(SD_CONFIG__WOI_SD0, 0x0705);
            await this.writeByte(SD_CONFIG__INITIAL_PHASE_SD0, 0x0606);
        } else if (mode === 2) {
            await this.writeByte(PHASECAL_CONFIG__TIMEOUT_MACROP, 0x0A);
            await this.writeByte(RANGE_CONFIG__VCSEL_PERIOD_A, 0x0F);
            await this.writeByte(RANGE_CONFIG__VCSEL_PERIOD_B, 0x0D);
            await this.writeByte(RANGE_CONFIG__VALID_PHASE_HIGH, 0xB8);
            await this.writeByte(SD_CONFIG__WOI_SD0, 0x0F0D);
            await this.writeByte(SD_CONFIG__INITIAL_PHASE_SD0, 0x0E0E);
        } else {
            throw new Error(`Unexpected distance mode ${mode}`);
        }

        await this.setTimingBudgetInMs(timingBudget);
    }

    async getInterMeasurementInMs() {
        let pIM = await this.readDoubleWord(VL53L1_SYSTEM__INTERMEASUREMENT_PERIOD);
        let clockPLL = await this.readWord(VL53L1_RESULT__OSC_CALIBRATE_VAL);
        clockPLL = clockPLL & 0x03FF;
        pIM = Math.round(pIM / (clockPLL * 1.065));
        return pIM;
    }

    async setInterMeasurementInMs(interMeasMs) {
        let clockPLL = await this.readWord(VL53L1_RESULT__OSC_CALIBRATE_VAL);
        clockPLL = clockPLL & 0x3FF;
        await this.writeDoubleWord(VL53L1_SYSTEM__INTERMEASUREMENT_PERIOD, Math.round(clockPLL * interMeasMs * 1.075));
    }

    /**
     * There are five range statuses: 0, 1, 2, 4, and 7.
     * When the range status is 0, there is no error.
     * Range status 1 and 2 are error warnings while
     * range status 4 and 7 are errors.
     *
     * When the range status is 1, there is a sigma failure. This means that the repeatability or standard
     * deviation of the measurement is bad due to a decreasing signal noise ratio. Increasing the timing budget can
     * improve the standard deviation and avoid a range status 1.
     *
     * When the range status is 2, there is a signal failure. This means that the return signal is too week to return
     * a good answer. The reason is because the target is too far, or the target is not reflective enough, or the
     * target is too small. Increasing the timing buget might help, but there may simply be no target available.
     *
     * When the range status is 4, the sensor is "out of bounds". This means that the sensor
     * is ranging in a “nonappropriated” zone and the measured result may be inconsistent. This status is considered
     * as a warning but, in general, it happens when a target is at the maximum distance possible from the sensor,
     * i.e. around 5 m. However, this is only for very bright targets.
     *
     * Range status 7 is called "wraparound". This situation may occur when the target is very reflective and
     * the distance to the target/sensor is longer than the physical limited distance measurable by the sensor.
     * Such distances include approximately 5 m when the senor is in Long distance mode and approximately 1.3 m
     * when the sensor is in Short distance mode.
     *
     * Example: a traffic sign located at 6 m can be seen by the sensor and returns a range of 1 m. This is due
     * to “radar aliasing”: if only an approximate distance is required, we may add 6 m to the distance returned.
     * However, that is a very approximate estimation.
     *
     * @returns {Promise<number>}
     */
    async getRangeStatus() {
        let rangeStatus = await this.readByte(VL53L1_RESULT__RANGE_STATUS);
        rangeStatus = rangeStatus & 0x1F;
        if (rangeStatus < 24) {
            rangeStatus = status_rtn[rangeStatus];
        }
        return rangeStatus;
    }
}

VL53L1X.DISTANCE_MODE_SHORT = 1;
VL53L1X.DISTANCE_MODE_LONG = 2;

module.exports = VL53L1X;