/**
 * @vitest-environment node
 */
import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

// Path to the src directory
const srcDir = path.resolve(__dirname, '../../src');

// Aliases from your vite.config.js
const aliases = {
  '@': '/src',
  'assets': '/src/assets',
  'components': '/src/components',
  'helpers': '/src/helpers',
  'hooks': '/src/hooks',
  'pages': '/src/pages',
  'services': '/src/services',
};

// Function to get all JS/JSX files
function getAllFiles(dir) {
  const files = [];
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const itemPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      files.push(...getAllFiles(itemPath));
    } else if (/\.(js|jsx)$/.test(item.name) && !item.name.includes('.test.')) {
      files.push(itemPath);
    }
  }
  
  return files;
}

// Function to extract component imports from a file using AST
function extractComponentImports(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.error(`Error reading file ${filePath}: ${err.message}`);
    return [];
  }
  
  let ast;
  try {
    ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch (err) {
    console.error(`Error parsing file ${filePath}: ${err.message}`);
    return [];
  }
  
  const imports = [];
  
  traverse(ast, {
    ImportDeclaration(path) {
      const importPath = path.node.source.value;
      
      // Extract default imports (like: import Component from 'path')
      const defaultSpecifier = path.node.specifiers.find(s => s.type === 'ImportDefaultSpecifier');
      if (defaultSpecifier) {
        const componentName = defaultSpecifier.local.name;
        if (/^[A-Z]/.test(componentName)) { // Only React components (uppercase)
          imports.push({
            type: 'default',
            component: componentName,
            path: importPath
          });
        }
      }
      
      // Extract named imports (like: import { Component } from 'path')
      const namedSpecifiers = path.node.specifiers.filter(s => s.type === 'ImportSpecifier');
      for (const specifier of namedSpecifiers) {
        const importedName = specifier.imported ? specifier.imported.name : specifier.local.name;
        const componentName = specifier.local.name;
        
        if (/^[A-Z]/.test(componentName)) { // Only React components (uppercase)
          imports.push({
            type: 'named',
            component: importedName,
            path: importPath
          });
        }
      }
    }
  });
  
  return imports;
}

// Function to extract exports from a file using AST
function extractExports(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.error(`Error reading file ${filePath}: ${err.message}`);
    return { default: null, named: [] };
  }
  
  let ast;
  try {
    ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch (err) {
    console.error(`Error parsing file ${filePath}: ${err.message}`);
    return { default: null, named: [] };
  }
  
  const exports = {
    default: null,
    named: []
  };
  
  traverse(ast, {
    // Handle: export default Component
    ExportDefaultDeclaration(path) {
      if (path.node.declaration) {
        if (path.node.declaration.type === 'Identifier') {
          exports.default = path.node.declaration.name;
        } else if (path.node.declaration.type === 'FunctionDeclaration' && path.node.declaration.id) {
          // Handle: export default function Component() {}
          exports.default = path.node.declaration.id.name;
        } else if (path.node.declaration.type === 'ClassDeclaration' && path.node.declaration.id) {
          // Handle: export default class Component {}
          exports.default = path.node.declaration.id.name;
        } else if (path.node.declaration.type === 'ArrowFunctionExpression') {
          // Anonymous arrow function
          // Look up for const Component = ... assignment
          const varDeclPath = path.scope.getBinding(path.node.specifiers?.[0]?.local?.name)?.path;
          if (varDeclPath && varDeclPath.node.id) {
            exports.default = varDeclPath.node.id.name;
          }
        }
      }
    },
    
    // Handle: export const/function/class Component
    ExportNamedDeclaration(path) {
      if (path.node.declaration) {
        // Handle: export function Component() {}
        if (path.node.declaration.type === 'FunctionDeclaration' && path.node.declaration.id) {
          exports.named.push(path.node.declaration.id.name);
        }
        // Handle: export class Component {}
        else if (path.node.declaration.type === 'ClassDeclaration' && path.node.declaration.id) {
          exports.named.push(path.node.declaration.id.name);
        }
        // Handle: export const Component = ...
        else if (path.node.declaration.type === 'VariableDeclaration') {
          for (const declarator of path.node.declaration.declarations) {
            if (declarator.id.type === 'Identifier') {
              exports.named.push(declarator.id.name);
            }
          }
        }
      }
      
      // Handle: export { Component }
      if (path.node.specifiers) {
        for (const specifier of path.node.specifiers) {
          if (specifier.local && specifier.local.name) {
            exports.named.push(specifier.local.name);
          }
        }
      }
    }
  });
  
  return exports;
}

// Function to resolve import path to file path
function resolveImportPath(importPath, filePath) {
  // Handle relative paths
  if (importPath.startsWith('.')) {
    const dirName = path.dirname(filePath);
    const absolutePath = path.resolve(dirName, importPath);
    return findActualFile(absolutePath);
  }
  
  // Handle absolute paths
  if (importPath.startsWith('/')) {
    const projectRoot = path.resolve(srcDir, '..');
    const absolutePath = path.join(projectRoot, importPath);
    return findActualFile(absolutePath);
  }
  
  // Handle aliased paths
  for (const [alias, aliasPath] of Object.entries(aliases)) {
    if (importPath.startsWith(alias + '/')) {
      const resolvedPath = importPath.replace(alias, aliasPath);
      const projectRoot = path.resolve(srcDir, '..');
      const absolutePath = path.join(projectRoot, resolvedPath);
      return findActualFile(absolutePath);
    }
  }
  
  // For external imports, return null
  return null;
}

