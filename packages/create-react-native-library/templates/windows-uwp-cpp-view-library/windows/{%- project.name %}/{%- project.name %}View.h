#pragma once

#include "<%- project.name %>View.g.h"

namespace winrt::<%- project.name %>::implementation
{
    struct <%- project.name %>View : <%- project.name %>ViewT<<%- project.name %>View>
    {
        <%- project.name %>View() = default;
        <%- project.name %>View( const Microsoft::ReactNative::IReactContext& reactContext );

    private:
        winrt::Microsoft::ReactNative::IReactContext reactContext;
    };
}

namespace winrt::<%- project.name %>::factory_implementation
{
    struct <%- project.name %>View : <%- project.name %>ViewT<<%- project.name %>View, implementation::<%- project.name %>View>
    {
    };
}
