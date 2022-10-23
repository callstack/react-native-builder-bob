#include <jni.h>
#include "<%- project.identifier -%>.h"

extern "C"
JNIEXPORT jint JNICALL
<% if (project.architecture == 'mixed') { -%>
Java_com_<%- project.package -%>_<%- project.name -%>ModuleImpl_multiply(JNIEnv *env, jclass type, jdouble a, jdouble b) {
<% } else { -%>
Java_com_<%- project.package -%>_<%- project.name -%>Module_nativeMultiply(JNIEnv *env, jclass type, jdouble a, jdouble b) {
<% } -%>
    return <%- project.package -%>::multiply(a, b);
}
