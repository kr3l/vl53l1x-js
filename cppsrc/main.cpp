/* cppsrc/main.cpp */
#include <napi.h>
#include "wrapper/VL53L1X_api_wrapper.h"

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  return VL53L1X_API_WRAPPER::Init(env, exports);
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, InitAll)