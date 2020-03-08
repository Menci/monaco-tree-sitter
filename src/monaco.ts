import MonacoModule = require("monaco-editor");
import { Theme } from "./theme";

export let Monaco: typeof MonacoModule;

export function provideMonacoModule(module: typeof MonacoModule) {
  if (!Monaco) {
    Monaco = module;
    Theme.load(Theme.config);
  }
}
