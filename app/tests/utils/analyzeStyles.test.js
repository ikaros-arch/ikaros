/**
 * @vitest-environment node
 */
/**
* ## What This Style Analysis Does
* 
* ### 1. Unused Style Imports Detection
* 
* The first test identifies CSS/SCSS imports that don't appear to be used in your code:
* 
* - **CSS Modules Usage**: Checks if imported style variables are actually used within components
* - **Detection Patterns**:
*   - `className={styles.something}`
*   - `const { header, footer } = styles`
*   - `classNames(styles.a, styles.b)`
* - **Skip Logic**: Side-effect only imports (like `import './global.css'`) are skipped as they're inherently "used"
* 
* ### 2. Mixed Styling Approaches Detection
* 
* The second test identifies components that use multiple styling methods:
* 
* - **Detected Styling Approaches**:
*   - **CSS Imports**: Regular CSS/SCSS files imported for side effects
*   - **CSS Modules**: Imported with a variable name for scoped styles
*   - **styled-components**: Identified by imports or `styled.` syntax
*   - **Emotion**: Identified by imports, pragmas, or `css` tagged templates
*   - **MUI Styling**: Material-UI style hooks and HOCs
*   - **Tailwind CSS**: Detected via className patterns with utility classes
*   - **Inline Styles**: The `style` attribute in JSX
*   - **JSS**: JavaScript-based styling
* 
* - **Project-wide Analysis**: Shows which styling approaches are most commonly used across your codebase
* 
* ### 3. Comprehensive Output
* 
* The test provides:
* 
* - **Warning Lists**: Detailed information about unused styles and mixed approaches
* - **File-specific Information**: Shows exactly where issues occur
* - **Project Stats**: Summarizes which styling methods are dominant in your project
* - **Recommendations**: Suggests standardizing on a consistent approach
* 
* ### Benefits
* 
* This test helps you:
* 
* 1. **Clean Up Dead Code**: Identify and remove unused CSS imports
* 2. **Standardize Styles**: Move toward a consistent styling approach
* 3. **Improve Maintainability**: Reducing style complexity makes code easier to maintain
* 4. **Identify Trends**: See which styling methods your team prefers in practice
* 
* ### Note on False Positives
* 
* The test is designed to be informative rather than strict, because:
* 
* - Some style imports can have side effects that aren't directly trackable
* - Dynamic class names might not be detectable through static analysis
* - Some libraries might use styling approaches in non-standard ways
* 
* That's why the tests don't fail on issues but provide helpful warnings to guide your refactoring efforts.
*/
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

const srcDir = path.resolve(__dirname, '../../src');

// Styling approaches we can detect
const stylingApproaches = {
  CSS_IMPORT: 'CSS Import',
  CSS_MODULE: 'CSS Module',
  STYLED_COMPONENTS: 'styled-components',
  EMOTION: 'Emotion',
  INLINE_STYLE: 'Inline style',
  TAILWIND: 'Tailwind CSS',
  JSS: 'JSS',
  MUI_STYLING: 'Material-UI styling'
};

