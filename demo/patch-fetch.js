// Patch fetch() to let emscripten load the WASM file

import treeSitterWasmUrl from "web-tree-sitter/tree-sitter.wasm";

const realFetch = window.fetch;
window.fetch = function () {
  if (arguments[0].endsWith("/tree-sitter.wasm")) arguments[0] = treeSitterWasmUrl;
  return realFetch.apply(window, arguments);
};
