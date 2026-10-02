[BkperApp]: https://github.com/bkper/bkper-app
[API Extractor]: https://api-extractor.com/
[grant]: https://github.com/grant/google-apps-script-dts
[motemen]: https://github.com/motemen/dts-google-apps-script
[mtgto]: https://github.com/mtgto/dts-google-apps-script-advanced
[Add-on for Google Sheets]: https://workspace.google.com/marketplace/app/bkper/360398463400s
[HTML Service]: https://developers.google.com/apps-script/guides/html/communication
[Bibliotecas]: https://developers.google.com/apps-script/guides/libraries
[library]: https://developers.google.com/apps-script/guides/libraries
[Client-side API]: https://developers.google.com/apps-script/guides/html/reference/run
[clasp]: https://github.com/google/clasp
[TypeScript]: https://github.com/google/clasp/blob/master/docs/typescript.md
[inline-source-cli]: https://www.npmjs.com/package/inline-source-cli
[glob-exec]: https://www.npmjs.com/package/glob-exec
[DefinitelyTyped]: http://definitelytyped.org/
[example]: https://www.npmjs.com/package/@bkper/bkper-app-types

# clasp-types

[![npm](https://img.shields.io/npm/v/clasp-types)](https://www.npmjs.com/package/clasp-types)

*(🇺🇸 [Read in English](./README.md))*

Esse é um gerador de definições [TypeScript] para permitir que os projetos [clasp] realizem o **autocomplete** e a **verificação de tipos** para as suas [Bibliotecas] e [Client-side API]'s Orientadas a Objetos do Google Apps Script.

*Biblioteca:*
![library-autocomplete](https://raw.githubusercontent.com/bkper/clasp-types/master/imgs/library-autocomplete.png)

*Client-side API:*
![client-side-api-autocomplete](https://raw.githubusercontent.com/bkper/clasp-types/master/imgs/client-side-api-autocomplete.png)

Ele funciona como o [API Extractor], lendo os comentários ```@public``` em qualquer function, class, interface, variável ou enum que você deseje expor, e gerando os arquivos d.ts consistentemente.

## Funcionalidades

- **d.ts rollup:** Gera um único arquivo `d.ts` a partir de todos os seus arquivos `.ts`, encapsulando as funções globais dentro da interface da sua Biblioteca.

- **API limpa da biblioteca:** Expõe apenas funções, variáveis e métodos marcados com a anotação `@public`, construindo uma interface mais limpa e evitando o uso de elementos que não foram feitos para serem expostos.

- **Pronto para publicar:** Gera um pacote npm com instruções claras de configuração, pronto para ser publicado.

- **Client-side API:** Para Add-ons e Web Apps, gera as tipagens das suas funções globais expostas com `@public` num único arquivo `d.ts` (na pasta `@types`), permitindo que você tenha o *autocomplete* da API do servidor diretamente no código do cliente (front-end).

Aqui está um [exemplo] de tipagens de biblioteca criadas e publicadas com o clasp-types.

> Nota: O clasp-types foi desenvolvido para gerar os arquivos `d.ts` a partir do seu próprio código Apps Script que já está escrito em TypeScript. Para baixar as tipagens dos serviços nativos e avançados do Google Apps Script (como o `SpreadsheetApp`), veja https://github.com/grant/google-apps-script-dts

## Instalação

```
npm i -S clasp-types
```
ou
```
yarn add --dev clasp-types
```

## Comando

```
clasp-types
```

Parâmetros opcionais:
```sh
--src          <folder>    # default: ./src     - Pasta fonte dos aquivos .ts
--out          <folder>    # default: ./dist    - Pasta de saída para o arquivo .d.ts            
--client                   # default: false     - Parâmetro para gerar uma Client-side API
--root         <folder>    # default: ./        - Pasta raiz do projeto 
```

## Configuração da Biblioteca

### 1) Adicione o *namespace* e o *name* da sua biblioteca no ```.clasp.json```, eles devem ser diferentes:
```json
{
  "scriptId": "1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF",
  "rootDir": "./src",
  "library": {
    "namespace": "gsuitedevs",
    "name": "OAuth2"
  }
}
```

### 2) Adicione a anotação ```@public``` nos comentários do código que você deseja expor:

```ts
/**
 * Cria um serviço
 * 
 * @public
 */
function createService(serviceName: string) {
  return new Service(serviceName);
}

/**
 * O serviço OAuth
 * 
 * @public
 */
class Service {
  name: string;
  params_: any;
  constructor(name: string) {
    this.name = name;;
  }

  public getName() {
    return this.name;
  }
  

  /**
   * Define um parâmetro adicional a ser usado ao construir a URL de autorização.
   */
  public setParam(name: string, value: string): Service {
    this.params_[name] = value;
    return this;
  };

}
```

### Rode o ```clasp-types``` para gerar um **pacote npm** com um index.d.ts parecido com este:

```ts
declare namespace gsuitedevs {

    /**
     * O ponto de entrada principal para interagir com OAuth2
     *
     * Script ID: **1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF**
     */
    export interface OAuth2 {

        /**
         * Cria um serviço
         */
        createService(serviceName: string): Service;

    }

    /**
     * O serviço OAuth
     */
    export interface Service {

        getName(): string;

        /**
         * Define um parâmetro adicional a ser usado ao construir a URL de autorização.
         */
        setParam(name: string, value: string): Service;

    }

}

declare var OAuth2: gsuitedevs.OAuth2;
```

> *Notas:* 
> - Nas classes anotadas com ```@public```, os métodos dentro dela também devem ser marcados explicitamente como ```public``` para serem exportados. Métodos marcados como **Private** ou **protected** **não** serão expost. 
> - Interfaces e Enumerações com a anotação ```@public``` terão todos os seus membros expostos por padrão.

Um **pacote npm pronto para ser publicado** será gerado na pasta de saída (output folder), com algumas instruções de instalação no ```README.md```, assim você pode compartilhar facilmente as tipagens da sua biblioteca. Aqui está um [exemplo].

> Sugestão: Você pode adicionar uma [dist-tag](https://docs.npmjs.com/cli/dist-tag) na distribuição do seu pacote de tipos que seja igual à [version](https://developers.google.com/apps-script/guides/versions) do seu script lá no Google, por exemplo, ```v23```. Assim os usuários conseguem linkar a versão das tipagens com a versão do script, e usar aquela que for correspondente.

### Dependências

Se o seu pacote expor uma dependência transitiva nos tipos dos seus **parâmetros (params)** ou de **retorno (return)**, como por exemplo usar o `GoogleAppsScript.HTML.HtmlOutput` vindo do pacote `@types/google-apps-script`, adicione esse pacote na seção **"dependencies"** do seu `package.json`, em vez de colocar em "devDependencies":

```json
  "dependencies": {
    "@types/google-apps-script": "^0.0.59"
  }
```
Dessa forma, o ```clasp-types``` vai configurar corretamente a referência (reference tag) lá no topo do seu ```index.d.ts```:

```ts
/// <reference types="google-apps-script" />
```

E no ```package.json``` resultante da compilação, ele ficará assim:

```json
  "dependencies": {
    "@types/google-apps-script": "*"
  },
```

## Configuração da Client-side API

### 1) Adicione a anotação ```@public``` no código que você deseja expor ao cliente
```ts
/**
 * Executa uma soma no lado do servidor, a partir do lado do cliente.
 * 
 * @public
 */
function sumOnServer(a: number, b: number): number {
  return a + b;
}
```

### 2) Rode ```clasp-types --client``` para gerar um index.d.ts como esse:

```ts
declare namespace google {

    namespace script {

        export interface Runner {

            withSuccessHandler(handler: Function): Runner;

            withFailureHandler(handler: (error: Error) => void): Runner;

            withUserObject(object: any): Runner;

            sumOnServer(a: number, b: number): void //number;
            ...

        }

        export var run: Runner;

    }
    ...

}
```

### TypeScript on Client-side

Para desenvolver com [TypeScript] no lado do cliente (client-side), você deve trabalhar com arquivos `ts` separados e embutir (inline) o `js` correspondente, bem como todo o seu `css` na mesma página, a fim de que o template HTML resultante possa ser processado corretamente pelo [HTML Service].

Para realizar essa inserção de código (inlining), uma ótima ferramenta é o [inline-source-cli], através do qual você pode simplesmente adicionar uma tag `inline` nas suas referências de `js` e `css`:

```html
<head>
  ...
  <link inline href="page-style.css" rel="stylesheet">
</head>
<body>
  ...
  <script inline src="page-activity.js"></script>
  <script inline src="page-view.js"></script>
</body>
```

E então usar uma ferramenta como o [glob-exec] para embutir (inline) todos os seus códigos-fonte usando uma única linha de comando:

```sh
glob-exec --foreach './build/**/*.html' --  'cat {{file}} | inline-source --root build > dist/{{file.name}}{{file.ext}}'
```

## Background

Dont know yet

## Toda ajuda é bem-vinda (Contribuindo)
- Identificar casos extremos (*edge cases*) para parâmetros e tipos de retorno.

- Gerar arquivos `d.ts` a partir de uma biblioteca `js` bem documentada, para que a ferramenta também possa funcionar com bibliotecas como a [OAuth2](https://github.com/gsuitedevs/apps-script-oauth2).

- Gerar arquivos `ts` de cliente ([como este](https://github.com/google/apis-client-generator)) e `d.ts` a partir de especificações [openapi](https://swagger.io/specification/) e [API Discovery](https://developers.google.com/discovery/), para bibliotecas nos mesmos moldes dos [Serviços Avançados](https://developers.google.com/apps-script/guides/services/advanced).

## Créditos

Este projeto é um *fork* compatível com o TypeDoc 0.28 do repositório original [clasp-types](https://github.com/bkper/clasp-types), criado por [Mael Caldas](https://github.com/maelcaldas).