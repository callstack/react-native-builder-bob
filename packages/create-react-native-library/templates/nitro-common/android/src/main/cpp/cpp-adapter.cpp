#include <jni.h>
#include "<%- project.package_cpp -%>OnLoad.hpp"

#include <fbjni/fbjni.h>


JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return facebook::jni::initialize(vm, []() {
    margelo::nitro::<%- project.package_cpp -%>::registerAllNatives();
  });
}