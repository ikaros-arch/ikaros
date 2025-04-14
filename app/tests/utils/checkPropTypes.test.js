/**
 * @vitest-environment node
 */
/**
* ## How this PropTypes Validator Works
* This test scans your React components to ensure they properly validate their props using either 
* PropTypes or TypeScript types, helping you catch potential bugs and improve code quality.
* 
* ### Key Features
* 1. **Multiple Component Types**: Detects function components, arrow function components, and class components
* 2. **Various Prop Validation Methods**: Recognizes:
*    - PropTypes validation (`Component.propTypes = {}` or `static propTypes = {}`)
*    - TypeScript typed parameters (`function Component(props: Props)`)
*    - TypeScript interfaces and type annotations
* 3. **Prop Usage Detection**: Identifies props through different patterns:
*    - Direct usage: `props.name`
*    - Destructuring: `const { name } = props`
*    - Class components: `this.props.name`
* 4. **Smart Validation**: Ignores components that don't use props (no need for validation)
* 
* ### Benefits
* 1. **Type Safety**: Ensures components have runtime or compile-time type checking
* 2. **Better Documentation**: PropTypes and TypeScript serve as documentation for component APIs
* 3. **Improved Debugging**: Makes it easier to identify why a component might be receiving incorrect props
* 4. **Catch Bugs Early**: Identifies potential issues before they cause runtime errors
* 
* ### Customizing the Test
* You can adjust the test based on your team's standards:
* 
* 1. **Stricter Enforcement**: Change `expect(...).toBeLessThan(5)` to `expect(...).toBe(0)` to require all components to have prop validation
* 2. **Exclude Certain Components**: Modify the logic to ignore simple or specific components
* 3. **TypeScript Focus**: If you're using TypeScript exclusively, you might want to adjust the validation logic to focus on TypeScript types
* 
* The test is set up with an initial threshold of less than 5 components without prop validation, 
* which gives you room to gradually improve while not immediately failing your build.
*/
import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

const srcDir = path.resolve(__dirname, '../../src');

describe('Component Prop Validation', () => {
  it.skip('all components should validate their props', () => {
    const componentsWithoutPropValidation = findComponentsWithoutPropValidation();
    
    if (componentsWithoutPropValidation.length > 0) {
      console.error('\x1b[33m%s\x1b[0m', '⚠️ Components Without Prop Validation:');
      componentsWithoutPropValidation.forEach(comp => {
        console.error('\x1b[33m%s\x1b[0m', `  ${comp.name} in ${comp.file}`);
        console.error('\x1b[33m%s\x1b[0m', `    Props used: ${comp.usedProps.join(', ')}`);
      });
    }
    
    // You might want to enforce this as a warning rather than error initially
    expect(componentsWithoutPropValidation.length).toBeLessThan(5);
  });
});

/**
 * Find components that use props but don't validate them
 * @returns {Array} Array of components without prop validation
 */
function findComponentsWithoutPropValidation() {
  const files = getAllComponentFiles();
  const componentsWithoutValidation = [];
  
  for (const file of files) {
    const componentsInFile = extractComponentsFromFile(file);
    
    for (const component of componentsInFile) {
      if (component.usedProps.length > 0 && !component.hasPropValidation) {
        componentsWithoutValidation.push({
          name: component.name,
          file: path.relative(srcDir, file),
          usedProps: component.usedProps
        });
      }
    }
  }
  
  return componentsWithoutValidation;
}

/**
 * Find all component files in the src directory
 * @returns {Array} Array of component file paths
 */
function getAllComponentFiles() {
  const componentFiles = [];
  
  function exploreDir(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const itemPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        exploreDir(itemPath);
      } else if (/\.(jsx?|tsx)$/.test(item.name) && !item.name.includes('.test.')) {
        componentFiles.push(itemPath);
      }
    }
  }
  
  exploreDir(srcDir);
  return componentFiles;
}