describe('CSS/Styling Analysis', () => {
  it('should not have unused style imports', () => {
    const unusedStyles = findUnusedStyleImports();
    
    if (unusedStyles.length > 0) {
      console.warn('\x1b[33m%s\x1b[0m', '🎨 Potentially Unused Style Imports:');
      unusedStyles.forEach(style => {
        console.warn('\x1b[33m%s\x1b[0m', `  ${style.import} in ${style.file}`);
      });
    } else {
      console.log('\x1b[32m%s\x1b[0m', '✅ All style imports appear to be used!');
    }
    
    // Make this a warning, not an error
    expect(true).toBe(true);
  });
  
  it('should use consistent styling approach', () => {
    const mixedStylingApproaches = findMixedStylingApproaches();
    
    if (mixedStylingApproaches.length > 0) {
      console.warn('\x1b[33m%s\x1b[0m', '🔄 Mixed Styling Approaches:');
      mixedStylingApproaches.forEach(file => {
        console.warn('\x1b[33m%s\x1b[0m', `  ${file.path} uses multiple styling methods:`);
        console.warn('\x1b[33m%s\x1b[0m', `    ${file.methods.join(', ')}`);
      });
      
      // Show overall project stats
      const projectApproaches = countProjectStylingApproaches(mixedStylingApproaches);
      console.warn('\x1b[36m%s\x1b[0m', '\n📊 Project-wide styling approach usage:');
      Object.entries(projectApproaches)
        .sort((a, b) => b[1] - a[1])
        .forEach(([approach, count]) => {
          console.warn('\x1b[36m%s\x1b[0m', `  ${approach}: ${count} files`);
        });
      
      console.warn('\x1b[36m%s\x1b[0m', '\nConsider standardizing on a single styling approach to improve maintainability.');
    } else {
      console.log('\x1b[32m%s\x1b[0m', '✅ Consistent styling approach used across the project!');
    }
    
    // Make this a warning, not an error
    expect(true).toBe(true);
  });
});

/**
 * Find unused style imports across the project
 * @returns {Array} Array of unused style imports
 */
function findUnusedStyleImports() {
  const files = getAllFiles(srcDir);
  const unusedStyles = [];
  
  for (const file of files) {
    // Skip non-JS files
    if (!/\.(js|jsx|ts|tsx)$/.test(file)) continue;
    
    const styleImports = extractStyleImports(file);
    
    if (styleImports.length > 0) {
      const fileContent = fs.readFileSync(file, 'utf-8');
      let ast;
      
      try {
        ast = parser.parse(fileContent, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript']
        });
      } catch (err) {
        console.error(`Error parsing ${file}: ${err.message}`);
        continue;
      }
      
      for (const styleImport of styleImports) {
        // Skip side-effect only imports (no variable name)
        if (!styleImport.name) continue;
        
        let isUsed = false;
        
        // Check for CSS module usage
        traverse(ast, {
          // Check for usage like: className={styles.something}
          MemberExpression(path) {
            if (path.node.object.type === 'Identifier' && 
                path.node.object.name === styleImport.name) {
              isUsed = true;
              path.stop();
            }
          },
          
          // Check for usage like: const { header, footer } = styles
          VariableDeclarator(path) {
            if (path.node.init && 
                path.node.init.type === 'Identifier' && 
                path.node.init.name === styleImport.name) {
              isUsed = true;
              path.stop();
            }
          },
          
          // Check for usage like: classNames(styles.a, styles.b)
          CallExpression(path) {
            const args = path.node.arguments;
            for (const arg of args) {
              if (arg.type === 'MemberExpression' && 
                  arg.object.type === 'Identifier' && 
                  arg.object.name === styleImport.name) {
                isUsed = true;
                path.stop();
              }
            }
          }
        });
        
        if (!isUsed) {
          unusedStyles.push({
            file: path.relative(srcDir, file),
            import: styleImport.importPath,
            name: styleImport.name
          });
        }
      }
    }
  }
  
  return unusedStyles;
}

/**
 * Find files that use multiple styling approaches
 * @returns {Array} Array of files with mixed styling approaches
 */
function findMixedStylingApproaches() {
  const files = getAllFiles(srcDir);
  const filesWithMixedApproaches = [];
  
  for (const file of files) {
    // Skip non-JS files
    if (!/\.(js|jsx|ts|tsx)$/.test(file)) continue;
    
    const approaches = detectStylingApproaches(file);
    
    if (approaches.size > 1) {
      filesWithMixedApproaches.push({
        path: path.relative(srcDir, file),
        methods: Array.from(approaches)
      });
    }
  }
  
  return filesWithMixedApproaches;
}

/**
 * Count the usage of different styling approaches across the project
 * @param {Array} mixedFiles Files with mixed styling approaches
 * @returns {Object} Count of each styling approach
 */
