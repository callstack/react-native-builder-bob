#include <jni.h>
#include "<%- project.identifier -%>.h"

extern "C"
JNIEXPORT jint JNICALL
Java_com_<%- project.package_cpp -%>_<%- project.name -%>Module_nativeMultiply(JNIEnv *env, jclass type, jdouble a, jdouble b) {
    return <%- project.package_cpp -%>::multiply(a, b);
}
