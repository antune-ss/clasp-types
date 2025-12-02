import { Builder } from "./builders/Builder";
import { Definition } from "./Definition";
import { Method } from "./Method";
import { Property } from "./Property";
import { TypedocKind, TypedocType } from "./schemas/TypedocJson";

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
    let methods = this.kind.children.filter(k => this.kind.kindString === 'Interface' ? true : k.flags.isPublic).filter(k => k.kindString === 'Method' || k.kindString === 'Function').map(k => new Method(k, this.tab()));
    let properties = this.kind.children.filter(k => this.kind.kindString === 'Interface' ? true : k.flags.isPublic).filter(k => k.kindString === 'Property').map(k => new Property(k, this.tab()));
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