#include "<%- project.name %>ViewManager.hpp"
#include "<%- project.name %>View.h"

#include "NativeModules.h"
#include <unknwn.h>

namespace winrt::<%- project.name %>::implementation
{
    <%- project.name %>ViewManager::<%- project.name %>ViewManager()
    {
    }

    // IViewManager
    winrt::hstring <%- project.name %>ViewManager::Name() noexcept
    {
        return L"<%- project.name %>";
    }

    Windows::UI::Xaml::FrameworkElement <%- project.name %>ViewManager::CreateView() noexcept
    {
        return winrt::<%- project.name %>::<%- project.name %>View( reactContext );
    }

    // IViewManagerWithNativeProperties
    Windows::Foundation::Collection::IMapView<hstring, ViewManagerPropertyType> <%- project.name %>ViewManager::NativeProps() noexcept
    {
        auto nativeProps = winrt::single_threaded_map<hstring, ViewManagerPropertyType>();
        return nativeProps.GetView();
    }

    void <%- project.name %>ViewManager::UpdateProperties(FrameworkElement const &view, IJSValueReader const &propertyMapReader) noexcept
    {
        if (auto control = view.try_as<ViewManagerSample::<%- project.name %>>())
        {
            const JSValueObject &propertyMap = JSValue::ReadObjectFrom(propertyMapReader);

            for(auto const &pair : propertyMap)
            {
                auto const &propertyName = pair.first;
                auto const &propertyValue = pair.second;
            }
        }
    }

    // IViewManagerWithReactContext
    Microsoft::ReactNative::IReactContext <%- project.name %>ViewManager::ReactContext() noexcept
    {
        return reactContext;
    }

    void <%- project.name %>ViewManager::ReactContext(Microsoft::ReactNative::IReactContext reactContext) noexcept
    {
        this->reactContext = reactContext;
    }
}
