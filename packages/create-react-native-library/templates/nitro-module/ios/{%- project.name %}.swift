class <%- project.name -%>: Hybrid<%- project.name -%>Spec {
    public var hybridContext = margelo.nitro.HybridContext()
    public var memorySize: Int {
        getSizeOf(self)
    }

    public func multiply(a: Double, b: Double) throws -> Double {
        return a * b
    }
}

