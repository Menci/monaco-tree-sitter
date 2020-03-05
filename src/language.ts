import * as Parser from "web-tree-sitter";
import { Term } from "./highlighter";

export class Language {
  // Parser
  parser: Parser;

  // Grammar
  readonly simpleTerms: Record<string, Term> = {};
  readonly complexTerms: string[] = [];
  readonly complexScopes: Record<string, Term> = {};
  readonly complexDepth: number;
  readonly complexOrder: boolean;

  /**
   * Load a grammar from a grammar JSON object. Grammar JSON files are in the "grammars" directory.
   *
   * @param grammarJson The `JSON.parse()`-ed object of grammar JSON file.
   * @param parser The web-tree-sitter parser, should be after called `.setLanguage()`. If omitted,
   * `init()` must be called to load a compiled tree-sitter language WASM file.
   */
  constructor(grammarJson: any, parser?: Parser) {
    for (const t in grammarJson.simpleTerms) this.simpleTerms[t] = grammarJson.simpleTerms[t];
    for (const t in grammarJson.complexTerms) this.complexTerms[t] = grammarJson.complexTerms[t];
    for (const t in grammarJson.complexScopes) this.complexScopes[t] = grammarJson.complexScopes[t];
    this.complexDepth = 0;
    this.complexOrder = false;
    for (const s in this.complexScopes) {
      const depth = s.split(">").length;
      if (depth > this.complexDepth) this.complexDepth = depth;
      if (s.indexOf("[") >= 0) this.complexOrder = true;
    }
    this.complexDepth--;

    if (parser) this.parser = parser;
  }

  /**
   * Initialize the parser with a tree-sitter language WASM file and web-tree-sitter module.
   */
  async init(languageWasmPath: string, Parser: typeof import("web-tree-sitter")) {
    // Initlaize parser
    this.parser = new Parser();
    const language = await Parser.Language.load(languageWasmPath);
    this.parser.setLanguage(language);
  }
}
