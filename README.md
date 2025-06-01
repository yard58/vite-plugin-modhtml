# Vite Plugin for modHTML

modHTML stands for **mod**ular **HTML**. It is a set of web components and plugins that ease the management of HTML by allowing to decompose an HTML webapp into smaller chunks.

This Vite plugin replaces `<modhtml-include src="path"><modhtml-include/>` tags with the contents of the HTML file referenced by the `src` attribute. Note that the `src` attribute is a path relative to the location of the file where the `<modhtml-include>` element appears. Referenced files can in turn include other files, recursively. Circular inclusions are detected and generate an error.

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
    <title>modHTML Demo</title>
</head>

<body>
    <modhtml-include src="hello.html"></modhtml-include>
</body>

</html>

<!-- hello.html -->
<h1>Hello World!</h1>
```

> The `src` attribute can be absolute or relative.
> - It is absolute if it begins with a `/`. In this case the root is where the `index.html` sits.
> - Else, it is relative. In this case it is relative to the _including_ file path at build time.

> Avoid putting your included HTML files in the `public` folder as they would be included in the distribution by Vite. A good practice is to put your included files in a `/partials` folder (and organize them in subfolders if you wish). In this case, in the example above, we would rather have `<modhtml-include src="/partials/hello.html"></modhtml-include>`

Then after running your `vite build` script, your dist folder will contain the following file:

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <title>modHTML Demo</title>
</head>

<body>
    <h1>Hello World!</h1>
</body>

</html>
```

You can also use `vite dev` to directly see the result. The page will refresh automatically if you change any of the included files.



