import * as jsonc from 'jsonc-parser';
import { ILinterRule, LintResult, Signal, LintSeverity, LinterRuleConfig } from './rule';
import { METRIC_PATTERNS } from '../../utils/suggestedMetricPatterns';

/**
 * Rule that suggests adding suggestedMetric properties based on signal ID and name patterns
 * 
 * Uses the canonical METRIC_PATTERNS from suggestedMetricPatterns.ts as the single source of truth.
 * This eliminates duplication and ensures the VSCode plugin and CLI always use identical patterns.
 */
export class SuggestedMetricSuggestionRule implements ILinterRule {
  private readonly metricPatterns = METRIC_PATTERNS;

  /**
   * Gets the rule configuration
   */
  public getConfig(): LinterRuleConfig {
    return {
      id: 'suggested-metric-suggestion',
      name: 'Suggested Metric Suggestion',
      description: 'Suggests adding suggestedMetric properties based on signal ID and name patterns',
      severity: LintSeverity.Information,
      enabled: false, // Disabled - now handled by CodeLens
    };
  }

  /**
   * Validates a signal against this rule
   * @param signal The signal to validate
   * @param node The JSONC node for the signal
   */
  public validateSignal(signal: Signal, node: jsonc.Node): LintResult | null {
    // Skip if signal already has a suggestedMetric
    if (signal.suggestedMetric) {
      return null;
    }

    // Skip if signal doesn't have both ID and name
    if (!signal.id || !signal.name) {
      return null;
    }

    // Check each pattern from the canonical source
    for (const pattern of this.metricPatterns) {
      const idMatches = pattern.idPattern ? pattern.idPattern.test(signal.id) : false;
      const nameMatches = pattern.namePattern ? pattern.namePattern.test(signal.name) : false;

      // Check if name matches exclusion pattern
      const excludedByName = pattern.excludeNamePattern && pattern.excludeNamePattern.test(signal.name);

      // Match if either ID or name matches (or both), and not excluded by name
      if ((idMatches || nameMatches) && !excludedByName) {
        return {
          ruleId: this.getConfig().id,
          message: `Consider adding suggestedMetric: "${pattern.suggestedMetric}" (${pattern.description})`,
          node: node,
          suggestion: {
            title: `Add suggestedMetric: "${pattern.suggestedMetric}"`,
            edits: [{
              newText: this.createSignalWithSuggestedMetric(signal, node, pattern.suggestedMetric),
              offset: node.offset,
              length: node.length
            }]
          }
        };
      }
    }

    return null;
  }

  /**
   * Creates the updated signal JSON with suggestedMetric added
   */
  private createSignalWithSuggestedMetric(signal: Signal, node: jsonc.Node, suggestedMetric: string): string {
    // Get the signal object value (not the node itself)
    const signalObj = jsonc.getNodeValue(node) as any;

    // Build the new signal object with suggestedMetric inserted after name
    const orderedSignal: any = {};

    // Add properties in the desired order: id, path, fmt, name, suggestedMetric, then rest
    if (signalObj.id !== undefined) orderedSignal.id = signalObj.id;
    if (signalObj.path !== undefined) orderedSignal.path = signalObj.path;
    if (signalObj.fmt !== undefined) orderedSignal.fmt = signalObj.fmt;
    if (signalObj.name !== undefined) orderedSignal.name = signalObj.name;

    // Add the suggestedMetric
    orderedSignal.suggestedMetric = suggestedMetric;

    // Add any remaining properties
    for (const key of Object.keys(signalObj)) {
      if (!orderedSignal.hasOwnProperty(key)) {
        orderedSignal[key] = signalObj[key];
      }
    }

    return JSON.stringify(orderedSignal);
  }
}
