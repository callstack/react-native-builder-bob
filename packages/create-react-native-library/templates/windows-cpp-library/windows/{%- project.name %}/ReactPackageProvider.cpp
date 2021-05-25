#include "pch.h"
#include "ReactPackageProvider.h"
#include "NativeModules.h"

#include "<%- project.name %>_NativeModule.hpp"

using namespace winrt::Microsoft::ReactNative;

namespace winrt::<%- project.name %>::implementation
{

void ReactPackageProvider::CreatePackage(IReactPackageBuilder const &packageBuilder) noexcept
{
    AddAttributedModules(packageBuilder);
}

} // namespace winrt::<%- project.name %>::implementation
