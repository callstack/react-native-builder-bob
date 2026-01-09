#import "<%- project.name -%>View.h"

#import <React/RCTConversions.h>

#import <react/renderer/components/<%- project.name -%>ViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/<%- project.name -%>ViewSpec/Props.h>
#import <react/renderer/components/<%- project.name -%>ViewSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

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
        [_view setBackgroundColor: RCTUIColorFromSharedColor(newViewProps.color)];
    }

    [super updateProps:props oldProps:oldProps];
}

@end
