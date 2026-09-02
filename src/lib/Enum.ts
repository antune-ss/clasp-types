import { Definition } from "./Definition.js";
import { EnumProperty } from "./EnumProperty.js";
import { Builder } from "./builders/Builder.js";
import { TypedocKind } from "./schemas/TypedocJson.js";

export class Enum extends Definition {

  constructor(kind: TypedocKind, depth: number) {
    super(kind, depth);
  }

  render(builder: Builder): void {
    this.addComment(builder, this.kind.comment);
    let props = (this.kind.children || []).map(k => new EnumProperty(k, this.tab()));
    builder.append(`${this.ident()}export enum ${this.kind.name} {`).doubleLine()
    props.forEach(p => p.render(builder))
    builder.append(`${this.ident()}}`).doubleLine();
  }
  
}