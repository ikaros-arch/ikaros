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

// Function to get all JS/JSX/TS/TSX files
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

// Function to extract all imports from a file using AST
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
      const specifiers = path.node.specifiers.map(spec => {
        // Extract information based on specifier type
        if (spec.type === 'ImportDefaultSpecifier') {
          return {
            type: 'ImportDefaultSpecifier',
            local: { name: spec.local.name }
          };
        } else if (spec.type === 'ImportSpecifier') {
          return {
            type: 'ImportSpecifier',
            local: { name: spec.local.name },
            imported: spec.imported ? { name: spec.imported.name } : null
          };
        } else if (spec.type === 'ImportNamespaceSpecifier') {
          return {
            type: 'ImportNamespaceSpecifier',
            local: { name: spec.local.name }
          };
        }
        return null;
      }).filter(Boolean);
      
      imports.push({
        path: path.node.source.value,
        loc: path.node.loc,
        type: 'static',
        specifiers: specifiers
      });
    },
    
    // Handle dynamic imports: import('path')
    CallExpression(path) {
      if (path.node.callee.type === 'Import' && 
          path.node.arguments.length > 0 &&
          path.node.arguments[0].type === 'StringLiteral') {
        imports.push({
          path: path.node.arguments[0].value,
          loc: path.node.loc,
          type: 'dynamic',
          specifiers: [] // Dynamic imports don't have specifiers
        });
      }
    }
  });
  
  return imports;
}

/**
 * Analyzes import statements to find various issues
 * @param {Array} imports Array of imports from extractImports
 * @returns {Object} Analysis results
 */
function analyzeImports(imports) {
  // Packages that are allowed to be duplicated (common UI libraries, etc.)
  const allowedDuplicates = ['react', 'react-dom', '@mui/material', '@emotion/styled']; 
  
  const analysis = {
    duplicates: [],              // Simple duplicated paths
    mergeSuggestions: [],        // Imports that could be merged 
    wildcardWithNamed: [],       // Both wildcard and named imports used
    sideEffectImports: []        // Likely side-effect imports
  };
  
  // Group imports by path
  const importsByPath = {};
  
  // Track imports with specifiers to analyze what's being imported
  const importSpecifiersByPath = {};
  
  // First pass: collect all imports
  for (const imp of imports) {
    const { path } = imp;
    
    // Initialize if this is the first time seeing this path
    if (!importsByPath[path]) {
      importsByPath[path] = [];
      importSpecifiersByPath[path] = {
        hasWildcard: false,
        namedImports: new Set(),
        defaultImport: null,
        isSideEffect: false
      };
    }
    
    // Add this occurrence
    importsByPath[path].push({
      line: imp.loc.start.line,
      column: imp.loc.start.column,
      type: imp.type,
      // Add specifier information if available
      specifiers: imp.specifiers || []
    });
    
    // Track specifier types if available
    if (imp.specifiers) {
      // Check for wildcard imports
      const hasWildcard = imp.specifiers.some(s => s.type === 'ImportNamespaceSpecifier');
      if (hasWildcard) {
        importSpecifiersByPath[path].hasWildcard = true;
      }
      
      // Track named imports
      const namedImports = imp.specifiers
        .filter(s => s.type === 'ImportSpecifier')
        .map(s => s.imported ? s.imported.name : s.local.name);
      
      namedImports.forEach(name => {
        importSpecifiersByPath[path].namedImports.add(name);
      });
      
      // Track default import
      const defaultSpecifier = imp.specifiers.find(s => s.type === 'ImportDefaultSpecifier');
      if (defaultSpecifier) {
        importSpecifiersByPath[path].defaultImport = defaultSpecifier.local.name;
      }
      
      // Empty specifiers might indicate a side-effect import
      if (imp.specifiers.length === 0) {
        importSpecifiersByPath[path].isSideEffect = true;
      }
    }
  }
  
  // Second pass: analyze the collected imports
  for (const [path, occurrences] of Object.entries(importsByPath)) {
    // Skip if this is on the allowlist
    if (allowedDuplicates.some(allowed => path.startsWith(allowed))) {
      continue;
    }
    
    // Check for duplicates (more than one occurrence)
    if (occurrences.length > 1) {
      // Special handling for side-effect imports (like CSS)
      const isSideEffect = path.match(/\.(css|scss|less|sass|styl)$/) || 
                          importSpecifiersByPath[path].isSideEffect;
      
      if (isSideEffect) {
        analysis.sideEffectImports.push({
          path,
          locations: occurrences
        });
        continue; // Don't treat side effects as problematic duplicates
      }
      
      // Check if we have both wildcard and named imports
      const specInfo = importSpecifiersByPath[path];
      if (specInfo.hasWildcard && specInfo.namedImports.size > 0) {
        analysis.wildcardWithNamed.push({
          path,
          wildcard: specInfo.hasWildcard,
          namedImports: Array.from(specInfo.namedImports),
          defaultImport: specInfo.defaultImport,
          locations: occurrences
        });
      }
      
      // Check if we can generate a merge suggestion
      if (specInfo.namedImports.size > 0 && occurrences.length > 1) {
        // Only suggest merge if these are regular static imports
        const allStatic = occurrences.every(o => o.type === 'static');
        
        if (allStatic) {
          const mergedImport = [];
          
          // Add default import if present
          if (specInfo.defaultImport) {
            mergedImport.push(specInfo.defaultImport);
          }
          
          // Add named imports if present
          if (specInfo.namedImports.size > 0) {
            mergedImport.push(`{ ${Array.from(specInfo.namedImports).join(', ')} }`);
          }
          
          analysis.mergeSuggestions.push({
            path,
            suggestion: `import ${mergedImport.join(', ')} from '${path}';`,
            locations: occurrences
          });
        }
      }
      
      // Always record the basic duplicate
      analysis.duplicates.push({
        path,
        locations: occurrences
      });
    }
  }
  
  return analysis;
}

