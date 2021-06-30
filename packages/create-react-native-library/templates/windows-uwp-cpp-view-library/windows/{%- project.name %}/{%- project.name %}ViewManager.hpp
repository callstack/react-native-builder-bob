#pragma once

#include <winrt/Windows.UI.Xaml.Controls.h>
#include <winrt/Windows.UI.Xaml.h>
#include <winrt/Microsoft.ReactNative.h>

namespace winrt::<%- project.name %>::implementation
{
    class <%- project.name %>ViewManager : public implements<
        <%- project.name %>ViewManager,
        Microsoft::ReactNative::IViewManager
        Microsoft::ReactNative::IViewManagerWithNativeProperties,
        Microsoft::ReactNative::IViewManagerWithReactContext>
    {
    public:
        <%- project.name %>ViewManager();

        // IViewManager
        hstring Name() noexcept;
        Windows::UI::Xaml::FrameworkElement CreateView() noexcept;

        // IViewManagerWithNativeProperties
        Windows::Foundation::Collections::IMapView<hstring, Microsoft::ReactNative::ViewManagerPropertyType> NativeProps() noexcept;
        void UpdateProperties(Windows::UI::Xaml::FrameworkElement const &view, Microsoft::ReactNative::IJSValueReader const &propertyMapReader) noexcept;

        // IViewManagerWithReactContext
        Microsoft::ReactNative::IReactContext ReactContext() noexcept;
        void ReactContext(Microsoft::ReactNative::IReactContext reactContext) noexcept;

    private:
        Microsoft::ReactNative::IReactContext reactContext{ nullptr };
    };
}
