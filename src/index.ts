#!/usr/bin/env node

import { Command } from 'commander';
import * as TypeDoc from 'typedoc';
import fs from 'fs-extra';
import path from 'path';

import { LibraryBuilder } from './lib/builders/LibraryBuilder.js';
import { ClientSideBuilder } from './lib/builders/ClientSideBuilder.js';
import { ReadmeBuilder } from './lib/builders/ReadmeBuilder.js';
import { LicenseBuilder } from './lib/builders/LicenseBuilder.js';
import { PackageJson } from './lib/schemas/PackageJson.js';
import { ClaspJson } from './lib/schemas/ClaspJson.js';
import { TypedocKind } from './lib/schemas/TypedocJson.js';

const program = new Command();

program
  .description("Generate d.ts for clasp projects. File [.clasp.json] required")
  .option('-s, --src <folder>', 'Source folder', 'src')
  .option('-o, --out <folder>', 'Output folder', 'dist')
  .option('-g, --client', 'Generate client side API types', false)
  .option('-r, --root <folder>', 'Root folder of [.clasp.json] and [package.json] files', '.')
  .parse(process.argv);

const options = program.opts();

let rootDir: string = path.resolve(options.root);
let srcDir: string = path.resolve(rootDir, options.src).replace(/\\/g, '/');
let outDir: string = path.resolve(rootDir, options.out);
let gsRun: boolean = options.client;
let filename = 'index.d.ts';

await fs.ensureDir(outDir);


//Load .clasp.json
const claspJsonPath = path.resolve(rootDir, '.clasp.json');
let claspJson: ClaspJson;
try {
  claspJson = JSON.parse(fs.readFileSync(claspJsonPath).toString());
} catch (error) {
  console.log(`${claspJsonPath} NOT found!`)
  process.exit(1);
}

//Load package.json
const packageJsonPath = path.resolve(rootDir, 'package.json');
let packageJson: PackageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());
} catch (error) {
  console.log(`${packageJsonPath} NOT found!`)
  process.exit(1);
}


// Start typedoc
const typedocApp = await TypeDoc.Application.bootstrapWithPlugins({
  entryPoints: [`${srcDir}/**/*.ts`], 
  tsconfig: path.resolve(rootDir, 'tsconfig.json')
})

const project = await typedocApp.convert();

if (project) {
  const apiModelFilePath = path.resolve(outDir, 'clasp-types-temp-api-model__.json');
  try {
    //Generate api model
    await typedocApp.generateJson(project, apiModelFilePath);

    //Generate types
    let rawdata = fs.readFileSync(apiModelFilePath);
    let rootTypedoKind: TypedocKind = JSON.parse(rawdata.toString());

    if (gsRun) {
      getGSRunTypes(rootTypedoKind);
    } else {
      generateLibraryTypes(rootTypedoKind);
    }


  } catch (error) {
    console.error('Error processing while processing types: ', error);
    process.exit(1); 
  } finally {
    //Tear down
    fs.remove(apiModelFilePath);
  }
} else {
  console.log('Error reading .ts source files')
  process.exit(1);
}


function generateLibraryTypes(rootTypedocKind: TypedocKind) {
  if (!claspJson.library || !claspJson.library.name || !claspJson.library.namespace) {
    console.log('ERROR - Add library info to .clasp.json. Example:');
    console.log();
    console.log(JSON.stringify({
      "scriptId": "xxxx",
      "rootDir": "./src",
      "library": {
        "namespace": "bkper",
        "name": "BkperApp"
      }
    }, null, 2));
    console.log();
    console.log('...or run with --client option to generate google.script.run d.ts files');
    console.log();
    return;
  }

  packageJson.name = `${packageJson.name}-types`;
  packageJson.description = `Typescript definitions for ${claspJson.library.name}`;
  packageJson.scripts = {};
  packageJson.devDependencies = {};
  packageJson.license = 'MIT';

  if (packageJson.dependencies) {
    for (let key in packageJson.dependencies) {
      packageJson.dependencies[key] = '*'
    }
  }

  packageJson.types = `./${filename}`;

  const packageOutputDir = path.resolve(outDir, packageJson.name);

  // package.json
  const packageJsonPath = path.resolve(packageOutputDir, 'package.json');
  fs.outputFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // README.md
  let readmeBuilder = new ReadmeBuilder(packageJson, claspJson);
  const readmePath = path.resolve(packageOutputDir, 'README.md');
  fs.outputFileSync(readmePath, readmeBuilder.build().getText());

  // LICENSE
  let licenseBuilder = new LicenseBuilder(packageJson);
  const licensePath = path.resolve(packageOutputDir, 'LICENSE');
  fs.outputFileSync(licensePath, licenseBuilder.build().getText());

  // Library (.d.ts)
  let builder = new LibraryBuilder(rootTypedocKind, claspJson, packageJson);
  const filepath = path.resolve(packageOutputDir, filename);
  fs.outputFileSync(filepath, builder.build().getText());

  console.log(`Generated ${claspJson.library.name} definitions at ${packageOutputDir}`);
}

/**
 * Generate google.script.run d.ts file
 */
function getGSRunTypes(rootTypedoKind: TypedocKind) {
  let builder = new ClientSideBuilder(rootTypedoKind);

  const filepath = path.resolve(outDir, '@types', 'google.script.types', filename);
  fs.outputFileSync(filepath, builder.build().getText());

  console.log(`Generated google.script.types definitions at ${filepath}`);
}
