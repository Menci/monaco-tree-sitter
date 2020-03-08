import "./patch-fetch";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import * as Parser from "web-tree-sitter";
import { Language, Theme, MonacoTreeSitter, highlight } from "monaco-tree-sitter";

import treeSitterCppWasmUrl from "./tree-sitter-cpp.wasm";

const cppCode = `#include <cstdio>
#include <vector>

struct TreeNode {
    TreeNode *leftChild, *rightChild;
    std::vector<double> data;
    int weight;
};

int main() {
    TreeNode root;
    root.leftChild = new TreeNode();

    int a, b;
    scanf("%d %d", &a, &b);
    auto c = a + b;

    return 0 + a - b + c;
}`;

(async () => {
  // Theme can be loaded before Parser.init()
  Theme.load(require("monaco-tree-sitter/themes/tomorrow"));

  await Parser.init();
  const language = new Language(require("monaco-tree-sitter/grammars/cpp"));
  await language.init(treeSitterCppWasmUrl, Parser);

  // Uncomment this line for a pure code highlighter
  // return document.body.innerHTML = highlight(cppCode, language, true);

  window.editor = Monaco.editor.create(document.body, {
    value: cppCode,
    language: "cpp"
  });

  window.monacoTreeSitter = new MonacoTreeSitter(Monaco, editor, language);
})();
