// Minimal type declarations for bun:test compatible with TypeScript 3.9
declare module "bun:test" {
    export function describe(name: string, fn: () => void): void;
    export function test(name: string, fn: () => void | Promise<void>): void;
    export function expect<T>(value: T): {
        toBe(expected: T): void;
        toContain(expected: string): void;
    };
}
