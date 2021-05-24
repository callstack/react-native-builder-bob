#include "Class.h"
#include "Class.g.cpp"

namespace winrt::<%- project.name %>::implementation
{
    int32_t Class::MyProperty()
    {
        throw hresult_not_implemented();
    }

    void Class::MyProperty(int32_t /* value */)
    {
        throw hresult_not_implemented();
    }
}
