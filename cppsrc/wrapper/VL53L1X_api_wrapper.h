#include <napi.h>
extern "C" {
#include "../ST/VL53L1X_api.h"
}

namespace VL53L1X_API_WRAPPER {
    Napi::Object Init(Napi::Env env, Napi::Object exports);

    Napi::Value VL53L1X_GetSWVersion_Wrapped(const Napi::CallbackInfo& info);

    Napi::Value VL53L1X_SetI2CAddress_Wrapped(const Napi::CallbackInfo& info);

}