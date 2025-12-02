# AGENTS.md

## Build Commands
- `yarn build` - Compile TypeScript to dist/
- `yarn clean` - Remove dist/ folder
- `yarn watch` - Watch mode for development

## Project Structure
- CLI tool generating `.d.ts` files for Google Apps Script (clasp) projects
- Entry point: `src/index.ts` - Uses Commander for CLI parsing
- Core classes in `src/lib/`: Definition (base), Interface, Method, Namespace, Enum, Property, Variable
- Builders in `src/lib/builders/`: Builder (base), LibraryBuilder, ClientSideBuilder, ReadmeBuilder, LicenseBuilder

## Code Style
- TypeScript with strict mode enabled
- Imports: Named imports, group by external libs first, then internal modules
- Classes: PascalCase, abstract base classes (Builder, Definition) with concrete implementations
- Methods: camelCase, fluent builder pattern (return `this` for chaining)
- Use `const` for immutables, `let` for variables
- 4-space indentation
- Error handling: try/catch with console.log and process.exit(1)
- No semicolons are inconsistently used - prefer adding them
