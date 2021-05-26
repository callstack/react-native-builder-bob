#include "ReactPackageProvider.h"
#if __has_include("ReactPackageProvider.g.cpp")
#include "ReactPackageProvider.g.cpp"
#endif

#include <ModuleRegistration.h>

#include "<%- project.name %>ViewManager.hpp"


namespace winrt::<%- project.name %>::implementation
{
    void ReactPackageProvider::CreatePackage( const winrt::Microsoft::ReactNative::IReactPackageBuilder& packageBuilder ) noexcept
    {
        packageBuilder.AddViewManager( L"<%- project.name %>ViewManager", []() { return winrt::make<<%- project.name %>ViewManager>(); } );
    }
}