// Helper function to find the actual file
function findActualFile(absolutePath) {
  const extensions = ['', '.js', '.jsx', '/index.js', '/index.jsx'];
  
  for (const ext of extensions) {
    const fullPath = `${absolutePath}${ext}`;
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  
  return null;
}

describe('Component export validation', () => {
  it('All imported React components should be properly exported from their source files', () => {
    const files = getAllFiles(srcDir);
    const missingExports = [];
    const importStyleMismatches = []; // New array to track style mismatches
    
    // Cache exports to avoid re-parsing
    const fileExportsCache = new Map();
    
    for (const file of files) {
      const componentImports = extractComponentImports(file);
      
      for (const imp of componentImports) {
        // Skip external component libraries
        if (!imp.path.startsWith('.') && 
            !imp.path.startsWith('/') && 
            !Object.keys(aliases).some(alias => imp.path.startsWith(alias + '/'))) {
          continue;
        }
        
        const sourceFile = resolveImportPath(imp.path, file);
        
        // Skip if source file not found
        if (!sourceFile) {
          console.log(`Warning: Could not resolve source file for ${imp.component} imported from ${file}`);
          continue;
        }
        
        // Get exports from source file (use cache if available)
        let sourceExports;
        if (fileExportsCache.has(sourceFile)) {
          sourceExports = fileExportsCache.get(sourceFile);
        } else {
          sourceExports = extractExports(sourceFile);
          fileExportsCache.set(sourceFile, sourceExports);
        }
        
        // Check if the component exists but is imported with the wrong style
        if (imp.type === 'default' && sourceExports.default !== imp.component) {
          // If using default import but component is a named export
          if (sourceExports.named.includes(imp.component)) {
            importStyleMismatches.push({
              component: imp.component,
              importedAs: 'default',
              shouldBeImportedAs: 'named',
              importedIn: path.relative(srcDir, file),
              sourceFile: path.relative(srcDir, sourceFile),
              correctImport: `import { ${imp.component} } from '${imp.path}'`
            });
            continue; // Skip the missing export check
          }
        } else if (imp.type === 'named' && !sourceExports.named.includes(imp.component)) {
          // If using named import but component is a default export
          if (sourceExports.default === imp.component) {
            importStyleMismatches.push({
              component: imp.component,
              importedAs: 'named',
              shouldBeImportedAs: 'default',
              importedIn: path.relative(srcDir, file),
              sourceFile: path.relative(srcDir, sourceFile),
              correctImport: `import ${imp.component} from '${imp.path}'`
            });
            continue; // Skip the missing export check
          }
        }
        
        // Continue with the existing check for missing exports
        if (imp.type === 'default' && sourceExports.default !== imp.component && !sourceExports.named.includes(imp.component)) {
          missingExports.push({
            component: imp.component,
            importType: 'default',
            importedIn: path.relative(srcDir, file),
            sourceFile: path.relative(srcDir, sourceFile),
            availableExports: {
              default: sourceExports.default,
              named: sourceExports.named
            }
          });
        } else if (imp.type === 'named' && !sourceExports.named.includes(imp.component)) {
          missingExports.push({
            component: imp.component,
            importType: 'named',
            importedIn: path.relative(srcDir, file),
            sourceFile: path.relative(srcDir, sourceFile),
            availableExports: {
              default: sourceExports.default,
              named: sourceExports.named
            }
          });
        }
      }
    }
    
    // First report import style mismatches
    if (importStyleMismatches.length > 0) {
      console.error('\x1b[33m%s\x1b[0m', 'Components with import style mismatches:');
      importStyleMismatches.forEach(item => {
        console.error('\x1b[33m%s\x1b[0m', `- Component: ${item.component}`);
        console.error('\x1b[33m%s\x1b[0m', `  Imported as: ${item.importedAs} in ${item.importedIn}`);
        console.error('\x1b[33m%s\x1b[0m', `  Should be imported as: ${item.shouldBeImportedAs}`);
        console.error('\x1b[33m%s\x1b[0m', `  Correct import: ${item.correctImport}`);
        console.error('\x1b[33m%s\x1b[0m', '---');
      });
    }
    
    // Then report missing exports
    if (missingExports.length > 0) {
      console.error('\x1b[31m%s\x1b[0m', 'Components with missing exports:');
      missingExports.forEach(item => {
        console.error('\x1b[31m%s\x1b[0m', `- Component: ${item.component}`);
        console.error('\x1b[31m%s\x1b[0m', `  Import type: ${item.importType}`);
        console.error('\x1b[31m%s\x1b[0m', `  Imported in: ${item.importedIn}`);
        console.error('\x1b[31m%s\x1b[0m', `  Source file: ${item.sourceFile}`);
        console.error('\x1b[31m%s\x1b[0m', `  Available exports: Default: ${item.availableExports.default}, Named: [${item.availableExports.named.join(', ')}]`);
        console.error('\x1b[31m%s\x1b[0m', '---');
      });
    }
    
    // Fail test if there are any issues
    expect(missingExports.length + importStyleMismatches.length).toEqual(0);
  });
});