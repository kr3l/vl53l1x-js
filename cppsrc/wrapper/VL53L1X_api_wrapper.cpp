#include "VL53L1X_api_wrapper.h"

Napi::Object VL53L1X_API_WRAPPER::Init(Napi::Env env, Napi::Object exports) {
    exports.Set("SetupPort", Napi::Function::New(env, VL53L1X_API_WRAPPER::SetupPort));
    exports.Set("GetSWVersion", Napi::Function::New(env, VL53L1X_API_WRAPPER::VL53L1X_GetSWVersion_Wrapped));
    exports.Set("SensorInit", Napi::Function::New(env, VL53L1X_API_WRAPPER::VL53L1X_SensorInit_Wrapped));
    exports.Set("StartRanging", Napi::Function::New(env, VL53L1X_API_WRAPPER::VL53L1X_StartRanging_Wrapped));
    exports.Set("CheckForDataReady", Napi::Function::New(env, VL53L1X_API_WRAPPER::VL53L1X_CheckForDataReady_Wrapped));
    exports.Set("GetDistance", Napi::Function::New(env, VL53L1X_API_WRAPPER::VL53L1X_GetDistance_Wrapped));
    exports.Set("ClearInterrupt", Napi::Function::New(env, VL53L1X_API_WRAPPER::VL53L1X_ClearInterrupt_Wrapped));
    exports.Set("StopRanging", Napi::Function::New(env, VL53L1X_API_WRAPPER::VL53L1X_StopRanging_Wrapped));
    exports.Set("GetSensorId", Napi::Function::New(env, VL53L1X_API_WRAPPER::VL53L1X_GetSensorId_Wrapped));

    return exports;
}

Napi::Value VL53L1X_API_WRAPPER::SetupPort(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    //----- OPEN THE I2C BUS -----
    char *filename = (char*)"/dev/i2c-1";
    int i2c_port = 3;
    if ((i2c_port = open(filename, O_RDWR)) < 0){
        Napi::TypeError::New(env, "Could not open port").ThrowAsJavaScriptException();
        //return (0);
    }

    const uint8_t defaultAddress_VL53L1X = 0x29;

    int addr = defaultAddress_VL53L1X;          //<<<<<The I2C address of the slave
    if (ioctl(i2c_port, I2C_SLAVE, addr) < 0)
    {
      Napi::TypeError::New(env, "Could not open port: ioctl < 0").ThrowAsJavaScriptException();
    }

    return Napi::Number::New(env, i2c_port);
}


Napi::Value VL53L1X_API_WRAPPER::VL53L1X_GetSWVersion_Wrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    VL53L1X_Version_t v;
    VL53L1X_ERROR status = VL53L1X_GetSWVersion(&v);
    if (status != 0) {
        Napi::TypeError::New(env, "Status not 0").ThrowAsJavaScriptException();
    }
    Napi::Object obj = Napi::Object::New(env);

    obj.Set(Napi::String::New(env, "major"), Napi::Number::New(env, v.major));
    obj.Set(Napi::String::New(env, "minor"), Napi::Number::New(env, v.minor));
    obj.Set(Napi::String::New(env, "build"), Napi::Number::New(env, v.build));
    obj.Set(Napi::String::New(env, "revision"), Napi::Number::New(env, v.revision));

    return obj;
}

Napi::Value VL53L1X_API_WRAPPER::VL53L1X_SetI2CAddress_Wrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    Napi::Number napi_dev = info[0].As<Napi::Number>();
    Napi::Number napi_new_address = info[1].As<Napi::Number>();

    uint16_t dev = (uint16_t) napi_dev.Uint32Value();
    uint8_t new_address = (uint8_t) napi_new_address.Uint32Value();

    VL53L1X_ERROR status = VL53L1X_SetI2CAddress(dev, new_address);
    if (status != 0) {
        Napi::TypeError::New(env, "Status not 0").ThrowAsJavaScriptException();
    }
    return Napi::Number::New(env, status);
}

Napi::Value VL53L1X_API_WRAPPER::VL53L1X_SensorInit_Wrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    Napi::Number napi_dev = info[0].As<Napi::Number>();
    uint16_t dev = (uint16_t) napi_dev.Uint32Value();

    VL53L1X_ERROR status = VL53L1X_SensorInit(dev);
    if (status != 0) {
        Napi::TypeError::New(env, "Status not 0").ThrowAsJavaScriptException();
    }
    return Napi::Number::New(env, status);
}

Napi::Value VL53L1X_API_WRAPPER::VL53L1X_StartRanging_Wrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    Napi::Number napi_dev = info[0].As<Napi::Number>();
    uint16_t dev = (uint16_t) napi_dev.Uint32Value();

    VL53L1X_ERROR status = VL53L1X_StartRanging(dev);
    if (status != 0) {
        Napi::TypeError::New(env, "Status not 0").ThrowAsJavaScriptException();
    }
    return Napi::Number::New(env, status);
}

Napi::Value VL53L1X_API_WRAPPER::VL53L1X_CheckForDataReady_Wrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    Napi::Number napi_dev = info[0].As<Napi::Number>();
    uint16_t dev = (uint16_t) napi_dev.Uint32Value();

    uint8_t isDataReady = 3;

    VL53L1X_ERROR status = VL53L1X_CheckForDataReady(dev, &isDataReady);

    if (status != 0) {
        std::stringstream ss;
        ss << "Status not 0: [" << status << "]";
        std::string s = ss.str();
        Napi::TypeError::New(env, s).ThrowAsJavaScriptException();
    }

    return Napi::Number::New(env, isDataReady);
}

Napi::Value VL53L1X_API_WRAPPER::VL53L1X_GetDistance_Wrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    Napi::Number napi_dev = info[0].As<Napi::Number>();
    uint16_t dev = (uint16_t) napi_dev.Uint32Value();

    uint16_t distance;

    VL53L1X_ERROR status = VL53L1X_GetDistance(dev, &distance);
    if (status != 0) {
        Napi::TypeError::New(env, "Status not 0").ThrowAsJavaScriptException();
    }
    return Napi::Number::New(env, distance);
}

Napi::Value VL53L1X_API_WRAPPER::VL53L1X_ClearInterrupt_Wrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    Napi::Number napi_dev = info[0].As<Napi::Number>();
    uint16_t dev = (uint16_t) napi_dev.Uint32Value();

    VL53L1X_ERROR status = VL53L1X_ClearInterrupt(dev);
    if (status != 0) {
        Napi::TypeError::New(env, "Status not 0").ThrowAsJavaScriptException();
    }
    return Napi::Number::New(env, status);
}

Napi::Value VL53L1X_API_WRAPPER::VL53L1X_StopRanging_Wrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    Napi::Number napi_dev = info[0].As<Napi::Number>();
    uint16_t dev = (uint16_t) napi_dev.Uint32Value();

    VL53L1X_ERROR status = VL53L1X_StopRanging(dev);
    if (status != 0) {
        Napi::TypeError::New(env, "Status not 0").ThrowAsJavaScriptException();
    }
    return Napi::Number::New(env, status);
}

Napi::Value VL53L1X_API_WRAPPER::VL53L1X_GetSensorId_Wrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    Napi::Number napi_dev = info[0].As<Napi::Number>();
    uint16_t dev = (uint16_t) napi_dev.Uint32Value();

    uint16_t sensorId;

    VL53L1X_ERROR status = VL53L1X_GetSensorId(dev, &sensorId);
    if (status != 0) {
        Napi::TypeError::New(env, "Status not 0").ThrowAsJavaScriptException();
    }
    return Napi::Number::New(env, sensorId);
}