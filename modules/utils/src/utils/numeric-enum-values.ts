/** Numeric values of a numeric enum (filters out the reverse string mapping). */
export function numericEnumValues<T extends Record<string, string | number>>(
  enumMap: T
): number[] {
  return Object.values(enumMap).filter((value): value is number => typeof value === 'number');
}
