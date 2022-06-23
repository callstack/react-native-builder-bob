#include <jni.h>
#include "<%- project.identifier -%>.h"

extern "C"
JNIEXPORT jint JNICALL
Java_com_<%- project.package -%>_<%- project.name -%>Module_nativeMultiply(JNIEnv *env, jclass type, jint a, jint b) {
    return example::multiply(a, b);
}
