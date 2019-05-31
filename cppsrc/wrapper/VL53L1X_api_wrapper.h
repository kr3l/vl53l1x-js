#include <napi.h>
#include "../ST/VL53L1X_api.h"

namespace VL53L1X_API_WRAPPER {
    Napi::Object Init(Napi::Env env, Napi::Object exports);

    Napi::Value VL53L1X_GetSWVersion_Wrapped(const Napi::CallbackInfo& info);

}