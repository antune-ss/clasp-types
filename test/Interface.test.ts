/// <reference path="./bun-test.d.ts" />
import { describe, expect, test } from "bun:test";
import { Interface } from "../src/lib/Interface";
import { Builder } from "../src/lib/builders/Builder";
import { TypedocKind } from "../src/lib/schemas/TypedocJson";

// Concrete builder for testing
class TestBuilder extends Builder {
    protected build(): Builder {
        return this;
    }
}

function createKind(overrides: Partial<TypedocKind>): TypedocKind {
    return {
        name: "TestInterface",
        kindString: "Interface",
        children: [],
        signatures: [],
        flags: { isExported: true },
        ...overrides
    };
}

function renderInterface(kind: TypedocKind): string {
    const builder = new TestBuilder();
    const iface = new Interface(kind, 0);
    iface.render(builder);
    return builder.getText();
}

describe("Interface.render", () => {

    describe("backward compatibility - non-generic interfaces", () => {

        test("simple interface with property", () => {
            const kind = createKind({
                name: "Simple",
                children: [
                    {
                        name: "value",
                        kindString: "Property",
                        children: [],
                        signatures: [],
                        flags: {},
                        type: { type: "intrinsic", name: "string" }
                    }
                ]
            });
            const result = renderInterface(kind);
            expect(result).toContain("export interface Simple {");
            expect(result).toContain("value: string");
        });

        test("simple interface with method", () => {
            const kind = createKind({
                name: "WithMethod",
                children: [
                    {
                        name: "doSomething",
                        kindString: "Method",
                        children: [],
                        flags: {},
                        signatures: [
                            {
                                type: { type: "intrinsic", name: "void" },
                                parameters: []
                            }
                        ]
                    }
                ]
            });
            const result = renderInterface(kind);
            expect(result).toContain("export interface WithMethod {");
            expect(result).toContain("doSomething()");
        });

    });

    describe("generic interfaces with typeParameter", () => {

        test("single type parameter", () => {
            const kind = createKind({
                name: "Container",
                typeParameter: [
                    { name: "T" }
                ],
                children: [
                    {
                        name: "value",
                        kindString: "Property",
                        children: [],
                        signatures: [],
                        flags: {},
                        type: { type: "typeParameter", name: "T" }
                    }
                ]
            });
            const result = renderInterface(kind);
            expect(result).toContain("export interface Container<T> {");
        });

        test("multiple type parameters", () => {
            const kind = createKind({
                name: "Mapper",
                typeParameter: [
                    { name: "K" },
                    { name: "V" }
                ],
                children: [
                    {
                        name: "key",
                        kindString: "Property",
                        children: [],
                        signatures: [],
                        flags: {},
                        type: { type: "typeParameter", name: "K" }
                    }
                ]
            });
            const result = renderInterface(kind);
            expect(result).toContain("export interface Mapper<K, V> {");
        });

        test("type parameter with constraint", () => {
            const kind = createKind({
                name: "Repository",
                typeParameter: [
                    {
                        name: "T",
                        type: { type: "reference", name: "Entity" }
                    }
                ],
                children: [
                    {
                        name: "entity",
                        kindString: "Property",
                        children: [],
                        signatures: [],
                        flags: {},
                        type: { type: "typeParameter", name: "T" }
                    }
                ]
            });
            const result = renderInterface(kind);
            expect(result).toContain("export interface Repository<T extends Entity> {");
        });

        test("multiple type parameters with mixed constraints", () => {
            const kind = createKind({
                name: "Service",
                typeParameter: [
                    {
                        name: "T",
                        type: { type: "reference", name: "Base" }
                    },
                    { name: "K" }
                ],
                children: [
                    {
                        name: "item",
                        kindString: "Property",
                        children: [],
                        signatures: [],
                        flags: {},
                        type: { type: "typeParameter", name: "T" }
                    }
                ]
            });
            const result = renderInterface(kind);
            expect(result).toContain("export interface Service<T extends Base, K> {");
        });

        test("type parameter with generic constraint", () => {
            const kind = createKind({
                name: "AdvancedRepo",
                typeParameter: [
                    {
                        name: "T",
                        type: {
                            type: "reference",
                            name: "Resource",
                            typeArguments: [
                                { type: "typeParameter", name: "T" }
                            ]
                        }
                    }
                ],
                children: [
                    {
                        name: "resource",
                        kindString: "Property",
                        children: [],
                        signatures: [],
                        flags: {},
                        type: { type: "typeParameter", name: "T" }
                    }
                ]
            });
            const result = renderInterface(kind);
            expect(result).toContain("export interface AdvancedRepo<T extends Resource<T>> {");
        });

    });

});