/**
 * Extract components and their prop validation status from a file
 * @param {string} filePath Path to the file
 * @returns {Array} Array of component objects
 */
function extractComponentsFromFile(filePath) {
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
      plugins: ['jsx', 'typescript', 'classProperties']
    });
  } catch (err) {
    console.error(`Error parsing file ${filePath}: ${err.message}`);
    return [];
  }
  
  const components = [];
  const isTypeScriptFile = filePath.endsWith('.tsx') || filePath.endsWith('.ts');
  
  // Track PropTypes assignments to components
  const propTypesAssignments = new Map();
  
  // Track if we've imported PropTypes
  let hasPropTypesImport = false;
  
  // First pass: find PropTypes imports and component definitions
  traverse(ast, {
    ImportDeclaration(path) {
      // Check if PropTypes is imported
      if (path.node.source.value === 'prop-types') {
        hasPropTypesImport = true;
      }
    },
    
    AssignmentExpression(path) {
      // Look for Component.propTypes = {...} assignments
      if (path.node.left.type === 'MemberExpression' &&
          path.node.left.property.name === 'propTypes') {
        const componentName = path.node.left.object.name;
        if (componentName) {
          propTypesAssignments.set(componentName, true);
        }
      }
    }
  });
  
  // Second pass: find components and their props
  traverse(ast, {
    // Function component: function MyComponent(props) {}
    FunctionDeclaration(path) {
      if (isReactComponent(path.node.id.name)) {
        const componentInfo = analyzeComponent(path, propTypesAssignments, isTypeScriptFile);
        if (componentInfo) {
          components.push(componentInfo);
        }
      }
    },
    
    // Arrow function component: const MyComponent = (props) => {}
    VariableDeclarator(path) {
      if (path.node.id && 
          path.node.id.type === 'Identifier' && 
          isReactComponent(path.node.id.name) &&
          path.node.init && 
          (path.node.init.type === 'ArrowFunctionExpression' || path.node.init.type === 'FunctionExpression')) {
        
        const componentInfo = analyzeComponent(path, propTypesAssignments, isTypeScriptFile);
        if (componentInfo) {
          components.push(componentInfo);
        }
      }
    },
    
    // Class component: class MyComponent extends React.Component {}
    ClassDeclaration(path) {
      if (isReactComponent(path.node.id.name)) {
        const componentInfo = analyzeClassComponent(path, propTypesAssignments);
        if (componentInfo) {
          components.push(componentInfo);
        }
      }
    }
  });
  
  return components;
}

/**
 * Analyze a function component for props usage and validation
 * @param {Object} path AST path object
 * @param {Map} propTypesAssignments Map of component names with propTypes assignments
 * @param {boolean} isTypeScript Whether the file is TypeScript
 * @returns {Object} Component information
 */
