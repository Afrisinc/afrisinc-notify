/**
 * Template Utilities
 * Helper functions for working with template data
 */

/**
 * Extract variable names from a template object
 * Handles both API format (requiredVariables) and mock data format (variables)
 *
 * API format: requiredVariables = [{name, type, required}, ...]
 * Mock format: variables = ["name1", "name2", ...]
 */
export function extractVariableNames(template: any): string[] {
  if (!template) return [];

  // Check requiredVariables first (API format)
  if (Array.isArray(template.requiredVariables) && template.requiredVariables.length > 0) {
    return template.requiredVariables.map((v: any) =>
      typeof v === "string" ? v : v.name
    ).filter(Boolean);
  }

  // Fall back to variables (mock data format)
  if (Array.isArray(template.variables) && template.variables.length > 0) {
    return template.variables.map((v: any) =>
      typeof v === "string" ? v : v.name
    ).filter(Boolean);
  }

  return [];
}

/**
 * Normalize template data to handle both API and mock formats
 */
export function normalizeTemplate(tpl: any) {
  return {
    id: tpl.id,
    name: tpl.name || tpl.code || "Untitled",
    code: tpl.code || "",
    channel: tpl.channel || "",
    variables: extractVariableNames(tpl),
    createdBy: tpl.createdBy || "System",
    updatedAt: tpl.updatedAt ? new Date(tpl.updatedAt).toLocaleDateString() : "Unknown",
    version: tpl.version || 1,
    active: tpl.active,
    status: tpl.status || (tpl.active ? "active" : "draft"),
  };
}