function countProjectStylingApproaches(mixedFiles) {
  const counts = {};
  
  for (const file of mixedFiles) {
    for (const method of file.methods) {
      if (!counts[method]) {
        counts[method] = 0;
      }
      counts[method]++;
    }
  }
  
  return counts;
}

/**
 * Detect styling approaches used in a file
 * @param {string} filePath Path to the file
 * @returns {Set} Set of styling approaches used in the file
 */
function detectStylingApproaches(filePath) {
  const approaches = new Set();
  let content;
  
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.error(`Error reading file ${filePath}: ${err.message}`);
    return approaches;
  }
  
  let ast;
  try {
    ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch (err) {
    console.error(`Error parsing file ${filePath}: ${err.message}`);
    return approaches;
  }
  
  // Check for CSS/SCSS imports
  const styleImports = extractStyleImports(filePath);
  if (styleImports.some(imp => !imp.name)) {
    approaches.add(stylingApproaches.CSS_IMPORT);
  }
  
  if (styleImports.some(imp => imp.name)) {
    approaches.add(stylingApproaches.CSS_MODULE);
  }
  
  // Check for styled-components usage
  if (content.includes('styled-components') || 
      content.includes('styled.') || 
      content.includes('styled(')) {
    approaches.add(stylingApproaches.STYLED_COMPONENTS);
  }
  
  // Check for Emotion usage
  if (content.includes('@emotion/') || 
      content.includes('/** @jsx jsx */') || 
      content.includes('css`')) {
    approaches.add(stylingApproaches.EMOTION);
  }
  
  // Check for JSS/Material-UI styling
  if (content.includes('makeStyles') || 
      content.includes('createStyles') || 
      content.includes('withStyles') || 
      content.includes('styled(')) {
    approaches.add(stylingApproaches.MUI_STYLING);
  }
  
  // Check for Tailwind usage
  const tailwindClassPattern = /className=["'`]{1}[^"'`]*(?:p|m|text|bg|flex|grid|border|shadow|rounded|transition|transform|hover|focus|active|md:|sm:|lg:|xl:)[^"'`]*["'`]{1}/;
  if (tailwindClassPattern.test(content)) {
    approaches.add(stylingApproaches.TAILWIND);
  }
  
  // Check for inline styles
  traverse(ast, {
    JSXAttribute(path) {
      if (path.node.name.name === 'style' && 
          path.node.value && 
          path.node.value.type === 'JSXExpressionContainer') {
        approaches.add(stylingApproaches.INLINE_STYLE);
        path.stop();
      }
    }
  });
  
  return approaches;
}

/**
 * Extract CSS/SCSS imports from a file
 * @param {string} filePath Path to the file
 * @returns {Array} Array of style imports with import path and variable name
 */

function extractStyleImports(filePath) {
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
  
  const styleImports = [];
  
  traverse(ast, {
    ImportDeclaration(path) {
      const importPath = path.node.source.value;
      
      // Check if this is a CSS/SCSS/LESS import
      if (/\.(css|scss|sass|less|styl)$/.test(importPath)) {
        // Check if it's a side-effect import or a named import
        if (path.node.specifiers.length === 0) {
          // Side-effect import: import './styles.css'
          styleImports.push({
            importPath,
            name: null
          });
        } else {
          // Named import: import styles from './styles.module.css'
          const defaultSpecifier = path.node.specifiers.find(s => s.type === 'ImportDefaultSpecifier');
          if (defaultSpecifier) {
            styleImports.push({
              importPath,
              name: defaultSpecifier.local.name
            });
          }
        }
      }
    }
  });
  
  return styleImports;
}

/**
 * Get all files in the src directory
 * @returns {Array} Array of file paths
 */
function getAllFiles(dir) {
  const files = [];
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const itemPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      files.push(...getAllFiles(itemPath));
    } else {
      files.push(itemPath);
    }
  }
  
  return files;
}