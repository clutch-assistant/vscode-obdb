/**
 * CLI-specific linter wrapper
 * 
 * Uses the same pure linting logic as the VSCode plugin (via BaseLinter),
 * but doesn't require vscode or any UI framework.
 */

import { BaseLinter } from './baseLinter';

/**
 * CLI Signal Linter - runs all linting rules without framework dependencies
 * 
 * Inherits all linting methods from BaseLinter.
 * To use: instantiate and call lintSignal(), lintCommand(), lintDocument(), etc.
 */
export class CliSignalLinter extends BaseLinter {
  constructor() {
    super();
  }
}
