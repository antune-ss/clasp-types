import { Builder } from "./builders/Builder.js";
import { Definition } from "./Definition.js";
import { Method } from "./Method.js";
import { Property } from "./Property.js";
import { TypedocComment, TypedocKind, TypedocType, ReflectionKind } from "./schemas/TypedocJson.js";

// Simple builder to capture type rendering as string
class StringBuilderCapture extends Builder {
  protected build(): Builder {
    return this;
  }
}

export class Interface extends Definition {

  constructor(kind: TypedocKind, depth: number) {
    super(kind, depth);
  }
  
  render(builder: Builder): void {
    let children = this.kind.children || [];

    const isPublic = (k: TypedocKind) => k.flags?.isPublic || k.comment?.modifierTags?.includes('@public') || false;
    const isOriginalInterface = this.kind.kind === ReflectionKind.Interface;

    let methods = children
      .filter(k => isOriginalInterface ? true : isPublic(k))
      .filter(k => k.kind === ReflectionKind.Method || k.kind === ReflectionKind.Function)
      .map(k => new Method(k, this.tab()))

    let properties = children
      .filter(k => isOriginalInterface ? true : isPublic(k))
      .filter(k => k.kind === ReflectionKind.Property)
      .map(k => new Property(k, this.tab()));

    this.addComment(builder, this.kind.comment);

    if (methods.length > 0 || properties.length > 0) {
      const typeParams = this.buildTypeParameters();
      builder.append(`${this.ident()}export interface ${this.kind.name}${typeParams} {`).doubleLine()
      properties.forEach(p => p.render(builder))
      methods.forEach(m => m.render(builder))
      builder.append(`${this.ident()}}`).doubleLine();
    }
  }

  private buildTypeParameters(): string {
    if (!this.kind.typeParameter || this.kind.typeParameter.length === 0) {
      return '';
    }

    const params = this.kind.typeParameter.map(param => {
      if (param.type) {
        const constraintBuilder = new StringBuilderCapture();
        this.buildType(constraintBuilder, param.type);
        return `${param.name} extends ${constraintBuilder.getText()}`;
      }
      return param.name;
    });

    return `<${params.join(', ')}>`;
  }

}