// Function to resolve import path (keep your existing implementation)
function resolveImportPath(importPath, filePath) {
  // Handle relative paths (starting with .)
  if (importPath.startsWith('.')) {
    const dirName = path.dirname(filePath);
    const absolutePath = path.resolve(dirName, importPath);
    
    return checkPathExists(absolutePath);
  }
  
  // Handle absolute paths (starting with /)
  if (importPath.startsWith('/')) {
    // For /src/ paths, resolve relative to project root
    const projectRoot = path.resolve(srcDir, '..');
    const absolutePath = path.join(projectRoot, importPath);
    
    return checkPathExists(absolutePath);
  }
  
  for (const [alias, aliasPath] of Object.entries(aliases)) {
    if (importPath.startsWith(alias + '/')) {
      // Replace alias with its path
      const resolvedPath = importPath.replace(alias, aliasPath);
      const projectRoot = path.resolve(srcDir, '..');
      const absolutePath = path.join(projectRoot, resolvedPath);
      
      return checkPathExists(absolutePath);
    }
  }
  
  // For other imports (node_modules, etc.), consider them valid
  return { exists: true, path: importPath };
}

// Helper function to check if path exists with various extensions
function checkPathExists(absolutePath) {
  // Try with different extensions
  const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '.json', '/index.js', '/index.jsx', '/index.ts', '/index.tsx'];
  
  for (const ext of extensions) {
    const fullPath = `${absolutePath}${ext}`;
    if (fs.existsSync(fullPath)) {
      return { exists: true, path: fullPath };
    }
  }
  
  return { exists: false, path: absolutePath };
}

