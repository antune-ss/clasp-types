import { Namespace } from "../Namespace.js";
import { TypedocKind, ReflectionKind } from "../schemas/TypedocJson.js";
import { ClaspJson } from "../schemas/ClaspJson.js";
import { Builder } from "./Builder.js";
import { PackageJson } from "../schemas/PackageJson.js";

export class LibraryBuilder extends Builder {

  rootKind: TypedocKind;
  claspJson: ClaspJson;
  packageJson: PackageJson;

  constructor(kind: TypedocKind, claspJson: ClaspJson, packageJson: PackageJson) {
    super();
    this.rootKind = kind;
    this.claspJson = claspJson;
    this.packageJson = packageJson;
  }

  build(): Builder {
    let rootNamespace = new Namespace(this.prepare(this.rootKind), 0);
    this.append(`// Type definitions for ${this.claspJson.library.name}`).line();
    this.append(`// Generated using clasp-types`).doubleLine();

    if (this.packageJson.dependencies) {
      for (let key in this.packageJson.dependencies) {
        key = key.replace('@types/', '')
        console.log(key)
        this.append(`/// <reference types="${key}" />`).doubleLine();
      }
    }

    rootNamespace.render(this);
    this.append(`declare var ${this.claspJson.library.name}: ${this.claspJson.library.namespace}.${this.claspJson.library.name};`)
    return this;
  }

  /**
   * Prepare kind with library class from functions, enums and variables
   */
  private prepare(kind: TypedocKind): TypedocKind {
    kind.kind = ReflectionKind.Module;

    if (!kind.comment) kind.comment = {};

    kind.name = this.claspJson.library.namespace;

    if (!kind.children) kind.children = [];
    let children = kind.children;

    const isPublic = (k: TypedocKind) => k.flags?.isPublic || false;
    
    let functions = children
      .filter(isPublic)
      .filter(k => k.kind === ReflectionKind.Function);

    let library: TypedocKind = {
      name: this.claspJson.library.name,
      kind: ReflectionKind.Class,
      flags: {
        isPublic: true
      },
      children: functions,
      signatures: [],
      comment: {
        summary: [
          {
            kind: 'text',
            text: `The main entry point to interact with ${this.claspJson.library.name}\n\nScript ID: **${this.claspJson.scriptId}**`
          }
        ]
      }
    }

    let enums = children
      .filter(isPublic)
      .filter(k => k.kind === ReflectionKind.Enum);

    enums.forEach(e => {
      let property: TypedocKind = {
        name: e.name,
        kind: ReflectionKind.Property,
        flags: {
          isTypeof: true,
          isPublic: true
        },
        type: {
          type: "reference",
          name: e.name,
        },
        children: [],
        signatures: [],
      }
      
      if (library.children) {
        library.children.unshift(property);
      }
    });

    let variables = children
      .filter(isPublic)
      .filter(k => k.kind === ReflectionKind.Variable);

    variables.forEach(v => {
      let varProperty: TypedocKind = {
        name: v.name,
        kind: ReflectionKind.Property,
        flags: {
          isTypeof: true,
          isPublic: true
        },
        type: {
          type: "reference",
          name: v.name,
        },
        children: [],
        signatures: [],
      }

      if (library.children) {
        library.children.unshift(varProperty);
      }
    });

    children.unshift(library);

    return kind;
  }
}
