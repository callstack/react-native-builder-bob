#pragma once

#include "ReactPackageProvider.g.h"
#include "winrt/Microsoft.ReactNative.h"

namespace winrt::<%- project.name %>::implementation
{
    struct ReactPackageProvider : ReactPackageProviderT<ReactPackageProvider>
    {
        ReactPackageProvider() = default;

        void CreatePackage( const winrt::Microsoft::ReactNative::IReactPackageBuilder& packageBuilder ) noexcept;
    };
}

namespace winrt::<%- project.name %>::factory_implementation
{
    struct ReactPackageProvider : ReactPackageProviderT<ReactPackageProvider, implementation::ReactPackageProvider>
    {
    };
}
