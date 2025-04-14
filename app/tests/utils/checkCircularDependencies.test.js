/**
 * @vitest-environment node
 */
/**
* ## How This Circular Dependency Detector Works
* 
* ### 1. Building the Dependency Graph
* 
* The `buildDependencyGraph()` function:
* - Scans all source files in your project
* - For each file, extracts all import statements
* - Resolves each import to an actual file path
* - Builds a graph where each node is a file and edges are dependencies
* 
* ### 2. Finding Circular Dependencies
* 
* The `findCircularDependencies()` function:
* - Uses a depth-first search (DFS) algorithm to traverse the graph
* - Maintains a "recursion stack" to detect when we revisit a node in the same path
* - When a cycle is found, it records the full path of the cycle
* - Handles nested and overlapping cycles
* 
* ### 3. Output Format
* 
* When circular dependencies are found, the output shows:
* - The number of cycles detected
* - For each cycle, the files involved, shown as a path
* - The output uses relative paths from your src directory for readability
* 
* ### Example Output
* 
* If your files `components/A.jsx` and `components/B.jsx` have circular imports:
* 
* ```
* ⭕ Circular Dependencies Detected:
*   Cycle #1: components/A.jsx → components/B.jsx → components/A.jsx
* ```
* 
* ## Benefits of Detecting Circular Dependencies
* 
* 1. **Improved Build Performance**: Circular dependencies can slow down your build process
* 2. **Better Code Organization**: Forces you to think about module boundaries
* 3. **Easier Maintenance**: Reduces unexpected side effects when changing code
* 4. **Simpler Testing**: Components with clear dependencies are easier to test
* 
* This test will help keep your codebase clean and maintainable by preventing 
* architectural problems before they become deeply embedded in your code.
*/
import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

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

describe('Circular Dependency Check', () => {
  it('should not have circular dependencies', () => {
    const dependencyGraph = buildDependencyGraph();
    const circularDeps = findCircularDependencies(dependencyGraph);
    
    if (circularDeps.length > 0) {
      console.error('\x1b[31m%s\x1b[0m', '⭕ Circular Dependencies Detected:');
      circularDeps.forEach((cycle, i) => {
        console.error('\x1b[31m%s\x1b[0m', `  Cycle #${i + 1}: ${cycle.join(' → ')} → ${cycle[0]}`);
      });
    }
    
    expect(circularDeps).toEqual([]);
  });
});

/**
 * Build a dependency graph of all source files
 * @returns {Object} A map of file paths to their dependencies
 */
function buildDependencyGraph() {
  const graph = {};
  const files = getAllFiles(srcDir);
  
  // Initialize the graph with all files
  for (const file of files) {
    graph[file] = [];
  }
  
  // Build dependencies for each file
  for (const file of files) {
    const imports = extractImports(file);
    
    for (const importPath of imports) {
      // Skip external dependencies (node_modules)
      if (!importPath.startsWith('.') && 
          !importPath.startsWith('/') && 
          !Object.keys(aliases).some(alias => importPath.startsWith(alias + '/'))) {
        continue;
      }
      
      const resolvedPath = resolveImportPath(importPath, file);
      
      if (resolvedPath && fs.existsSync(resolvedPath)) {
        // Add this dependency to the graph
        graph[file].push(resolvedPath);
      }
    }
  }
  
  return graph;
}

/**
 * Find circular dependencies in a dependency graph
 * @param {Object} graph The dependency graph
 * @returns {Array} An array of cycles found in the graph
 */
function findCircularDependencies(graph) {
  const cycles = [];
  const visited = new Set();
  const recursionStack = new Set();
  const nodesInCycle = new Set();
  
  function dfs(node, path = []) {
    // Skip if already in recursion stack
    if (recursionStack.has(node)) {
      // Found a cycle
      const cycleStart = path.indexOf(node);
      if (cycleStart !== -1) {
        const cycle = path.slice(cycleStart);
        
        // Format the paths to be relative to srcDir for readability
        const formattedCycle = cycle.map(p => path.relative(srcDir, p));
        
        cycles.push(formattedCycle);
        
        // Mark all nodes in this cycle
        cycle.forEach(n => nodesInCycle.add(n));
      }
      return;
    }
    
    // Skip if already visited and not part of a cycle
    if (visited.has(node) && !nodesInCycle.has(node)) {
      return;
    }
    
    visited.add(node);
    recursionStack.add(node);
    path.push(node);
    
    if (graph[node]) {
      for (const dependency of graph[node]) {
        dfs(dependency, [...path]);
      }
    }
    
    // Remove from recursion stack when done with this path
    recursionStack.delete(node);
  }
  
  // Run DFS from each node
  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }
  
  return cycles;
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
    }
  });
  
  return imports;
}

/**
 * Get all JS/JSX/TS/TSX files in a directory
 * @param {string} dir Directory path
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
 * Resolve an import path to an actual file path
 * @param {string} importPath The import path
 * @param {string} filePath The file containing the import
 * @returns {string|null} The resolved file path or null
 */
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

/**
 * Find the actual file with extensions
 * @param {string} absolutePath Base path without extension
 * @returns {string|null} The file path with extension or null
 */
function findActualFile(absolutePath) {
  const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '.json', '/index.js', '/index.jsx', '/index.ts', '/index.tsx'];
  
  for (const ext of extensions) {
    const fullPath = `${absolutePath}${ext}`;
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  
  return null;
}