/**
 * Safely parse ID from string or number to integer
 * @param id - The ID to parse (can be string, number, or undefined)
 * @returns Parsed integer ID or undefined if invalid
 */
export function parseId(id: string | number | undefined | null): number | undefined {
  if (id === undefined || id === null) return undefined;
  const parsed = typeof id === 'string' ? parseInt(id, 10) : id;
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Safely parse array of IDs from strings or numbers to integers
 * @param ids - Array of IDs to parse
 * @returns Array of parsed integer IDs (filters out invalid ones)
 */
export function parseIds(ids: (string | number)[] | undefined | null): number[] {
  if (!ids || !Array.isArray(ids)) return [];
  return ids
    .map(id => parseId(id))
    .filter((id): id is number => id !== undefined);
}

/**
 * Parse ID and throw error if invalid
 * @param id - The ID to parse
 * @param fieldName - Name of the field for error message
 * @returns Parsed integer ID
 * @throws Error if ID is invalid
 */
export function parseIdRequired(id: string | number | undefined | null, fieldName: string = 'ID'): number {
  const parsed = parseId(id);
  if (parsed === undefined) {
    throw new Error(`Invalid ${fieldName}: ${id}`);
  }
  return parsed;
}
