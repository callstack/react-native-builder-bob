#import <Foundation/Foundation.h>
#import "<%- project.name -%>Impl.h"
#import <ReactCommon/CxxTurboModuleUtils.h>

@interface <%- project.name -%>OnLoad : NSObject
@end

@implementation <%- project.name -%>OnLoad

using namespace facebook::react;

+ (void)load
{
  registerCxxModuleToGlobalModuleMap(
    std::string(<%- project.name -%>Impl::kModuleName),
    [](std::shared_ptr<CallInvoker> jsInvoker) {
      return std::make_shared<<%- project.name -%>Impl>(jsInvoker);
    }
  );
}

@end
