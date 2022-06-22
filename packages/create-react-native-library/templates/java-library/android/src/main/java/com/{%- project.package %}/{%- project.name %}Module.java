package com.<%- project.package %>;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = <%- project.name %>Module.NAME)
public class <%- project.name %>Module extends ReactContextBaseJavaModule {
    public static final String NAME = "<%- project.name %>";

    public <%- project.name %>Module(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

<% if (project.cpp) { -%>
    static {
        try {
            // Used to load the 'native-lib' library on application startup.
            System.loadLibrary("cpp");
        } catch (Exception ignored) {
        }
    }
<% } -%>

    // Example method
    // See https://reactnative.dev/docs/native-modules-android
    @ReactMethod
    public void multiply(int a, int b, Promise promise) {
<% if (project.cpp) { -%>
        promise.resolve(nativeMultiply(a, b));
<% } else { -%>
        promise.resolve(a * b);
<% } -%>
    }

    public static native int nativeMultiply(int a, int b);
}
