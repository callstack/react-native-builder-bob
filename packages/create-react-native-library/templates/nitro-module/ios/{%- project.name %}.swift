class <%- project.name -%>: Hybrid<%- project.name -%>Spec {
    public override var memorySize: Int {
        getSizeOf(self)
    }

    public func multiply(a: Double, b: Double) throws -> Double {
        return a * b
    }
}
