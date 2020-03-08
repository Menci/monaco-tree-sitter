import Parser = require("web-tree-sitter");
import MonacoModule = require("monaco-editor");
import lodashDebounce = require("lodash.debounce");

import { Language } from "./language";
import { buildDecorations, Term } from "./highlighter";
import { Theme } from "./theme";
import { provideMonacoModule } from "./monaco";

export * from "./theme";
export * from "./language";
export * from "./highlighter";
export * from "./highlight";

function monacoPositionToParserPoint(position: MonacoModule.Position): Parser.Point {
  return { row: position.lineNumber, column: position.column };
}

export class MonacoTreeSitter implements MonacoModule.IDisposable {
  private tree: Parser.Tree;
  private monacoDecorationKeys: string[] = [];
  private buildHighlightDebounced: () => void;
  public dispose: () => void;

  constructor(
    Monaco: typeof MonacoModule,
    public readonly editor: MonacoModule.editor.IStandaloneCodeEditor,
    private language: Language,
    debounceUpdate: number = 15
  ) {
    provideMonacoModule(Monaco);

    this.tree = language.parser.parse(editor.getValue());
    this.buildHighlightDebounced =
      debounceUpdate == null ? this.buildHighlight : lodashDebounce(this.buildHighlight.bind(this), debounceUpdate);

    const eventListener = editor.getModel().onDidChangeContent(this.onEditorContentChange.bind(this));
    this.dispose = eventListener.dispose.bind(eventListener);

    this.buildHighlight();
  }

  private onEditorContentChange(e: MonacoModule.editor.IModelContentChangedEvent) {
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

    const monacoDecorations: MonacoModule.editor.IModelDeltaDecoration[] = [];
    for (const [term, ranges] of Object.entries(decorations)) {
      const options: MonacoModule.editor.IModelDecorationOptions = {
        inlineClassName: Theme.getClassNameOfTerm(term as Term)
      };
      for (const range of ranges) {
        monacoDecorations.push({ range, options });
      }
    }
    this.monacoDecorationKeys = this.editor.deltaDecorations(this.monacoDecorationKeys, monacoDecorations);
  }

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
