#include "ReactPackageProvider.h"
#if __has_include("ReactPackageProvider.g.cpp")
#include "ReactPackageProvider.g.cpp"
#endif

#include <ModuleRegistration.h>

#include "<%- project.name %>_NativeModule.hpp"


namespace winrt::<%- project.name %>::implementation
{
    void ReactPackageProvider::CreatePackage( const winrt::Microsoft::ReactNative::IReactPackageBuilder& packageBuilder ) noexcept
    {
        winrt::Microsoft::ReactNative::AddAttributedModules( packageBuilder );
    }
}
