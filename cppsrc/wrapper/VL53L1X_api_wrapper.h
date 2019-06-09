#include <napi.h>

#include <unistd.h>				//Needed for I2C port
#include <fcntl.h>				//Needed for I2C port
#include <sys/ioctl.h>			//Needed for I2C port
#include <linux/i2c-dev.h>		//Needed for I2C port
#include <iostream>
#include <unistd.h>
#include <stdint.h>
#include <sstream>
#include <string>

#include "../ST/VL53L1X_api.h"

namespace VL53L1X_API_WRAPPER {
    Napi::Object Init(Napi::Env env, Napi::Object exports);
    Napi::Value SetupPort(const Napi::CallbackInfo& info);
    Napi::Value VL53L1X_GetSWVersion_Wrapped(const Napi::CallbackInfo& info);

    Napi::Value VL53L1X_SetI2CAddress_Wrapped(const Napi::CallbackInfo& info);
    Napi::Value VL53L1X_SensorInit_Wrapped(const Napi::CallbackInfo& info);
    Napi::Value VL53L1X_StartRanging_Wrapped(const Napi::CallbackInfo& info);
    Napi::Value VL53L1X_CheckForDataReady_Wrapped(const Napi::CallbackInfo& info);
    Napi::Value VL53L1X_GetDistance_Wrapped(const Napi::CallbackInfo& info);
    Napi::Value VL53L1X_ClearInterrupt_Wrapped(const Napi::CallbackInfo& info);
    Napi::Value VL53L1X_StopRanging_Wrapped(const Napi::CallbackInfo& info);
    Napi::Value VL53L1X_GetSensorId_Wrapped(const Napi::CallbackInfo& info);
}