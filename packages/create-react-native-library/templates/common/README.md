# <%- project.slug %>

<%- project.description %>

## Installation

<% if (project.moduleConfig === 'nitro-modules' || project.viewConfig === 'nitro-view') { -%>

```sh
npm install <%- project.slug %> react-native-nitro-modules

> `react-native-nitro-modules` is required as this library relies on [Nitro Modules](https://nitro.margelo.com/).
```

<% } else { -%>

```sh
npm install <%- project.slug %>
```

<% } -%>

## Usage

<% if (project.viewConfig !== null) { -%>

```js
import { <%- project.name -%>View } from "<%- project.slug -%>";

// ...

<<%- project.name -%>View color="tomato" />
```

<% } else if (project.moduleConfig === 'nitro-modules' || project.viewConfig === 'nitro-view' || project.moduleConfig === 'turbo-modules') { -%>

```js
import { multiply } from '<%- project.slug -%>';

// ...

const result = multiply(3, 7);
```

<% } else { -%>

```js
import { multiply } from '<%- project.slug -%>';

// ...

const result = await multiply(3, 7);
```

<% } -%>

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
