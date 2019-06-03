#include "VL53L1X_api_wrapper.h"

Napi::Object VL53L1X_API_WRAPPER::Init(Napi::Env env, Napi::Object exports) {
    exports.Set("GetSWVersion", Napi::Function::New(env, VL53L1X_API_WRAPPER::VL53L1X_GetSWVersion_Wrapped));
    exports.Set("SetupPort", Napi::Function::New(env, VL53L1X_API_WRAPPER::SetupPort));
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
    VL53L1X_GetSWVersion(&v);
    Napi::Object obj = Napi::Object::New(env);

    obj.Set(Napi::String::New(env, "major"), Napi::Number::New(env, v.major));
    obj.Set(Napi::String::New(env, "minor"), Napi::Number::New(env, v.minor));
    obj.Set(Napi::String::New(env, "build"), Napi::Number::New(env, v.build));
    obj.Set(Napi::String::New(env, "revision"), Napi::Number::New(env, v.revision));

    return obj;
}

Napi::Value VL53L1X_SetI2CAddress_Wrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    Napi::Number napi_dev = info[0].As<Napi::Number>();
    Napi::Number napi_new_address = info[1].As<Napi::Number>();

    uint16_t dev = (uint16_t) napi_dev.Uint32Value();
    uint8_t new_address = (uint8_t) napi_new_address.Uint32Value();

    VL53L1X_ERROR status = VL53L1X_SetI2CAddress(dev, new_address);

    return Napi::Number::New(env, status);
}