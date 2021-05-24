#pragma once

#include "Class.g.h"

namespace winrt::<%- project.name %>::implementation
{
    struct Class : ClassT<Class>
    {
        Class() = default;

        int32_t MyProperty();
        void MyProperty(int32_t value);
    };
}

namespace winrt::<%- project.name %>::factory_implementation
{
    struct Class : ClassT<Class, implementation::Class>
    {
    };
}
