/// <reference path="./bun-test.d.ts" />
import { describe, expect, test } from "bun:test";
import { Definition } from "../src/lib/Definition";
import { Builder } from "../src/lib/builders/Builder";
import { TypedocType } from "../src/lib/schemas/TypedocJson";

// Concrete test implementation to expose protected methods
class TestDefinition extends Definition {
    constructor() {
        super({ name: "Test", kindString: "Class", children: [], signatures: [], flags: {} }, 0);
    }

    render(builder: Builder): void {
        // Not used in tests
    }

    // Expose protected method for testing
    public testBuildType(builder: Builder, type?: TypedocType): void {
        this.buildType(builder, type);
    }
}

// Concrete builder for testing
class TestBuilder extends Builder {
    protected build(): Builder {
        return this;
    }
}

function buildTypeToString(type: TypedocType): string {
    const builder = new TestBuilder();
    const definition = new TestDefinition();
    definition.testBuildType(builder, type);
    return builder.getText();
}

describe("Definition.buildType", () => {

    describe("backward compatibility - non-generic types", () => {

        test("simple reference type", () => {
            const type: TypedocType = { type: "reference", name: "string" };
            expect(buildTypeToString(type)).toBe("string");
        });

        test("boolean literal true renders as boolean", () => {
            const type: TypedocType = { type: "intrinsic", name: "true" };
            expect(buildTypeToString(type)).toBe("boolean");
        });

        test("boolean literal false renders as boolean", () => {
            const type: TypedocType = { type: "intrinsic", name: "false" };
            expect(buildTypeToString(type)).toBe("boolean");
        });

        test("string literal type", () => {
            const type: TypedocType = { type: "literal", name: "", value: "hello" };
            expect(buildTypeToString(type)).toBe('"hello"');
        });

        test("array type", () => {
            const type: TypedocType = {
                type: "array",
                name: "",
                elementType: { type: "intrinsic", name: "string" }
            };
            expect(buildTypeToString(type)).toBe("string[]");
        });

        test("union type", () => {
            const type: TypedocType = {
                type: "union",
                name: "",
                types: [
                    { type: "intrinsic", name: "string" },
                    { type: "intrinsic", name: "number" }
                ]
            };
            expect(buildTypeToString(type)).toBe("string | number");
        });

    });

    describe("generic types with typeArguments", () => {

        test("single type argument", () => {
            const type: TypedocType = {
                type: "reference",
                name: "Resource",
                typeArguments: [
                    { type: "typeParameter", name: "T" }
                ]
            };
            expect(buildTypeToString(type)).toBe("Resource<T>");
        });

        test("multiple type arguments", () => {
            const type: TypedocType = {
                type: "reference",
                name: "Map",
                typeArguments: [
                    { type: "typeParameter", name: "K" },
                    { type: "typeParameter", name: "V" }
                ]
            };
            expect(buildTypeToString(type)).toBe("Map<K, V>");
        });

        test("nested type arguments", () => {
            const type: TypedocType = {
                type: "reference",
                name: "Promise",
                typeArguments: [
                    {
                        type: "reference",
                        name: "Array",
                        typeArguments: [
                            { type: "typeParameter", name: "T" }
                        ]
                    }
                ]
            };
            expect(buildTypeToString(type)).toBe("Promise<Array<T>>");
        });

        test("type argument with concrete type", () => {
            const type: TypedocType = {
                type: "reference",
                name: "Container",
                typeArguments: [
                    { type: "reference", name: "string" }
                ]
            };
            expect(buildTypeToString(type)).toBe("Container<string>");
        });

        test("array of generic type", () => {
            const type: TypedocType = {
                type: "array",
                name: "",
                elementType: {
                    type: "reference",
                    name: "Resource",
                    typeArguments: [
                        { type: "typeParameter", name: "T" }
                    ]
                }
            };
            expect(buildTypeToString(type)).toBe("Resource<T>[]");
        });

    });

});
