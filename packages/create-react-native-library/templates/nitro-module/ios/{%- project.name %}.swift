class <%- project.name -%>: Hybrid<%- project.name -%>Spec {
    var hybridContext = margelo.nitro.HybridContext()
    var memorySize: Int {
        getSizeOf(self)
    }

    func multiply(a: Double, b: Double) throws -> Double {
        return a * b
    }
}

