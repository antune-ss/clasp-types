import { Builder } from "./Builder.js";
import { TypedocKind, ReflectionKind } from "../schemas/TypedocJson.js";
import { Namespace } from "../Namespace.js";

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ClientSideBuilder extends Builder {
  rootKind: TypedocKind;

  constructor(kind: TypedocKind) {
    super();
    this.rootKind = kind;
  }

  build(): Builder {
    let rootNamespace = new Namespace(this.prepare(this.rootKind), 0);
    rootNamespace.render(this);
    return this;
  }

  /**
   * Prepare TypedocKind with functions
   */
  private prepare(kind: TypedocKind): TypedocKind {
    kind.kind = ReflectionKind.Module;
    kind.name = 'script';

    if (!kind.children) kind.children = [];

    let flattened: TypedocKind[] = [];
    for (let c of kind.children) {
      // 2 = ReflectionKind.Module (files)
      if (c.kind === 2 && c.children) {
        flattened.push(...c.children);
      } else {
        flattened.push(c);
      }
    }
    kind.children = flattened;
    
    let children = kind.children;

    const isPublic = (k: TypedocKind) => k.flags?.isPublic || k.comment?.modifierTags?.includes('@public') || false;

    let functions = children
      .filter(isPublic)
      .filter(k => k.kind === ReflectionKind.Function)
      .map(f => {
        const sig = f.signatures?.[0];
        if (!sig) return f;

        return {
          ...f,
          signatures: [
            {
              ...sig,
              comment: undefined, // Clean old comments
              type: {
                type: 'intrinsic',
                name: `void${sig.type?.name ? ` //${sig.type.name}` : ''}`
              }
            }
          ]
        }
      });

    functions.unshift(JSON.parse(fs.readFileSync(path.join(__dirname, 'withUserObject.json')).toString()));
    functions.unshift(JSON.parse(fs.readFileSync(path.join(__dirname, 'withFailureHandler.json')).toString()));
    functions.unshift(JSON.parse(fs.readFileSync(path.join(__dirname, 'withSuccessHandler.json')).toString()));

    let runner: TypedocKind = {
      name: 'Runner',
      kind: ReflectionKind.Class,
      flags: {
        isPublic: true
      },
      children: functions,
      signatures: []
    }

    let run: TypedocKind = {
      name: 'run',
      kind: ReflectionKind.Variable,
      flags: {
        isExported: true,
      },
      children: [],
      signatures: [],
      type: {
        type: 'reference',
        name: 'Runner'
      }
    }

    kind.children = []; 
    kind.children.unshift(runner);
    kind.children.push(run);
    
    return {
      name: 'google',
      kind: ReflectionKind.Namespace,
      flags: {
        isPublic: true
      },
      children: [kind],
      signatures: []
    }
  }

}
