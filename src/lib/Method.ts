import { Definition } from "./Definition.js";
import { Builder } from "./builders/Builder.js";
import { TypedocKind } from "./schemas/TypedocJson.js";

export class Method extends Definition {

  constructor(kind: TypedocKind, depth: number) {
    super(kind, depth);
  }

  render(builder: Builder): void {
    let signature = this.kind.signatures?.[0];
    if (!signature) return;

    this.addComment(builder, signature.comment);
    builder.append(`${this.ident()}${this.kind.name}(`);

    this.buildParams(builder, signature.parameters);
    builder.append('): ');
    
    this.buildType(builder, signature.type);
    builder.append(';').doubleLine()
  }
}