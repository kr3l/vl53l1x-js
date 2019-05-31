#include <napi.h>
#include "VL53L1X.h"

class VL53L1XWrapper : public Napi::ObjectWrap<VL53L1XWrapper> {
 public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports); //Init function for setting the export key to JS
  VL53L1XWrapper(const Napi::CallbackInfo& info); //Constructor to initialise

 private:
  static Napi::FunctionReference constructor; //reference to store the class definition that needs to be exported to JS
  Napi::Value begin(const Napi::CallbackInfo& info); //wrapped begin function
  Napi::Value softReset(const Napi::CallbackInfo& info);
  Napi::Value startMeasurement(const Napi::CallbackInfo& info); //wrapped startMeasurement function
  Napi::Value newDataReady(const Napi::CallbackInfo& info);
  Napi::Value getDistance(const Napi::CallbackInfo& info);
  Napi::Value getSignalRate(const Napi::CallbackInfo& info);
  Napi::Value getRangeStatus(const Napi::CallbackInfo& info);

  VL53L1X *actualClass_; //internal instance of actualclass used to perform actual operations.
};