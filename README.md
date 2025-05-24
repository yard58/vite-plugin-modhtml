# Vite Plugin for mo∂HTML

mo∂HTML stands for **mod**ular **HTML**. It is a set of web components and plugins that ease the management of HTML by allowing to decompose an HTML webapp into smaller chunks.

This Vite plugin replaces `<modhtml-include src="path"><modhtml-include/>` tags with the contents of the HTML file referenced by the src attribute. Note that the src attribute is a path relative to the location of the file where the `<modhtml-include>` element appears. Referenced files can in turn include other files, recursively. Circular inclusions are detected and generate an error.

## Usage

First add the plugin to your `package.json`, in the `devDependencies` section, e.g. with NPM:

```bash
npm install vite-plugin-modhtml --save-dev
```

Then, add the plugin to your Vite configuration file:

```ts
// vite.config.js (or .ts)
import ...
import modhtml from 'vite-plugin-modhtml';
import ...

export default defineConfig({
    ...
    plugins: [
        ...
        modhtml(),
        ...
    ],

})
```

Now you can use the <modhtml-include> tag in an HTML file.

For instance:

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <title>mo∂HTML Demo</title>
</head>

<body>
    <modhtml-include src="hello.html"></modhtml-include>
</body>

</html>

<!-- hello.html -->
<h1>Hello World!</h1>
```

Then after running your `vite build` script, your dist folder will contain the following file:

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <title>mo∂HTML Demo</title>
</head>

<body>
    <h1>Hello World!</h1>
</body>

</html>
```




