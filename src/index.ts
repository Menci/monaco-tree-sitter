import Parser = require("web-tree-sitter");
import Monaco = require("monaco-editor/esm/vs/editor/editor.api");
import lodashDebounce = require("lodash.debounce");

import { Language } from "./language";
import { buildDecorations, Term } from "./highlighter";
import { Theme } from "./theme";

export * from "./theme";
export * from "./language";
export * from "./highlighter";
export * from "./highlight";

function monacoPositionToParserPoint(position: Monaco.Position): Parser.Point {
  return { row: position.lineNumber, column: position.column };
}

export class MonacoTreeSitter {
  private tree: Parser.Tree;
  private monacoDecorationKeys: string[] = [];

  constructor(public readonly editor: Monaco.editor.IStandaloneCodeEditor, private language: Language) {
    this.tree = language.parser.parse(editor.getValue());
    editor.getModel().onDidChangeContent(this.onEditorContentChange.bind(this));
    this.buildHighlight();
  }

  private onEditorContentChange(e: Monaco.editor.IModelContentChangedEvent) {
    if (e.changes.length == 0) return;

    for (const change of e.changes) {
      const startIndex = change.rangeOffset;
      const oldEndIndex = change.rangeOffset + change.rangeLength;
      const newEndIndex = change.rangeOffset + change.text.length;
      const startPosition = monacoPositionToParserPoint(this.editor.getModel().getPositionAt(startIndex));
      const oldEndPosition = monacoPositionToParserPoint(this.editor.getModel().getPositionAt(oldEndIndex));
      const newEndPosition = monacoPositionToParserPoint(this.editor.getModel().getPositionAt(newEndIndex));
      this.tree.edit({ startIndex, oldEndIndex, newEndIndex, startPosition, oldEndPosition, newEndPosition });
    }
    this.tree = this.language.parser.parse(this.editor.getValue(), this.tree); // TODO: Don't use getText, use Parser.Input
    this.buildHighlightDebounced(); // TODO: Build highlight incrementally
  }

  private buildHighlight() {
    const decorations = buildDecorations(this.tree, this.language);

    const monacoDecorations: Monaco.editor.IModelDeltaDecoration[] = [];
    for (const [term, ranges] of Object.entries(decorations)) {
      const options: Monaco.editor.IModelDecorationOptions = {
        inlineClassName: Theme.getClassNameOfTerm(term as Term)
      };
      for (const range of ranges) {
        monacoDecorations.push({ range, options });
      }
    }
    this.monacoDecorationKeys = this.editor.deltaDecorations(this.monacoDecorationKeys, monacoDecorations);
  }

  private buildHighlightDebounced = lodashDebounce(this.buildHighlight.bind(this), 20);

  public changeLanguage(language: Language) {
    this.language = language;
    this.tree = language.parser.parse(this.editor.getValue());
    this.buildHighlight();
  }

  /**
   * Refresh the editor's highlight. Usually called after switching theme.
   */
  public refresh() {
    this.buildHighlight();
  }
}
