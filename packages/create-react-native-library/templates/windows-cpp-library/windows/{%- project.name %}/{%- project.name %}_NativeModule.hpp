#pragma once

#include "NativeModules.h"
#include "winrt/Microsoft.ReactNative.h"

namespace winrt::<%- project.name %>::implementation
{
    REACT_MODULE( <%- project.name %>_NativeModule );
    struct <%- project.name %>_NativeModule
    {
        REACT_INIT( Initialize );
        void Initialize( const winrt::Microsoft::ReactNative::ReactContext& reactContext ) noexcept
        {
            context = reactContext;
        }

    private:
        winrt::Microsoft::ReactNative::ReactContext context;
    };
}
