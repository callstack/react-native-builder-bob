#include "<%- project.name %>View.h"
#include "<%- project.name %>View.g.cpp"

namespace winrt::<%- project.name %>::implementation
{
    <%- project.name %>View::<%- project.name %>View( const Microsoft::ReactNative::IReactContext& reactContext ) : reactContext{ reactContext }
    {
    }
}
