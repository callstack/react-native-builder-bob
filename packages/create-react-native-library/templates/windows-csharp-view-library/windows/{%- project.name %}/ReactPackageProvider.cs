using Microsoft.ReactNative;
using Microsoft.ReactNative.Managed;

namespace <%- project.name %>
{
    public partial class ReactPackageProvider : IReactPackageProvider
    {
        public void CreatePackage( IReactPackageBuilder packageBuilder )
        {
            packageBuilder.AddViewManagers();
            CreatePackageImplementation( packageBuilder );
        }

        /// <summary>
        /// This method is implemented by the C# code generator
        /// </summary>
        partial void CreatePackageImplementation( IReactPackageBuilder packageBuilder );
    }
}
