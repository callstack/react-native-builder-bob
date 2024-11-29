# <%- project.slug %>

<%- project.description %>

## Installation

<% if (project.nitro) { -%>
```sh
npm install <%- project.slug %> react-native-nitro-modules
```
<% } else { -%>
```sh
npm install <%- project.slug %>
```
<% } -%>

## Usage

<% if (project.view) { -%>

```js
import { <%- project.name -%>View } from "<%- project.slug -%>";

// ...

<<%- project.name -%>View color="tomato" />
```

<% } else if (project.arch === 'new' && project.module) { -%>

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

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
