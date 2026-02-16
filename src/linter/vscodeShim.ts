/**
 * Minimal vscode shim for CLI use - provides just enough for linter rules to work
 */

export interface Position {
  line: number;
  character: number;
}

export interface Range {
  start: Position;
  end: Position;
}

export enum DiagnosticSeverity {
  Hint = 3,
  Information = 2,
  Warning = 1,
  Error = 0,
}

export interface Diagnostic {
  range: Range;
  message: string;
  severity?: DiagnosticSeverity;
  code?: string;
  source?: string;
}

export interface TextDocument {
  uri?: {
    fsPath: string;
  };
  getText(): string;
  getWordRangeAtPosition(position: Position): Range | undefined;
  lineAt(lineNumber: number): {
    text: string;
    lineNumber: number;
    range: Range;
  };
}

export interface CodeAction {
  title: string;
  kind?: string;
  edit?: {
    changes: { [uri: string]: any[] };
  };
}

// Dummy TextDocument implementation
export function createTextDocument(content: string): TextDocument {
  const lines = content.split('\n');
  return {
    getText: () => content,
    getWordRangeAtPosition: () => undefined,
    lineAt: (lineNumber: number) => ({
      text: lines[lineNumber] || '',
      lineNumber,
      range: {
        start: { line: lineNumber, character: 0 },
        end: { line: lineNumber, character: lines[lineNumber]?.length || 0 }
      }
    })
  };
}
