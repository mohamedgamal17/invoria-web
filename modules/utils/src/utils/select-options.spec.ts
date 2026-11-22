import { describe, expect, it } from 'vitest';

import type { SelectOption } from '../models/select-option';
import { buildSelectOptions } from './select-options';

enum TestStatus {
  Open = 'open',
  Closed = 'closed',
}

describe('buildSelectOptions', () => {
  it('maps values to labelled options', () => {
    expect(
      buildSelectOptions([TestStatus.Open, TestStatus.Closed], (status) =>
        status === TestStatus.Open ? 'Open' : 'Closed',
      ),
    ).toEqual([
      { label: 'Open', value: TestStatus.Open },
      { label: 'Closed', value: TestStatus.Closed },
    ]);
  });

  it('prepends the leading option when provided', () => {
    const leadingOption: SelectOption<TestStatus | null> = {
      label: 'All statuses',
      value: null,
    };

    expect(buildSelectOptions([TestStatus.Open], (status) => status, leadingOption)).toEqual([
      leadingOption,
      { label: TestStatus.Open, value: TestStatus.Open },
    ]);
  });
});
