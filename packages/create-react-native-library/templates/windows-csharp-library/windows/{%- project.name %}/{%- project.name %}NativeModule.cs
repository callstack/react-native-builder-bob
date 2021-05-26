using System;
using Microsoft.ReactNative.Managed;

namespace <%- project.name %>
{
    [ReactModule("<%- project.name %>")]
    internal sealed class <%- project.name %>NativeModule
    {
        [ReactInitializer]
        public void Initialize( ReactContext reactContext )
        {
            this.reactContext = reactContext;
        }


        private ReactContext reactContext;
    }
}
