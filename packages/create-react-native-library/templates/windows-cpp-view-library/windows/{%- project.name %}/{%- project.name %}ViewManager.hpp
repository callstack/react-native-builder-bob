#pragma once

#include <winrt/Windows.UI.Xaml.Controls.h>
#include <winrt/Windows.UI.Xaml.h>
#include <winrt/Microsoft.ReactNative.h>

namespace winrt::<%- project.name %>::implementation
{
    class <%- project.name %>ViewManager : public implements<
        <%- project.name %>ViewManager,
        Microsoft::ReactNative::IViewManager>
    {
    public:
        <%- project.name %>ViewManager();

        // IViewManager
        hstring Name() noexcept;
        Windows::UI::Xaml::FrameworkElement CreateView() noexcept;

    private:
        winrt::Microsoft::ReactNative::IReactContext reactContext{ nullptr };
    };
}
