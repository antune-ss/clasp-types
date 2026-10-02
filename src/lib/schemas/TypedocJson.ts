export interface TypedocKind {
  name: string
  kind: ReflectionKind | number
  flags: {
    isExported?: boolean
    isOptional?: boolean
    isTypeof?: boolean
    isConst?: boolean
    isPublic?: boolean
  }
  children?: TypedocKind[]
  signatures?: TypedocSignature[]
  comment?: TypedocComment
  defaultValue?: string
  type?: TypedocType
  typeParameter?: TypedocTypeParameter[]
}

export interface TypedocTypeParameter {
  id?: number
  name: string
  variant?: string
  kind?: number
  type?: TypedocType
}

export interface TypedocSignature {
  id?: number
  name?: string
  variant?: string
  kind?: number
  type: TypedocType
  comment?: TypedocComment
  parameters?: TypedocParameter[]
}

export interface TypedocComment {
  summary?: TypedocContent[]
  modifierTags?: string[]
  blockTags?: TypedocTag[]
}

export interface TypedocTag {
  tag: string
  name?: string
  content: TypedocContent[]
}

export interface TypedocContent {
  kind: string
  text: string
}

export interface TypedocType {
  type: string
  value?: string
  name?: string
  qualifiedName?: string
  declaration?: TypedocDeclaration
  types?: TypedocType[]
  elementType?: TypedocType
  typeArguments?: TypedocType[]
}

export interface TypedocParameter {
  id?: number
  name: string
  variant?: string
  kind?: number
  type: TypedocType
  defaultValue?: string
  comment?: TypedocComment
  flags: {
    isOptional?: boolean
    isRest?: boolean
  }
}

export interface TypedocDeclaration {
  signatures?: TypedocSignature[]
  children?: TypedocParameter[]
  indexSignature?: TypedocSignature[]
}

export enum ReflectionKind {
  Project = 1,
  Module = 2,
  Namespace = 4,
  Enum = 8,
  EnumMember = 16,
  Variable = 32,
  Function = 64,
  Class = 128,
  Interface = 256,
  Constructor = 512,
  Property = 1024,
  Method = 2048,
  CallSignature = 4096,
  IndexSignature = 8192,
  ConstructorSignature = 16384,
  Parameter = 32768,
  TypeLiteral = 65536,
  TypeParameter = 131072
}