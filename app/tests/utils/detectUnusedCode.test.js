/**
 * @vitest-environment node
 */

/**
 * # How This Unused Code Detector Works
 * This implementation provides two separate analyses:

 * 1. Unused Files Detection
 * Identifies files that exist in your source directory but aren't imported anywhere. It:
 *
 * - Builds a list of all source files in your project
 * - Tracks all import statements throughout your codebase
 * - Resolves those imports to actual files
 * - Identifies files that aren't imported anywhere
 * - Makes special exceptions for entry points and special directories
 * 
 * 2. Unused Exports Detection
 * Identifies exports from modules that aren't imported anywhere else:
 *
 * - Extracts all exports from every file in your project
 * - Extracts all imports and tracks what's being imported from where
 * - Compares the two lists to find exports that are never imported
 * - Special handling for index files that might be public API entry points
 * 
 * ## Key Features
 * 1. Smart Exclusions:
 *  - Automatically excludes entry point files like main.js and index.js
 *  - Ignores special directories like assets, styles, and types
 *  - Avoids false positives with common patterns
 * 
 * 2. Informative Warnings:
 *  - Uses colored console output for easy scanning
 *  - Provides context for why files might be considered "unused"
 *  - Shows file paths relative to src directory for clarity
 * 
 * 3. Multiple Analysis Types:
 *  - File-level analysis to find completely unused files
 *  - Export-level analysis to find unused functions/components within used files
 *  
 * 4. Developer-Friendly Output:
 *  - Includes notes about possible false positives
 *  - Doesn't fail the test, just provides informational warnings
 *  - Clear about the limitations of static analysis
 * 
 * ## Using the Results
 * Since this is informational rather than a strict test, it's designed to help you:
 *
 * 1. Clean Up Dead Code: Identify and remove truly unused files
 * 2. Refactor Modules: Find exports that might be unnecessary
 * 3. Improve Documentation: Better understand which parts of your app are actively used
 * 
 * The test won't fail the build, following your request to just provide warnings. 
 * This is the right approach for this kind of analysis since it can have false positives 
 * in complex apps, especially those with dynamic imports or non-standard module resolution.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

const srcDir = path.resolve(__dirname, '../../src');

// Import aliases from Vite config
const viteConfig = fs.readFileSync(path.resolve(__dirname, '../../vite.config.js'), 'utf-8');
let aliases = {};

// Extract alias definitions using regex
const aliasRegex = /alias\s*:\s*{([^}]*)}/;
const aliasMatch = viteConfig.match(aliasRegex);
if (aliasMatch && aliasMatch[1]) {
  const aliasContent = aliasMatch[1];
  const aliasLines = aliasContent.split(',').map(line => line.trim()).filter(Boolean);
  
  aliasLines.forEach(line => {
    const [key, value] = line.split(':').map(part => part.trim());
    if (key && value) {
      // Remove quotes around keys and values
      const cleanKey = key.replace(/['"]/g, '');
      const cleanValue = value.replace(/['"]/g, '');
      // Handle paths
      const normalizedValue = cleanValue.replace(/^['"]\/src\//, srcDir + '/').replace(/^['"]\/src$/, srcDir);
      aliases[cleanKey] = normalizedValue;
    }
  });
}

console.log('Loaded aliases:', aliases);

// Files that might not be directly imported but are important
const knownEntryPoints = [
  'main.js', 'main.jsx', 'main.ts', 'main.tsx',
  'index.js', 'index.jsx', 'index.ts', 'index.tsx',
  'App.js', 'App.jsx', 'App.ts', 'App.tsx',
  'vite-env.d.ts'
];

// Directories that might contain globally used files or should be excluded
const specialDirectories = [
  'assets', 'styles', 'css', 'scss', 'types', 'interfaces',
  'public', 'static', '__tests__', '__mocks__', '__snapshots__'
];

describe('Unused Code Detection', () => {
  it('should identify unused files', () => {
    const allFiles = getAllFiles(srcDir);
    const importedFiles = getImportedFiles();
    
    const potentiallyUnusedFiles = findUnusedFiles(allFiles, importedFiles);
    
    if (potentiallyUnusedFiles.length > 0) {
      console.warn('\x1b[33m%s\x1b[0m', '🗑️ Potentially Unused Files:');
      potentiallyUnusedFiles.forEach(file => {
        console.warn('\x1b[33m%s\x1b[0m', `  ${file}`);
      });
      console.warn('\x1b[36m%s\x1b[0m', '\nThese files may be unused, but verify before removing:');
      console.warn('\x1b[36m%s\x1b[0m', '- They could be used through dynamic imports');
      console.warn('\x1b[36m%s\x1b[0m', '- They might be entry points or special files');
      console.warn('\x1b[36m%s\x1b[0m', '- They might be referenced in HTML or other non-JS files');
    } else {
      console.log('\x1b[32m%s\x1b[0m', '✅ No potentially unused files detected!');
    }
    
    // Make this a warning rather than an error
    expect(true).toBe(true);
  });
  
  it('should identify unused exports', () => {
    const unusedExports = findUnusedExports();
    
    if (unusedExports.length > 0) {
      console.warn('\x1b[33m%s\x1b[0m', '📦 Potentially Unused Exports:');
      unusedExports.forEach(item => {
        console.warn('\x1b[33m%s\x1b[0m', `  In ${item.file}:`);
        item.exports.forEach(exp => {
          console.warn('\x1b[33m%s\x1b[0m', `    - ${exp.type === 'default' ? 'default export' : exp.name} (line ${exp.line})`);
        });
      });
      console.warn('\x1b[36m%s\x1b[0m', '\nThese exports may be unused, but verify before removing:');
      console.warn('\x1b[36m%s\x1b[0m', '- They could be used through dynamic imports');
      console.warn('\x1b[36m%s\x1b[0m', '- They might be used in tests or other non-source files');
      console.warn('\x1b[36m%s\x1b[0m', '- They might be public API endpoints');
    } else {
      console.log('\x1b[32m%s\x1b[0m', '✅ No potentially unused exports detected!');
    }
    
    // Make this a warning rather than an error
    expect(true).toBe(true);
  });
});

/**
 * Get all JS/JSX/TS/TSX files in the src directory
 * @returns {Array} Array of file paths
 */
