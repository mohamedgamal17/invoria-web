export enum ReturnType {
  Immediate = 0
}

export function returnTypeLabel(type: ReturnType): string {
  switch (type) {
    case ReturnType.Immediate:
      return 'Immediate';
    default:
      return 'Unknown';
  }
}
