export interface ScriptBlock {
  id: number;
  type: string;
  text: string;
  name?: string;
}

let _uid = 500;
export function uid(): number {
  return ++_uid;
}

export function resetUidSeed(n: number) {
  _uid = n;
}

export function cloneBlocks(blocks: ScriptBlock[]): ScriptBlock[] {
  return blocks.map((b) => ({ ...b }));
}
