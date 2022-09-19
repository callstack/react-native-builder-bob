#include <jni.h>
#include "<%- project.identifier -%>.h"

extern "C"
JNIEXPORT jint JNICALL
Java_com_<%- project.package.replace(/\/g, '_') -%>_<%- project.name -%>Module_nativeMultiply(JNIEnv *env, jclass type, jdouble a, jdouble b) {
    return example::multiply(a, b);
}
