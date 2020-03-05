# Monaco tree-sitter
Highlight your Monaco Editor with tree-sitter grammar.

[![Build Status](https://img.shields.io/travis/Menci/monaco-tree-sitter?style=flat-square)](https://travis-ci.org/Menci/monaco-tree-sitter)
[![Dependencies](https://img.shields.io/david/Menci/monaco-tree-sitter?style=flat-square)](https://david-dm.org/Menci/monaco-tree-sitter)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![License](https://img.shields.io/github/license/Menci/monaco-tree-sitter?style=flat-square)](LICENSE)

# Install
Install via NPM:

```bash
$ yarn add monaco-tree-sitter
```

# Use
You can use it with Webpack. You'll need [monaco-editor-webpack-plugin](https://github.com/microsoft/monaco-editor-webpack-plugin) to load Monaco Editor and [file-loader](https://webpack.js.org/loaders/file-loader/) to load WASM.

Notice that the Webpack support of [web-tree-sitter](https://github.com/tree-sitter/tree-sitter) is broken, see [tree-sitter/tree-sitter#559](https://github.com/tree-sitter/tree-sitter/issues/559) for detail and [`demo`](demo) for a workaround.

The minimal Webpack config required is like:

```js
module: {
  rules: [
    // This is required for web-tree-sitter
    {
      test: /\.wasm$/,
      loader: "file-loader",
      type: "javascript/auto" // Disable Webpack's built-in WASM loader
    },
    // These two are required for monaco-editor-webpack-plugin
    // See https://github.com/microsoft/monaco-editor-webpack-plugin
    {
      test: /\.css$/,
      use: ["style-loader", "css-loader"]
    },
    {
      test: /\.ttf$/,
      use: ["file-loader"]
    }
  ]
},
plugins: [
  new MonacoWebpackPlugin()
],
node: {
  fs: "empty" // See https://github.com/tree-sitter/tree-sitter/issues/466
}
```

After setting-up Webpack, you can starting using it in your project.

First, you need a *theme*, a theme file is like [`tomorrow.json`](themes/tomorrow.json) in the [themes](themes) directory, containing theme for both monaco-editor and our highlighter based on tree-sitter. Load it with:

```ts
import { Theme } from "monaco-tree-sitter";

Theme.load(require("monaco-tree-sitter/themes/tomorrow"));
```

You also need to initialize `web-tree-sitter`, the bind library for tree-sitter:

```ts
import Parser = require("web-tree-sitter");
import { Theme } from "monaco-tree-sitter";

Theme.load(require("monaco-tree-sitter/themes/tomorrow"));

(async () => {
  await Parser.init().then(/* initialized */);
})();
```

To parse a language with tree-sitter, you need the language's parser. A full list of supported languages by tree-sitter is available [here](https://tree-sitter.github.io/tree-sitter/#available-parsers). There're also official prebuilt WASM binaries [here](https://github.com/tree-sitter/tree-sitter.github.io) can be downloaded.

Tree-sitter could only give us the AST of the code. To highlight we need some grammar rules (one rule is like: an identifier in an call expression is a function name). You can find the grammar rules for various languages in the [grammars](grammars) directory.

```ts
import Parser = require("web-tree-sitter");
import { Theme, Language } from "monaco-tree-sitter";
import treeSitterCpp from "./tree-sitter-cpp.wasm"; // Path to the language parser library WASM file

Theme.load(require("monaco-tree-sitter/themes/tomorrow"));

(async () => {
  await Parser.init();
  
  // Load the language's grammar rules
  const language = new Language(require("monaco-tree-sitter/grammars/cpp"));
  // Load the language's parser library's WASM binary
  await language.init(treeSitterCpp, Parser);
})();
```

Finally you can create your Monaco Editor and apply the highlight on it:

```ts
import Parser = require("web-tree-sitter");
import { Theme, Language } from "monaco-tree-sitter";
import treeSitterCpp from "./tree-sitter-cpp.wasm"; // Path to the language parser library WASM file

Theme.load(require("monaco-tree-sitter/themes/tomorrow"));

(async () => {
  await Parser.init();
  
  // Load the language's grammar rules
  const language = new Language(require("monaco-tree-sitter/grammars/cpp"));
  // Load the language's parser library's WASM binary
  await language.init(treeSitterCpp, Parser);

  window.editor = Monaco.editor.create(document.body, {
    value: "int main() { return 0; }",
    // This "language" property only affects the monaco-editor's built-in syntax highlighter
    language: "cpp"
  });  

  const monacoTreeSitter = new MonacoTreeSitter(editor, language);

  // You can change the language with monacoTreeSitter.changeLanguage()
  // Or change the theme with Theme.load()
  // Remember to refresh highlight with monacoTreeSitter.refresh() after changing the theme.
})();
```

# Highlight
You can also use this module just as a code highlighter. In this case you don't need a Monaco Editor.

First, load a theme and initialize your language as above. Then just call the `highlight()` function:

```ts
import Parser = require("web-tree-sitter");
import { Theme, Language } from "monaco-tree-sitter";
import treeSitterCpp from "./tree-sitter-cpp.wasm"; // Path to the language parser library WASM file

Theme.load(require("monaco-tree-sitter/themes/tomorrow"));

(async () => {
  await Parser.init();
  
  // Load the language's grammar rules
  const language = new Language(require("monaco-tree-sitter/grammars/cpp"));
  // Load the language's parser library's WASM binary
  await language.init(treeSitterCpp, Parser);

  document.body.innerHTML = highlight(cppCode, language);

  // You can use highlight(code, language, true) to generate self-contained HTML code.
  // i.e. Use inline style instead of class name.
})();
```

# Demo
You can find a demo in the [demo](demo) directory. Just `yarn build` and `python3 -m http.server` then open it in your browser.

# License
This project is licensed under the MIT license.

# Credits
This project used code and assets from:

* [{Syntax Highlighter}](https://github.com/EvgeniyPeshkov/syntax-highlighter)
* [Tree Sitter for VSCode](https://github.com/georgewfraser/vscode-tree-sitter)
