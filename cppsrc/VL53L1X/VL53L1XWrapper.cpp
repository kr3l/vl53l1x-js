#include "VL53L1XWrapper.h"


Napi::FunctionReference VL53L1XWrapper::constructor;

Napi::Object VL53L1XWrapper::Init(Napi::Env env, Napi::Object exports) {
  Napi::HandleScope scope(env);

  Napi::Function func = DefineClass(env, "VL53L1XWrapper", {
    InstanceMethod("begin", &VL53L1XWrapper::begin),
    InstanceMethod("startMeasurement", &VL53L1XWrapper::startMeasurement),
    InstanceMethod("newDataReady", &VL53L1XWrapper::newDataReady),
    InstanceMethod("getDistance", &VL53L1XWrapper::getDistance),
  });

  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();

  exports.Set("Sensor", func);
  return exports;
}


VL53L1XWrapper::VL53L1XWrapper(const Napi::CallbackInfo& info) : Napi::ObjectWrap<VL53L1XWrapper>(info)  {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  //int length = info.Length();
  //if (length != 1 || !info[0].IsNumber()) {
  //  Napi::TypeError::New(env, "Number expected").ThrowAsJavaScriptException();
  //}

  this->actualClass_ = new VL53L1X();
}

Napi::Value VL53L1XWrapper::begin(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  bool b = this->actualClass_->begin();
  return Napi::Boolean::New(env, b);
}

Napi::Value VL53L1XWrapper::softReset(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  this->actualClass_->begin();
  return Napi::Boolean::New(env, true);
}

Napi::Value VL53L1XWrapper::startMeasurement(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  if (  info.Length() != 1 || !info[0].IsNumber()) {
    Napi::TypeError::New(env, "Number expected").ThrowAsJavaScriptException();
  }

  Napi::Number offset = info[0].As<Napi::Number>();
  this->actualClass_->startMeasurement(offset.DoubleValue());

  double answer = 0;
  return Napi::Number::New(info.Env(), answer);
}


Napi::Value VL53L1XWrapper::newDataReady(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  bool b = this->actualClass_->newDataReady();
  return Napi::Boolean::New(env, b);
}

Napi::Value VL53L1XWrapper::getDistance(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  double num = this->actualClass_->getDistance();
  return Napi::Number::New(env, num);
}

Napi::Value VL53L1XWrapper::getSignalRate(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  double num = this->actualClass_->getSignalRate();
  return Napi::Number::New(env, num);
}

Napi::Value VL53L1XWrapper::getRangeStatus(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  double num = this->actualClass_->getRangeStatus();
  return Napi::Number::New(env, num);
}