function getAllFiles(dir) {
  const files = [];
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const itemPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      files.push(...getAllFiles(itemPath));
    } else if (/\.(js|jsx|ts|tsx)$/.test(item.name) && !item.name.includes('.test.')) {
      files.push(itemPath);
    }
  }
  
  return files;
}

/**
 * Get all imported files throughout the project
 * @returns {Set} Set of imported file paths
 */
function getImportedFiles() {
  const importedFiles = new Set();
  const allFiles = getAllFiles(srcDir);
  
  // Add entry points to the set
  addEntryPoints(importedFiles);
  
  for (const file of allFiles) {
    const imports = extractImports(file);
    
    for (const importPath of imports) {
      // Skip external dependencies (node_modules) but keep aliased paths
      if (!importPath.startsWith('.') && 
          !importPath.startsWith('/') && 
          !importPath.startsWith('@/') &&
          // Check if the import matches any of the aliases
          !Object.keys(aliases).some(alias => 
            importPath === alias || importPath.startsWith(`${alias}/`)
          )) {
        continue;
      }
      
      const resolvedPath = resolveImportPath(importPath, file);
      if (resolvedPath) {
        importedFiles.add(resolvedPath);
      }
    }
  }
  
  return importedFiles;
}

/**
 * Add known entry points and special files to the imported set
 * @param {Set} importedFiles Set to add entry points to
 */
function addEntryPoints(importedFiles) {
  // Add main file and other entry points
  for (const entryPoint of knownEntryPoints) {
    const entryPath = path.join(srcDir, entryPoint);
    if (fs.existsSync(entryPath)) {
      importedFiles.add(entryPath);
    }
  }
  
  // Look for index files in each directory
  const directories = getAllDirectories(srcDir);
  for (const dir of directories) {
    for (const entryPoint of knownEntryPoints) {
      const indexPath = path.join(dir, entryPoint);
      if (fs.existsSync(indexPath)) {
        importedFiles.add(indexPath);
      }
    }
  }
}

/**
 * Get all directories in the src directory
 * @param {string} dir Directory to scan
 * @returns {Array} Array of directory paths
 */
function getAllDirectories(dir) {
  const directories = [];
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const itemPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      directories.push(itemPath);
      directories.push(...getAllDirectories(itemPath));
    }
  }
  
  return directories;
}

/**
 * Extract all imports from a file
 * @param {string} filePath Path to the file
 * @returns {Array} Array of import paths
 */
