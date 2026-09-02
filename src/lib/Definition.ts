import { Builder } from "./builders/Builder.js";
import { TypedocKind, TypedocComment, TypedocType, TypedocSignature, TypedocParameter, TypedocContent } from "./schemas/TypedocJson.js";

export abstract class Definition {
  protected kind: TypedocKind;
  protected depth: number;

  constructor(kind: TypedocKind, depth: number) {
    this.kind = kind;
    this.depth = depth;
  }

  protected ident() {
    return " ".repeat(this.depth * 4);
  }

  protected tab() {
    return this.depth + 1;
  }

  abstract render(builder: Builder): void;

  protected addComment(builder: Builder, comment: TypedocComment | undefined): void {
    if (!comment) return;

    const extractText =(content?: TypedocContent[]) => {
      return content ? content.map(c => c.text).join('') : '';
    }

    const summaryText = extractText(comment.summary).trim();
    const blockTags = comment.blockTags || [];
    const hasTags = blockTags.length > 0;

    if (summaryText || hasTags) {
      builder.append(`${this.ident()}/**`).line();

      // Escreve o Sumário Principal
      if (summaryText) {
        builder.append(`${this.ident()} * ${this.identBreaks(summaryText)}`).line();
        if (hasTags) builder.append(`${this.ident()} *`).line() // Linha em branco de separação
      }

      for (let i = 0; i < blockTags.length; i++) {
        const tag = blockTags[i];

        const namePart = tag.name ? ` ${tag.name}` : '';
        const tagText = extractText(tag.content).trim();

        builder.append(`${this.ident()} * ${tag.tag}${namePart} ${this.identBreaks(tagText)}`).line();

        if (i + 1 < blockTags.length) {
          builder.append(`${this.ident()} *`).line(); // Linha em branco entre tags
        }
      }

      builder.append(`${this.ident()} */`).line();
    }
  }

  private identBreaks(text: string|undefined): string {
    if (text == null) {
      return '';
    }

    if (text.endsWith('\n')) {
      const pos = text.lastIndexOf('\n');
      text = text.substring(0, pos);
    }

    return text.replace(new RegExp("\n", 'g'), `\n${this.ident()} * `)
  }

  protected buildType(builder: Builder, type?: TypedocType): void {
    if (type) {
      if (type.type === 'union' && type.types) {
        type.types.filter(t => t.name !== 'undefined' && t.name !== 'false').forEach((t, key, arr) => {
          this.buildType(builder, t)
          if (!Object.is(arr.length - 1, key)) {
            //Last item
            builder.append(' | ')
          }
        });
        return
      } else if (type.type === 'array') {
        this.buildType(builder, type.elementType);
        builder.append('[]')
        return
      } else if (type.type === 'reflection' && type.declaration) {
        if (type.declaration.signatures && type.declaration.signatures.length > 0) {
          let signature = type.declaration.signatures[0];
          builder.append('(')
          this.buildParams(builder, signature.parameters || [])
          builder.append(')')
          builder.append(' => ')
          this.buildType(builder, signature.type)
        } else if (type.declaration.children && type.declaration.children.length > 0) {
          builder.append('{')
          this.buildParams(builder, type.declaration.children || [])
          builder.append('}')
        } else if (type.declaration.indexSignature && type.declaration.indexSignature.length) {
          let indexSignature = type.declaration.indexSignature[0];
          builder.append('{[')
          this.buildParams(builder, indexSignature.parameters || [])
          builder.append(']: ')
          this.buildType(builder, indexSignature.type)
          builder.append('}')
        }
        return;
      }
      
      if (type.name === 'true' || type.name === 'false') {
        builder.append('boolean');
      } else if (type.name) {
        builder.append(type.name);
        this.buildTypeArguments(builder, type.typeArguments);
      } else if (type.value !== undefined) {
        const isString = typeof type.value === 'string';
        builder.append(isString ? `"${type.value}"` : String(type.value));
      }
    }
  }

  protected buildTypeArguments(builder: Builder, typeArguments?: TypedocType[]): void {
    if (typeArguments && typeArguments.length > 0) {
      builder.append('<');
      typeArguments.forEach((arg, index, arr) => {
        this.buildType(builder, arg);
        if (index < arr.length - 1) {
          builder.append(', ');
        }
      });
      builder.append('>');
    }
  }

  protected buildParams(builder: Builder, parameters?: TypedocParameter[]) {
    if (parameters) {
      parameters.forEach((param, key, arr) => {
        this.buildParam(builder, param)
        if (!Object.is(arr.length - 1, key)) {
          builder.append(', ')
        }
      });
    }
  }

  protected buildParam(builder: Builder, param: TypedocParameter): void {
    let sep = param.flags?.isOptional ? '?:' : ':';
    let rest = param.flags?.isRest ? '...' : '';
    
    builder.append(rest).append(param.name).append(sep).append(' ');
    this.buildType(builder, param.type);
  }
}