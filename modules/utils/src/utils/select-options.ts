import type { SelectOption } from '../models/select-option';

/** Builds PrimeNG select options from enum values and a label resolver. */
export function buildSelectOptions<TValue>(
  values: readonly TValue[],
  labelFor: (value: TValue) => string,
  leadingOption?: SelectOption<TValue | null>,
): SelectOption<TValue | null>[] {
  const options: SelectOption<TValue | null>[] = values.map((value) => ({
    label: labelFor(value),
    value,
  }));
  return leadingOption ? [leadingOption, ...options] : options;
}
