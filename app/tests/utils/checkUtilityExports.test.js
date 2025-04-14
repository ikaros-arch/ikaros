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

// Function to extract utility function imports from a file using AST
function extractUtilityImports(filePath) {
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
      
      // Skip node_modules imports and imports that don't match our project paths
      if (!importPath.startsWith('.') && 
          !importPath.startsWith('/') && 
          !Object.keys(aliases).some(alias => importPath.startsWith(alias + '/'))) {
        return;
      }
      
      // Extract default imports (like: import utils from 'path')
      const defaultSpecifier = path.node.specifiers.find(s => s.type === 'ImportDefaultSpecifier');
      if (defaultSpecifier) {
        const utilName = defaultSpecifier.local.name;
        if (!/^[A-Z]/.test(utilName)) { // Only utility functions (camelCase)
          imports.push({
            type: 'default',
            utility: utilName,
            path: importPath,
            location: {
              line: path.node.loc.start.line,
              column: path.node.loc.start.column
            }
          });
        }
      }
      
      // Extract named imports (like: import { formatter } from 'path')
      const namedSpecifiers = path.node.specifiers.filter(s => s.type === 'ImportSpecifier');
      for (const specifier of namedSpecifiers) {
        const importedName = specifier.imported ? specifier.imported.name : specifier.local.name;
        const utilName = specifier.local.name;
        
        if (!/^[A-Z]/.test(importedName)) { // Only utility functions (camelCase)
          imports.push({
            type: 'named',
            utility: importedName,
            localName: utilName,
            path: importPath,
            location: {
              line: specifier.loc.start.line,
              column: specifier.loc.start.column
            }
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
    // Handle: export default object/function
    ExportDefaultDeclaration(path) {
      if (path.node.declaration) {
        if (path.node.declaration.type === 'Identifier') {
          exports.default = path.node.declaration.name;
        } else if (path.node.declaration.type === 'FunctionDeclaration' && path.node.declaration.id) {
          exports.default = path.node.declaration.id.name;
        } else if (path.node.declaration.type === 'ObjectExpression') {
          exports.default = '[object]'; // For object literal exports
        } else if (path.node.declaration.type === 'ArrowFunctionExpression') {
          exports.default = '[function]'; // For anonymous function exports
        }
      }
    },
    
    // Handle: export const/function/let/var
    ExportNamedDeclaration(path) {
      if (path.node.declaration) {
        // Handle: export function formatter() {}
        if (path.node.declaration.type === 'FunctionDeclaration' && path.node.declaration.id) {
          exports.named.push(path.node.declaration.id.name);
        }
        // Handle: export const formatter = ...
        else if (path.node.declaration.type === 'VariableDeclaration') {
          for (const declarator of path.node.declaration.declarations) {
            if (declarator.id.type === 'Identifier') {
              exports.named.push(declarator.id.name);
            }
          }
        }
      }
      
      // Handle: export { formatter, helper }
      if (path.node.specifiers) {
        for (const specifier of path.node.specifiers) {
          if (specifier.exported && specifier.exported.type === 'Identifier') {
            exports.named.push(specifier.exported.name);
          } else if (specifier.local && specifier.local.name) {
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
  const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx', '/index.ts', '/index.tsx'];
  
  for (const ext of extensions) {
    const fullPath = `${absolutePath}${ext}`;
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  
  return null;
}

describe('Utility function export validation', () => {
  it('All imported utility functions should be properly exported from their source files', () => {
    const files = getAllFiles(srcDir);
    const missingExports = [];
    const importStyleMismatches = [];
    
    // Cache exports to avoid re-parsing
    const fileExportsCache = new Map();
    
    for (const file of files) {
      const utilImports = extractUtilityImports(file);
      
      for (const imp of utilImports) {
        const sourceFile = resolveImportPath(imp.path, file);
        
        // Skip if source file not found
        if (!sourceFile) {
          console.log(`Warning: Could not resolve source file for ${imp.utility} imported from ${file}`);
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
        
        // Check if the utility exists but is imported with the wrong style
        if (imp.type === 'default' && sourceExports.default !== imp.utility) {
          // If using default import but utility is a named export
          if (sourceExports.named.includes(imp.utility)) {
            importStyleMismatches.push({
              utility: imp.utility,
              importedAs: 'default',
              shouldBeImportedAs: 'named',
              importedIn: `${path.relative(srcDir, file)}:${imp.location.line}:${imp.location.column}`,
              sourceFile: path.relative(srcDir, sourceFile),
              correctImport: `import { ${imp.utility} } from '${imp.path}'`
            });
            continue; // Skip the missing export check
          }
        } else if (imp.type === 'named' && !sourceExports.named.includes(imp.utility)) {
          // If using named import but utility is a default export
          if (sourceExports.default === imp.utility) {
            importStyleMismatches.push({
              utility: imp.utility,
              importedAs: 'named',
              shouldBeImportedAs: 'default',
              importedIn: `${path.relative(srcDir, file)}:${imp.location.line}:${imp.location.column}`,
              sourceFile: path.relative(srcDir, sourceFile),
              correctImport: `import ${imp.utility} from '${imp.path}'`
            });
            continue; // Skip the missing export check
          }
        }
        
        // Check if the utility is missing entirely
        if (imp.type === 'default' && sourceExports.default !== imp.utility && !sourceExports.named.includes(imp.utility)) {
          missingExports.push({
            utility: imp.utility,
            importType: 'default',
            importedIn: `${path.relative(srcDir, file)}:${imp.location.line}:${imp.location.column}`,
            sourceFile: path.relative(srcDir, sourceFile),
            availableExports: {
              default: sourceExports.default,
              named: sourceExports.named
            }
          });
        } else if (imp.type === 'named' && !sourceExports.named.includes(imp.utility)) {
          missingExports.push({
            utility: imp.utility,
            importType: 'named',
            importedIn: `${path.relative(srcDir, file)}:${imp.location.line}:${imp.location.column}`,
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
      console.error('\x1b[33m%s\x1b[0m', 'Utility functions with import style mismatches:');
      importStyleMismatches.forEach(item => {
        console.error('\x1b[33m%s\x1b[0m', `- Utility: ${item.utility}`);
        console.error('\x1b[33m%s\x1b[0m', `  Imported as: ${item.importedAs} in ${item.importedIn}`);
        console.error('\x1b[33m%s\x1b[0m', `  Should be imported as: ${item.shouldBeImportedAs}`);
        console.error('\x1b[33m%s\x1b[0m', `  Correct import: ${item.correctImport}`);
        console.error('\x1b[33m%s\x1b[0m', '---');
      });
    }
    
    // Then report missing exports
    if (missingExports.length > 0) {
      console.error('\x1b[31m%s\x1b[0m', 'Utility functions with missing exports:');
      missingExports.forEach(item => {
        console.error('\x1b[31m%s\x1b[0m', `- Utility: ${item.utility}`);
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