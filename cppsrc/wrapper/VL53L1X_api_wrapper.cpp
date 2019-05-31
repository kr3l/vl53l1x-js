#include "VL53L1X_api_wrapper.h"

Napi::Object VL53L1X_API_WRAPPER::Init(Napi::Env env, Napi::Object exports) {
    exports.Set("GetSWVersion", Napi::Function::New(env, VL53L1X_API_WRAPPER::VL53L1X_GetSWVersion_Wrapped));
    return exports;
}

Napi::Value VL53L1X_API_WRAPPER::VL53L1X_GetSWVersion_Wrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    VL53L1X_Version_t v;
    VL53L1X_GetSWVersion(&v);
// _Z20 VL53L1X_GetSWVersion P17 VL53L1X_Version_t
    Napi::Object obj = Napi::Object::New(env);

    obj.Set("major", v.major);
    obj.Set("minor", v.minor);
    obj.Set("build", v.build);
    obj.Set("revision", v.revision);

    //std::string s = v.major << "." << v.minor << "." << v.build "." << v.revision;
    return obj;
}