function analyzeComponent(path, propTypesAssignments, isTypeScript) {
  const usedProps = new Set();
  let hasPropValidation = false;
  let componentName;
  
  if (path.node.type === 'FunctionDeclaration') {
    componentName = path.node.id.name;
    
    // Check if the function has typed parameters (TypeScript)
    if (isTypeScript && 
        path.node.params.length > 0 &&
        path.node.params[0].typeAnnotation) {
      hasPropValidation = true;
    }
    
    // Find props usage in function body
    traverse(path.node, {
      Identifier(idPath) {
        // Check for props.something
        if (idPath.parent.type === 'MemberExpression' &&
            idPath.parent.object === idPath.node &&
            idPath.node.name === 'props') {
          if (idPath.parent.property && idPath.parent.property.name) {
            usedProps.add(idPath.parent.property.name);
          }
        }
      },
      
      // Look for destructuring: const { a, b } = props
      VariableDeclarator(varPath) {
        if (varPath.node.init && 
            varPath.node.init.type === 'Identifier' && 
            varPath.node.init.name === 'props') {
          if (varPath.node.id.type === 'ObjectPattern') {
            varPath.node.id.properties.forEach(prop => {
              if (prop.key && prop.key.name) {
                usedProps.add(prop.key.name);
              }
            });
          }
        }
      }
    }, path.scope);
  } else if (path.node.type === 'VariableDeclarator') {
    componentName = path.node.id.name;
    const functionNode = path.node.init;
    
    // Check for parameter destructuring: ({ a, b }) => {}
    if (functionNode.params.length > 0) {
      if (functionNode.params[0].type === 'ObjectPattern') {
        functionNode.params[0].properties.forEach(prop => {
          if (prop.key && prop.key.name) {
            usedProps.add(prop.key.name);
          }
        });
      }
      
      // Check if the parameter has a type annotation (TypeScript)
      if (isTypeScript && functionNode.params[0].typeAnnotation) {
        hasPropValidation = true;
      }
    }
    
    // Find props usage in function body
    traverse(functionNode, {
      Identifier(idPath) {
        if (idPath.parent.type === 'MemberExpression' &&
            idPath.parent.object === idPath.node &&
            idPath.node.name === 'props') {
          if (idPath.parent.property && idPath.parent.property.name) {
            usedProps.add(idPath.parent.property.name);
          }
        }
      }
    }, path.scope);
  }
  
  // Check for propTypes assignment for this component
  if (propTypesAssignments.has(componentName)) {
    hasPropValidation = true;
  }
  
  return {
    name: componentName,
    usedProps: Array.from(usedProps),
    hasPropValidation
  };
}

/**
 * Analyze a class component for props usage and validation
 * @param {Object} path AST path object
 * @param {Map} propTypesAssignments Map of component names with propTypes assignments
 * @returns {Object} Component information
 */
function analyzeClassComponent(path, propTypesAssignments) {
  const componentName = path.node.id.name;
  const usedProps = new Set();
  let hasPropValidation = false;
  
  // Check for static propTypes inside class
  const propTypesProperty = path.node.body.body.find(node => 
    node.type === 'ClassProperty' &&
    node.static === true &&
    node.key.name === 'propTypes'
  );
  
  if (propTypesProperty) {
    hasPropValidation = true;
  }
  
  // Check for propTypes assignment outside class
  if (propTypesAssignments.has(componentName)) {
    hasPropValidation = true;
  }
  
  // Find props usage in class methods
  traverse(path.node, {
    Identifier(idPath) {
      // Check for this.props.something
      if (idPath.parent && 
          idPath.parent.type === 'MemberExpression' &&
          idPath.parent.object && 
          idPath.parent.object.type === 'MemberExpression' &&
          idPath.parent.object.object &&
          idPath.parent.object.object.type === 'ThisExpression' &&
          idPath.parent.object.property &&
          idPath.parent.object.property.name === 'props') {
        
        if (idPath.node.name && idPath.parent.property === idPath.node) {
          usedProps.add(idPath.node.name);
        }
      }
    },
    
    // Look for destructuring: const { a, b } = this.props
    VariableDeclarator(varPath) {
      if (varPath.node.init && 
          varPath.node.init.type === 'MemberExpression' && 
          varPath.node.init.object && 
          varPath.node.init.object.type === 'ThisExpression' &&
          varPath.node.init.property &&
          varPath.node.init.property.name === 'props') {
        
        if (varPath.node.id.type === 'ObjectPattern') {
          varPath.node.id.properties.forEach(prop => {
            if (prop.key && prop.key.name) {
              usedProps.add(prop.key.name);
            }
          });
        }
      }
    }
  }, path.scope);
  
  return {
    name: componentName,
    usedProps: Array.from(usedProps),
    hasPropValidation
  };
}

/**
 * Check if a name is likely a React component
 * @param {string} name Component name to check
 * @returns {boolean} Whether this is likely a component name
 */
function isReactComponent(name) {
  // React components typically start with an uppercase letter
  return /^[A-Z]/.test(name);
}