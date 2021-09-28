# <%- project.slug %>

<%- project.description %>

## Installation

```sh
npm install <%- project.slug %>
```

## Usage

<% if (project.moduleType === "view") { -%>
```js
import { <%- project.name %>View } from "<%- project.slug %>";

// ...

<<%- project.name %>View color="tomato" />
```
<% } else { -%>
```js
import { multiply } from "<%- project.slug %>";

// ...

const result = await multiply(3, 7);
```
<% } -%>

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
