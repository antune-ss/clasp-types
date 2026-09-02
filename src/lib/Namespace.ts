import { Builder } from "./builders/Builder.js";
import { Interface } from "./Interface.js";
import { Method } from "./Method.js";
import { Variable } from "./Variable.js";
import { Enum } from "./Enum.js";
import { Definition } from "./Definition.js";
import { TypedocKind, ReflectionKind } from "./schemas/TypedocJson.js";

export class Namespace extends Definition {


  constructor(kind: TypedocKind, depth: number) {
    super(kind, depth);
  }

  render(builder: Builder): void {
    let children = this.kind.children || [];

    const isPublic = (k: TypedocKind) => k.flags?.isPublic || false;
    const isExported = (k: TypedocKind) => k.flags?.isExported || false;

    let namespaces = children
      .filter(isPublic)
      .filter(k => k.kind === ReflectionKind.Module || k.kind === ReflectionKind.Namespace)
      .map(k => new Namespace(k, this.tab()));

    let interfaces = children
      .filter(isPublic)
      .filter(k => k.kind === ReflectionKind.Class || k.kind === ReflectionKind.Interface)
      .map(k => new Interface(k, this.tab()));

    let enums = children
      .filter(isPublic)
      .filter(k => k.kind === ReflectionKind.Enum)
      .map(k => new Enum(k, this.tab()));

    let variables = children
      .filter(k => isPublic(k) || isExported(k))
      .filter(k => k.kind === ReflectionKind.Variable)
      .map(k => new Variable(k, this.tab()));

    builder.append(`${this.ident()}${this.depth === 0 ? 'declare ' : ''}namespace ${this.kind.name} {`).doubleLine();

    namespaces.forEach(n => n.render(builder));
    interfaces.forEach(i => i.render(builder));
    enums.forEach(e => e.render(builder));
    variables.forEach(v => v.render(builder));

    builder.append(`${this.ident()}}`).doubleLine();
  }

}