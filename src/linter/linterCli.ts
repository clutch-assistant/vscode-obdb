/**
 * CLI-specific linter that doesn't depend on vscode
 */

import * as jsonc from 'jsonc-parser';
import { RuleRegistry } from './ruleRegistry';
import { LintResult, Signal, SignalGroup, Command } from './rules/rule';

/**
 * CLI Signal Linter - runs all linting rules without vscode dependency
 */
export class CliSignalLinter {
  private ruleRegistry: RuleRegistry;

  constructor() {
    this.ruleRegistry = RuleRegistry.getInstance();
  }

  /**
   * Lint an individual signal against all enabled rules
   */
  public lintSignal(target: Signal | SignalGroup, node: jsonc.Node): LintResult[] {
    const results: LintResult[] = [];
    const enabledRules = this.ruleRegistry.getEnabledRules();

    for (const rule of enabledRules) {
      if (rule.validateSignal) {
        const ruleResult = rule.validateSignal(target, node);
        if (ruleResult) {
          if (Array.isArray(ruleResult)) {
            results.push(...ruleResult);
          } else {
            results.push(ruleResult);
          }
        }
      }
    }
    return results;
  }

  /**
   * Lint a command and its signals
   */
  public lintCommand(command: Command, commandNode: jsonc.Node, signalsInCommand: { signal: Signal, node: jsonc.Node }[]): LintResult[] {
    const results: LintResult[] = [];
    const enabledRules = this.ruleRegistry.getEnabledRules();

    for (const rule of enabledRules) {
      if (rule.validateCommand) {
        const ruleResult = rule.validateCommand(command, commandNode, signalsInCommand);
        if (ruleResult) {
          if (Array.isArray(ruleResult)) {
            results.push(...ruleResult);
          } else {
            results.push(ruleResult);
          }
        }
      }
    }
    return results;
  }

  /**
   * Lint all commands in a commands array
   */
  public lintCommands(commandsNode: jsonc.Node): LintResult[] {
    const results: LintResult[] = [];
    const enabledRules = this.ruleRegistry.getEnabledRules();

    for (const rule of enabledRules) {
      if (rule.validateCommands) {
        const ruleResult = rule.validateCommands(commandsNode);
        if (ruleResult) {
          results.push(...ruleResult);
        }
      }
    }
    return results;
  }

  /**
   * Lint the entire document
   */
  public lintDocument(rootNode: jsonc.Node): LintResult[] {
    const results: LintResult[] = [];
    const enabledRules = this.ruleRegistry.getEnabledRules();

    for (const rule of enabledRules) {
      if (rule.validateDocument) {
        const ruleResult = rule.validateDocument(rootNode);
        if (ruleResult) {
          results.push(...ruleResult);
        }
      }
    }
    return results;
  }
}
