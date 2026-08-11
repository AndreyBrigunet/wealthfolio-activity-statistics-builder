type CloneFunction = <T>(value: T) => T;

function availableStructuredClone(): CloneFunction | null {
  return typeof globalThis.structuredClone === 'function' ? globalThis.structuredClone : null;
}

/** Clones the JSON-compatible data stored by this addon on older web runtimes too. */
export function cloneSerializable<T>(
  value: T,
  nativeClone: CloneFunction | null = availableStructuredClone(),
): T {
  if (nativeClone) {
    return nativeClone(value);
  }

  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    throw new Error('Cannot clone a non-serializable value');
  }
  return JSON.parse(serialized) as T;
}
