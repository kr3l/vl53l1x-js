/* cppsrc/main.cpp */
#include <napi.h>
#include "VL53L1X/VL53L1XWrapper.h"

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  return VL53L1XWrapper::Init(env, exports);
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, InitAll)