import * as vscode from 'vscode';
import * as jsonc from 'jsonc-parser';
import { BaseLinter } from './baseLinter';
import { LintResult } from './rules/rule';
import { convertToVscodeDiagnostics } from './vscodeAdapter';

/**
 * VSCode-specific signal linter
 * 
 * Extends BaseLinter (pure linting logic) and adds VSCode-specific functionality.
 * The core linting methods are inherited from BaseLinter and are framework-agnostic.
 */
export class SignalLinter extends BaseLinter {
  private lastResults: LintResult[] = [];

  constructor() {
    super();
  }

  /**
   * Get the last lint results
   */
  public getLastResults(): LintResult[] {
    return this.lastResults;
  }

  /**
   * Set the last lint results
   */
  public setLastResults(results: LintResult[]): void {
    this.lastResults = results;
  }

  /**
   * Convert lint results to VS Code diagnostics
   * 
   * Note: The core linting logic (above methods) is vscode-agnostic and can be
   * used by other tools (CLI, etc.). This method is the vscode-specific adapter.
   */
  public toDiagnostics(document: vscode.TextDocument, results: LintResult[]): vscode.Diagnostic[] {
    this.lastResults = results; // Store the results for the code action provider

    return convertToVscodeDiagnostics(document, results, (ruleId: string) => {
      const rule = this.ruleRegistry.getRuleById(ruleId);
      if (!rule) {
        throw new Error(`Rule not found: ${ruleId}`);
      }
      return rule.getConfig().severity;
    });
  }
}