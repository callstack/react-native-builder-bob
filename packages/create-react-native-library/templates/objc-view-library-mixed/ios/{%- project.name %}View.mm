#ifdef RCT_NEW_ARCH_ENABLED
#import "<%- project.name -%>View.h"

#import <react/renderer/components/RN<%- project.name -%>ViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/RN<%- project.name -%>ViewSpec/EventEmitters.h>
#import <react/renderer/components/RN<%- project.name -%>ViewSpec/Props.h>
#import <react/renderer/components/RN<%- project.name -%>ViewSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "Utils.h"

using namespace facebook::react;

@interface <%- project.name -%>View () <RCT<%- project.name -%>ViewViewProtocol>

@end

@implementation <%- project.name -%>View {
    UIView * _view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<<%- project.name -%>ViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const <%- project.name -%>ViewProps>();
    _props = defaultProps;

    _view = [[UIView alloc] init];

    self.contentView = _view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<<%- project.name -%>ViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<<%- project.name -%>ViewProps const>(props);

    if (oldViewProps.color != newViewProps.color) {
        NSString * colorToConvert = [[NSString alloc] initWithUTF8String: newViewProps.color.c_str()];
        [_view setBackgroundColor: [Utils hexStringToColor:colorToConvert]];
    }

    [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> <%- project.name -%>ViewCls(void)
{
    return <%- project.name -%>View.class;
}

@end
#endif
