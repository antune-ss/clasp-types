import { Definition } from "./Definition.js";
import { Builder } from "./builders/Builder.js";
import { TypedocKind } from "./schemas/TypedocJson.js";

export class Method extends Definition {

  constructor(kind: TypedocKind, depth: number) {
    super(kind, depth);
  }

  render(builder: Builder): void {
    let signatures = this.kind.signatures || [];
    if (!signatures || signatures.length === 0) return;

    signatures.forEach(signature => {
      this.addComment(builder, signature.comment);
      
      // TypeDoc >= 0.26 uses typeParameters
      const typeParams = this.buildTypeParameters(signature.typeParameters || signature.typeParameter);
      builder.append(`${this.ident()}${this.kind.name}${typeParams}(`);

      this.buildParams(builder, signature.parameters);
      builder.append('): ');

      this.buildType(builder, signature.type);
      builder.append(';').doubleLine();
    });
  }
}