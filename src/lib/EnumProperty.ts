import { Definition } from "./Definition.js";
import { Builder } from "./builders/Builder.js";
import { TypedocKind } from "./schemas/TypedocJson.js";

export class EnumProperty extends Definition {

  constructor(kind: TypedocKind, depth: number) {
    super(kind, depth);
  }

  render(builder: Builder): void {
    this.addComment(builder, this.kind.comment);

    // Se não tiver valor padrão, a string fica vazia (não imprime o '=' falso)
    let value = this.kind.defaultValue !== undefined ? ` = ${this.kind.defaultValue}` : '';

    builder.append(`${this.ident()}${this.kind.name}${value},`).doubleLine()
  }
  
}