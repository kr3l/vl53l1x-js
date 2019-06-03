#include "VL53L1X_api_wrapper.h"

Napi::Object VL53L1X_API_WRAPPER::Init(Napi::Env env, Napi::Object exports) {
    exports.Set("GetSWVersion", Napi::Function::New(env, VL53L1X_API_WRAPPER::VL53L1X_GetSWVersion_Wrapped));
    return exports;
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