describe('Import validation', () => {
  it('All local imports should be valid', () => {
    const files = getAllFiles(srcDir);
    const brokenImports = [];
    
    for (const file of files) {
      const imports = extractImports(file);
      
      for (const importItem of imports) {
        const importPath = importItem.path;
        
        // Skip only true external imports (node_modules)
        const isAlias = Object.keys(aliases).some(alias => 
          importPath.startsWith(alias + '/')
        );
        
        if (!importPath.startsWith('.') && 
            !importPath.startsWith('/') && 
            !isAlias) {
          continue;
        }
        
        const resolved = resolveImportPath(importPath, file);
        
        if (!resolved.exists) {
          brokenImports.push({
            file: path.relative(srcDir, file),
            import: importPath,
            resolvedPath: path.relative(srcDir, resolved.path)
          });
        }
      }
    }
    
    if (brokenImports.length > 0) {
      console.error('Broken imports:');
      brokenImports.forEach(({ file, import: importPath, resolvedPath }) => {
        console.error(`- File: ${file}`);
        console.error(`  Import: ${importPath}`);
        console.error(`  Resolved path: ${resolvedPath}`);
      });
    }
    
    expect(brokenImports).toEqual([]);
  });
  
  // Add a new test for duplicate imports
  it('Should have clean import statements', () => {
    const files = getAllFiles(srcDir);
    const issuesFound = [];
    
    for (const file of files) {
      const imports = extractImports(file);
      
      // Skip test if file has no imports
      if (imports.length === 0) continue;
      
      const analysis = analyzeImports(imports);
      
      // Only add to issues if we found something
      const hasIssues = [
        analysis.duplicates.length,
        analysis.mergeSuggestions.length,
        analysis.wildcardWithNamed.length
      ].some(length => length > 0);
      
      if (hasIssues) {
        issuesFound.push({
          file: path.relative(srcDir, file),
          ...analysis
        });
      }
    }
    
    // Report issues in a clear, organized way
    if (issuesFound.length > 0) {
      console.error('\x1b[33m%s\x1b[0m', '📋 Import Statement Analysis Results:');
      
      // Count total issues
      const totals = {
        files: issuesFound.length,
        duplicates: 0,
        mergeSuggestions: 0,
        wildcardWithNamed: 0,
        sideEffectImports: 0
      };
      
      issuesFound.forEach(issue => {
        totals.duplicates += issue.duplicates.length;
        totals.mergeSuggestions += issue.mergeSuggestions.length;
        totals.wildcardWithNamed += issue.wildcardWithNamed.length;
        totals.sideEffectImports += issue.sideEffectImports.length;
        
        console.error('\x1b[36m%s\x1b[0m', `\n📄 File: ${issue.file}`);
        
        // Report duplicates
        if (issue.duplicates.length > 0) {
          console.error('\x1b[33m%s\x1b[0m', '  🔄 Duplicate imports:');
          issue.duplicates.forEach(dup => {
            console.error('\x1b[33m%s\x1b[0m', `    • '${dup.path}' imported ${dup.locations.length} times`);
            dup.locations.forEach((loc, idx) => {
              console.error('\x1b[33m%s\x1b[0m', `      ${idx+1}. Line ${loc.line}`);
            });
          });
        }
        
        // Report merge suggestions
        if (issue.mergeSuggestions.length > 0) {
          console.error('\x1b[32m%s\x1b[0m', '  💡 Merge suggestions:');
          issue.mergeSuggestions.forEach(merge => {
            console.error('\x1b[32m%s\x1b[0m', `    • Multiple imports of '${merge.path}' can be merged:`);
            console.error('\x1b[32m%s\x1b[0m', `      ${merge.suggestion}`);
            console.error('\x1b[32m%s\x1b[0m', `      This replaces imports at lines: ${merge.locations.map(l => l.line).join(', ')}`);
          });
        }
        
        // Report wildcard + named import conflicts
        if (issue.wildcardWithNamed.length > 0) {
          console.error('\x1b[35m%s\x1b[0m', '  ⚠️ Wildcard with named imports:');
          issue.wildcardWithNamed.forEach(wild => {
            console.error('\x1b[35m%s\x1b[0m', `    • '${wild.path}' has both wildcard and named imports`);
            console.error('\x1b[35m%s\x1b[0m', `      Named imports: ${wild.namedImports.join(', ')}`);
            console.error('\x1b[35m%s\x1b[0m', `      This can be redundant and cause confusion`);
          });
        }
        
        // Note side effect imports (not treated as errors)
        if (issue.sideEffectImports.length > 0) {
          console.error('\x1b[34m%s\x1b[0m', '  ℹ️ Side effect imports (for reference):');
          issue.sideEffectImports.forEach(side => {
            console.error('\x1b[34m%s\x1b[0m', `    • '${side.path}' appears to be imported for side effects`);
            console.error('\x1b[34m%s\x1b[0m', `      at lines: ${side.locations.map(l => l.line).join(', ')}`);
          });
        }
      });
      
      // Print summary
      console.error('\n\x1b[33m%s\x1b[0m', `📊 Summary: Found issues in ${totals.files} files`);
      console.error('\x1b[33m%s\x1b[0m', `  • ${totals.duplicates} duplicate imports`);
      console.error('\x1b[32m%s\x1b[0m', `  • ${totals.mergeSuggestions} opportunities to merge imports`);
      console.error('\x1b[35m%s\x1b[0m', `  • ${totals.wildcardWithNamed} wildcard+named import conflicts`);
      if (totals.sideEffectImports > 0) {
        console.error('\x1b[34m%s\x1b[0m', `  • ${totals.sideEffectImports} side effect imports (informational)`);
      }
    }
    
    // You can choose to make this test fail based on specific issues:
    const criticalIssueCount = issuesFound.reduce((count, issue) => {
      // Count duplicates and wildcard conflicts as critical issues
      return count + issue.duplicates.length + issue.wildcardWithNamed.length;
    }, 0);
    
    // Comment this out if you want the test to be informational only
    expect(criticalIssueCount).toEqual(0);
  });
});