function extractImports(filePath) {
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
    // Handle standard imports: import X from 'path'
    ImportDeclaration(path) {
      imports.push(path.node.source.value);
    },
    
    // Handle dynamic imports: import('path')
    CallExpression(path) {
      if (path.node.callee.type === 'Import' && 
          path.node.arguments.length > 0 &&
          path.node.arguments[0].type === 'StringLiteral') {
        imports.push(path.node.arguments[0].value);
      }
    },
    
    // Handle require calls: require('path')
    CallExpression(path) {
      if (path.node.callee.type === 'Identifier' && 
          path.node.callee.name === 'require' &&
          path.node.arguments.length > 0 &&
          path.node.arguments[0].type === 'StringLiteral') {
        imports.push(path.node.arguments[0].value);
      }
    }
  });
  
  return imports;
}

/**
 * Resolve an import path to an actual file path
 * @param {string} importPath Import path
 * @param {string} fromFile Path of the file containing the import
 * @returns {string} Resolved file path or null
 */
// Now update resolveImportPath function to use these aliases
function resolveImportPath(importPath, fromFile) {
  // Check if import uses an alias
  for (const [alias, aliasPath] of Object.entries(aliases)) {
    if (importPath === alias || importPath.startsWith(`${alias}/`)) {
      // Replace alias with the actual path
      const relativePath = importPath === alias ? '' : importPath.substring(alias.length + 1);
      const absolutePath = path.join(aliasPath, relativePath);
      return findActualFile(absolutePath);
    }
  }
  
  // Handle relative paths
  if (importPath.startsWith('.')) {
    const dirName = path.dirname(fromFile);
    const absolutePath = path.resolve(dirName, importPath);
    return findActualFile(absolutePath);
  }
  
  // Handle absolute paths
  if (importPath.startsWith('/')) {
    const projectRoot = path.resolve(srcDir, '..');
    const absolutePath = path.join(projectRoot, importPath);
    return findActualFile(absolutePath);
  }
  
  // For external imports, return null
  return null;
}

/**
 * Find the actual file with extensions
 * @param {string} absolutePath Base path without extension
 * @returns {string|null} The file path with extension or null
 */
// Improve the findActualFile function for more accurate resolution
function findActualFile(absolutePath) {
  // First try the exact path
  if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
    return absolutePath;
  }
  
  const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
  
  // Try with extensions
  for (const ext of extensions) {
    const pathWithExt = `${absolutePath}${ext}`;
    if (fs.existsSync(pathWithExt)) {
      return pathWithExt;
    }
  }
  
  // Try as directory with index files
  if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()) {
    for (const ext of extensions) {
      const indexPath = path.join(absolutePath, `index${ext}`);
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }
    }
  }
  
  return null;
}

/**
 * Find files that are not imported anywhere
 * @param {Array} allFiles All files in the src directory
 * @param {Set} importedFiles Files that are imported somewhere
 * @returns {Array} Files that are not imported anywhere
 */
function findUnusedFiles(allFiles, importedFiles) {
  const unusedFiles = [];
  
  for (const file of allFiles) {
    // Skip if this file is imported
    if (importedFiles.has(file)) {
      continue;
    }
    
    // Skip known entry points
    if (knownEntryPoints.some(entry => file.endsWith(entry))) {
      continue;
    }
    
    // Skip special directories
    if (specialDirectories.some(dir => file.includes(`/${dir}/`) || file.includes(`\\${dir}\\`))) {
      continue;
    }
    
    // Add to unused files list
    unusedFiles.push(path.relative(srcDir, file));
  }
  
  return unusedFiles;
}

/**
 * Find exports that are not imported anywhere
 * @returns {Array} List of files with unused exports
 */
