package com.<%= project.package %>

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class <%= project.name %>Module(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "<%= project.name %>"
    }

    // Example method
    // See https://facebook.github.io/react-native/docs/native-modules-android
    @ReactMethod
    fun multiply(a: Int, b: Int, promise: Promise) {
    <% if (project.cpp) { %>
      promise.resolve(nativeMultiply(a, b));
    <% } else { %>
      promise.resolve(a * b)
    <% } %>
    }

    <% if (project.cpp) { %>
    external fun nativeMultiply(a: Int, b: Int): Int;

    companion object
    {

        // Used to load the 'native-lib' library on application startup.
        init
        {
            System.loadLibrary("cpp")
        }
    }
    <% } %>
}
