/* tslint:disable */
/* eslint-disable */
/**
* @param {string} name
*/
export function greet(name: string): void;
/**
* @param {Universe} universe
* @returns {VerticesIndeces}
*/
export function mc(universe: Universe): VerticesIndeces;
/**
*/
export class Node {
  free(): void;
}
/**
*/
export class Universe {
  free(): void;
/**
* @param {number} size
* @returns {Universe}
*/
  static new(size: number): Universe;
/**
* @param {any} val
*/
  add_node(val: any): void;
}
/**
*/
export class VerticesIndeces {
  free(): void;
/**
* @returns {any}
*/
  get_vertices(): any;
/**
* @returns {any}
*/
  get_indeces(): any;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly greet: (a: number, b: number) => void;
  readonly __wbg_universe_free: (a: number) => void;
  readonly universe_new: (a: number) => number;
  readonly universe_add_node: (a: number, b: number, c: number) => void;
  readonly __wbg_node_free: (a: number) => void;
  readonly __wbg_verticesindeces_free: (a: number) => void;
  readonly verticesindeces_get_vertices: (a: number, b: number) => void;
  readonly verticesindeces_get_indeces: (a: number, b: number) => void;
  readonly mc: (a: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