function findUnusedExports() {
  const allExports = getAllExports();
  const allImports = getAllImports();
  const unusedExports = [];
  
  for (const [filePath, exports] of Object.entries(allExports)) {
    const fileUnusedExports = [];
    
    // Skip index files and likely public API files
    if (path.basename(filePath).startsWith('index.')) {
      continue;
    }
    
    // Skip files in special directories
    if (specialDirectories.some(dir => filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`))) {
      continue;
    }
    
    // Check for unused exports
    for (const exp of exports) {
      // Skip default exports for now as they are harder to track accurately
      if (exp.type === 'default') {
        continue;
      }
      
      // Check if this export is imported anywhere
      let isUsed = false;
      
      for (const imports of Object.values(allImports)) {
        if (imports.some(imp => imp.source === filePath && 
                        (imp.imported === exp.name || imp.imported === '*'))) {
          isUsed = true;
          break;
        }
      }
      
      if (!isUsed) {
        fileUnusedExports.push(exp);
      }
    }
    
    // Add to the list if we found unused exports
    if (fileUnusedExports.length > 0) {
      unusedExports.push({
        file: path.relative(srcDir, filePath),
        exports: fileUnusedExports
      });
    }
  }
  
  return unusedExports;
}

/**
 * Get all exports from all files
 * @returns {Object} Map of file paths to their exports
 */
function getAllExports() {
  const allExports = {};
  const files = getAllFiles(srcDir);
  
  for (const file of files) {
    const fileExports = extractExports(file);
    if (fileExports.length > 0) {
      allExports[file] = fileExports;
    }
  }
  
  return allExports;
}

/**
 * Get all imports from all files
 * @returns {Object} Map of file paths to their imports
 */
function getAllImports() {
  const allImports = {};
  const files = getAllFiles(srcDir);
  
  for (const file of files) {
    const fileImports = extractDetailedImports(file);
    if (fileImports.length > 0) {
      allImports[file] = fileImports;
    }
  }
  
  return allImports;
}

/**
 * Extract detailed information about imports from a file
 * @param {string} filePath Path to the file
 * @returns {Array} Array of import objects with source and imported name
 */
function extractDetailedImports(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    return [];
  }
  
  let ast;
  try {
    ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch (err) {
    return [];
  }
  
  const imports = [];
  
  traverse(ast, {
    ImportDeclaration(path) {
      const sourcePath = path.node.source.value;
      const resolvedSource = resolveImportPath(sourcePath, filePath);
      
      if (!resolvedSource) {
        return;
      }
      
      // Handle default imports
      const defaultSpecifier = path.node.specifiers.find(s => s.type === 'ImportDefaultSpecifier');
      if (defaultSpecifier) {
        imports.push({
          source: resolvedSource,
          imported: 'default',
          local: defaultSpecifier.local.name
        });
      }
      
      // Handle namespace imports
      const namespaceSpecifier = path.node.specifiers.find(s => s.type === 'ImportNamespaceSpecifier');
      if (namespaceSpecifier) {
        imports.push({
          source: resolvedSource,
          imported: '*',
          local: namespaceSpecifier.local.name
        });
      }
      
      // Handle named imports
      const namedSpecifiers = path.node.specifiers.filter(s => s.type === 'ImportSpecifier');
      for (const specifier of namedSpecifiers) {
        imports.push({
          source: resolvedSource,
          imported: specifier.imported ? specifier.imported.name : specifier.local.name,
          local: specifier.local.name
        });
      }
    }
  });
  
  return imports;
}

/**
 * Extract exports from a file
 * @param {string} filePath Path to the file
 * @returns {Array} Array of export objects with type, name, and line
 */
function extractExports(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    return [];
  }
  
  let ast;
  try {
    ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch (err) {
    return [];
  }
  
  const exports = [];
  
  traverse(ast, {
    // Handle: export default ...
    ExportDefaultDeclaration(path) {
      exports.push({
        type: 'default',
        name: 'default',
        line: path.node.loc.start.line
      });
    },
    
    // Handle: export function name() {}
    ExportNamedDeclaration(path) {
      if (path.node.declaration) {
        if (path.node.declaration.type === 'FunctionDeclaration' && path.node.declaration.id) {
          exports.push({
            type: 'named',
            name: path.node.declaration.id.name,
            line: path.node.loc.start.line
          });
        } else if (path.node.declaration.type === 'VariableDeclaration') {
          path.node.declaration.declarations.forEach(declaration => {
            if (declaration.id.type === 'Identifier') {
              exports.push({
                type: 'named',
                name: declaration.id.name,
                line: path.node.loc.start.line
              });
            }
          });
        } else if (path.node.declaration.type === 'ClassDeclaration' && path.node.declaration.id) {
          exports.push({
            type: 'named',
            name: path.node.declaration.id.name,
            line: path.node.loc.start.line
          });
        }
      }
      
      // Handle: export { name1, name2 }
      if (path.node.specifiers) {
        path.node.specifiers.forEach(specifier => {
          if (specifier.exported && specifier.exported.type === 'Identifier') {
            exports.push({
              type: 'named',
              name: specifier.exported.name,
              line: path.node.loc.start.line
            });
          }
        });
      }
    }
  });
  
  return exports;
}