import { Definition } from "./Definition.js";
import { Builder } from "./builders/Builder.js";
import { TypedocKind } from "./schemas/TypedocJson.js";

export class Property extends Definition {


  constructor(kind: TypedocKind, depth: number) {
    super(kind, depth);
  }

  render(builder: Builder): void {
    this.addComment(builder, this.kind.comment);
    let sep = this.kind.flags?.isOptional ? '?:' : ':';

    builder.append(`${this.ident()}${this.kind.name}${sep} `);

    if (this.kind.flags?.isTypeof) {
      builder.append('typeof ');
    }
    
    if (this.kind.type) {
      this.buildType(builder, this.kind.type)
      builder.append(';').doubleLine();
    }
  }

}