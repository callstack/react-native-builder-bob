#include <jni.h>
#include "<%- project.package_cpp -%>OnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::<%- project.package_cpp -%>::initialize(vm);
}
