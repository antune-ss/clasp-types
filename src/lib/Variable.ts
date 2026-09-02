import { Definition } from "./Definition.js";
import { Builder } from "./builders/Builder.js";
import { TypedocKind } from "./schemas/TypedocJson.js";

export class Variable extends Definition {

  constructor(kind: TypedocKind, depth: number) {
    super(kind, depth);
  }

  render(builder: Builder): void {
    this.addComment(builder, this.kind.comment);
    builder.append(`${this.ident()}`)

    let exportedVar = this.kind.flags?.isExported ? 'export ' : '';
    let varType = this.kind.flags?.isConst ? 'const' : 'let';

    if (this.kind.type) {
      builder.append(`${exportedVar}${varType} ${this.kind.name}: `);
      this.buildType(builder, this.kind.type)
      builder.append(`;`).doubleLine();
    }
  }
  
}