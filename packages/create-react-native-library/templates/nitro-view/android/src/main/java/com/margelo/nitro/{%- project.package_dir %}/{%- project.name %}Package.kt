package com.margelo.nitro.<%- project.package %>

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

import com.margelo.nitro.<%- project.package %>.views.Hybrid<%- project.name -%>Manager

class <%- project.name -%>Package : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return null
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider { HashMap() }
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return listOf(Hybrid<%- project.name -%>Manager())
    }

    companion object {
        init {
            System.loadLibrary("<%- project.package_cpp -%>")
        }
    }
}
