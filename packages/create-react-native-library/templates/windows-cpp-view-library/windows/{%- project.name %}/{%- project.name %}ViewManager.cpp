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
}
