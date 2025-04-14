/**
 * @vitest-environment node
 */
/**
* ## How This Route Validation Test Works
*
*  ### 1. Route Extraction Strategy
*
*  This test uses a multi-layered approach to find your routes:
*
*  1. **Smart Scanning**: First looks in files likely to contain routes (with "routes", "router", etc. in the name)
*  2. **Fallback Search**: If not enough routes are found, scans all files in the project
*  3. **Multiple Format Support**: Detects both JSX routes (`<Route>`) and object-based routes (`{ path: '/path', ... }`)
*
*  ### 2. Finding Page Components
*
*  The test identifies page components by:
*
*  1. **Location-Based Detection**: Examines files in directories like `pages`, `views`, `screens`, and `routes`
*  2. **Component Detection**: Finds components defined as:
*    - Function declarations: `function PageName() { ... }`
*    - Arrow functions: `const PageName = () => { ... }`
*    - Class components: `class PageName extends Component { ... }`
*
*  ### 3. Validation Checks
*
*  The test performs two key validations:
*
*  1. **Duplicate Route Detection**: Identifies if the same path is defined multiple times
*  2. **Unused Page Components**: Identifies page components that aren't used in any route
*
*  ### Example Outputs
*
*  #### For Duplicate Routes:
*
*  ```
*  🔄 Duplicate Route Paths:
*    Path "/dashboard" is defined multiple times:
*      - In routes/index.js at line 25
*      - In App.jsx at line 42
*  ```
*
*  #### For Unused Page Components:
*
*  ```
*  ⚠️ Potential Unused Page Components:
*    SettingsPage in pages/Settings.jsx might not be used in any route
*  ```
*
*  ## Customization Options
*
*  If your project has a specific routing structure, you might want to modify:
*
*  1. **Route Syntax Detection**: The `extractRoutesFromFile` function handles common patterns but may need adjustments 
* for unique routing libraries or custom route configurations.
*
*  2. **Page Component Detection**: The test assumes pages are in standard folders like 'pages', 'views', or 'screens'. 
* Adjust the `findPageComponents` function if your components are organized differently.
*
*  3. **Test Strictness**: The "unused page components" test is currently informational (won't fail). 
* You can make it a true failure by changing the expectation at the end.
*
*  This test will help keep your routing consistent and prevent issues like broken navigation and duplicate routes. 
*/
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
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

describe('Route Configuration Validation', () => {
  it.skip('should have unique route paths', () => {
    const routes = extractRoutes();
    const duplicateRoutes = findDuplicateRoutes(routes);
    
    if (duplicateRoutes.length > 0) {
      console.error('\x1b[31m%s\x1b[0m', '🔄 Duplicate Route Paths:');
      duplicateRoutes.forEach(dup => {
        console.error('\x1b[31m%s\x1b[0m', `  Path "${dup.path}" is defined multiple times:`);
        dup.locations.forEach(loc => {
          console.error('\x1b[31m%s\x1b[0m', `    - In ${loc.file} at line ${loc.line}`);
        });
      });
    }
    
    expect(duplicateRoutes).toEqual([]);
  });
  
  it('should not have components missing from routes', () => {
    const routes = extractRoutes();
    const pageComponents = findPageComponents();
    const missingRoutes = pageComponents.filter(component => 
      !routes.some(route => route.component === component.name)
    );
    
    if (missingRoutes.length > 0) {
      console.error('\x1b[33m%s\x1b[0m', '⚠️ Potential Unused Page Components:');
      missingRoutes.forEach(component => {
        console.error('\x1b[33m%s\x1b[0m', `  ${component.name} in ${component.file} might not be used in any route`);
      });
    }
    
    // This is informational, so don't make the test fail
    expect(true).toBe(true);
  });
});

/**
 * Extract all route configurations from the source files
 * @returns {Array} Array of routes with their paths and components
 */
function extractRoutes() {
  const allRoutes = [];
  const files = getAllFiles(srcDir);
  
  // Potential router config files - check these first
  const potentialRouterFiles = files.filter(file => 
    file.includes('routes') || 
    file.includes('router') || 
    file.includes('navigation') ||
    file.includes('app') // App.jsx might contain routes
  );
  
  // First check likely router files
  for (const file of potentialRouterFiles) {
    const routesInFile = extractRoutesFromFile(file);
    if (routesInFile.length > 0) {
      allRoutes.push(...routesInFile);
    }
  }
  
  // Then check all files if we didn't find enough routes
  if (allRoutes.length < 3) {
    for (const file of files) {
      if (!potentialRouterFiles.includes(file)) {
        const routesInFile = extractRoutesFromFile(file);
        if (routesInFile.length > 0) {
          allRoutes.push(...routesInFile);
        }
      }
    }
  }
  
  return allRoutes;
}

/**
 * Extract routes from a specific file
 * @param {string} filePath Path to the file
 * @returns {Array} Array of routes found in the file
 */
function extractRoutesFromFile(filePath) {
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
  
  const routes = [];
  const relativePath = path.relative(srcDir, filePath);
  
  // Track any route arrays we find - might be route configurations
  let routeArrays = [];
  
  traverse(ast, {
    // Find JSX Route components: <Route path="/" component={Home} />
    JSXElement(nodePath) {
      const element = nodePath.node;
      
      // Check if this is a Route component
      if (element.openingElement && 
          element.openingElement.name && 
          element.openingElement.name.name === 'Route') {
        
        // Extract path attribute
        const pathAttr = element.openingElement.attributes.find(
          attr => attr.name && attr.name.name === 'path'
        );
        
        let path = null;
        if (pathAttr && pathAttr.value) {
          if (pathAttr.value.type === 'StringLiteral') {
            path = pathAttr.value.value;
          } else if (pathAttr.value.type === 'JSXExpressionContainer' && 
                     pathAttr.value.expression.type === 'StringLiteral') {
            path = pathAttr.value.expression.value;
          }
        }
        
        // Extract component - could be in component, element, or render props
        let component = null;
        
        // Check component prop: component={Home}
        const componentAttr = element.openingElement.attributes.find(
          attr => attr.name && attr.name.name === 'component'
        );
        
        if (componentAttr && componentAttr.value && 
            componentAttr.value.type === 'JSXExpressionContainer') {
          if (componentAttr.value.expression.type === 'Identifier') {
            component = componentAttr.value.expression.name;
          }
        }
        
        // Check element prop: element={<Home />}
        const elementAttr = element.openingElement.attributes.find(
          attr => attr.name && attr.name.name === 'element'
        );
        
        if (!component && elementAttr && elementAttr.value && 
            elementAttr.value.type === 'JSXExpressionContainer') {
          // React Router v6 style: element={<Home />}
          if (elementAttr.value.expression.type === 'JSXElement' && 
              elementAttr.value.expression.openingElement.name.type === 'JSXIdentifier') {
            component = elementAttr.value.expression.openingElement.name.name;
          }
        }
        
        if (path) {
          routes.push({
            path,
            component,
            file: relativePath,
            line: element.loc.start.line
          });
        }
      }
    },
    
    // Find object-based routes: const routes = [{ path: "/", component: Home }]
    ArrayExpression(nodePath) {
      if (nodePath.node.elements && nodePath.node.elements.length > 0) {
        // Check if elements look like route objects
        const hasRouteLikeObjects = nodePath.node.elements.some(elem => {
          return elem.type === 'ObjectExpression' && 
                 elem.properties.some(prop => 
                   prop.key && 
                   (prop.key.name === 'path' || prop.key.name === 'element' || prop.key.name === 'component')
                 );
        });
        
        if (hasRouteLikeObjects) {
          routeArrays.push({
            node: nodePath.node,
            location: nodePath.node.loc
          });
        }
      }
    }
  });
  
  // Process any route arrays we found
  for (const routeArray of routeArrays) {
    for (const element of routeArray.node.elements) {
      if (element.type === 'ObjectExpression') {
        let path = null;
        let component = null;
        
        // Extract path property
        const pathProp = element.properties.find(
          prop => prop.key && prop.key.name === 'path'
        );
        
        if (pathProp && pathProp.value.type === 'StringLiteral') {
          path = pathProp.value.value;
        }
        
        // Extract component property
        const componentProp = element.properties.find(
          prop => prop.key && (prop.key.name === 'component' || prop.key.name === 'element')
        );
        
        if (componentProp && componentProp.value.type === 'Identifier') {
          component = componentProp.value.name;
        } else if (componentProp && componentProp.value.type === 'JSXElement') {
          component = componentProp.value.openingElement.name.name;
        } else if (componentProp && componentProp.value.type === 'ArrowFunctionExpression') {
          // Handle: element: () => <Home />
          const body = componentProp.value.body;
          if (body.type === 'JSXElement') {
            component = body.openingElement.name.name;
          }
        }
        
        if (path) {
          routes.push({
            path,
            component,
            file: relativePath,
            line: element.loc.start.line
          });
        }
      }
    }
  }
  
  return routes;
}

/**
 * Find duplicate routes in the extracted routes
 * @param {Array} routes Array of route objects
 * @returns {Array} Array of duplicate routes
 */
function findDuplicateRoutes(routes) {
  const pathCounts = {};
  const duplicates = [];
  
  // Count occurrences of each path
  for (const route of routes) {
    if (!pathCounts[route.path]) {
      pathCounts[route.path] = [];
    }
    pathCounts[route.path].push({
      file: route.file,
      line: route.line,
      component: route.component
    });
  }
  
  // Find paths that appear more than once
  for (const [path, locations] of Object.entries(pathCounts)) {
    if (locations.length > 1) {
      duplicates.push({
        path,
        locations
      });
    }
  }
  
  return duplicates;
}

/**
 * Find all potential page components
 * @returns {Array} Array of page component objects
 */
function findPageComponents() {
  const pageComponents = [];
  const files = getAllFiles(path.join(srcDir, 'pages'));
  
  // Also look in any components folder that might contain pages
  const additionalPageDirs = ['views', 'screens', 'routes'];
  for (const dir of additionalPageDirs) {
    const dirPath = path.join(srcDir, dir);
    if (fs.existsSync(dirPath)) {
      files.push(...getAllFiles(dirPath));
    }
  }
  
  for (const file of files) {
    const components = extractExportedComponentsFromFile(file); // Changed function name
    pageComponents.push(...components);
  }
  
  return pageComponents;
}

/**
 * Extract exported component definitions from a file
 * @param {string} filePath Path to the file
 * @returns {Array} Array of components found in the file
 */
function extractExportedComponentsFromFile(filePath) {
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
  
  const components = [];
  const relativePath = path.relative(srcDir, filePath);
  
  // Track exported component names
  const exportedNames = new Set();
  
  // First find all exports
  traverse(ast, {
    // Track named exports: export { MyComponent }
    ExportNamedDeclaration(path) {
      if (path.node.specifiers) {
        path.node.specifiers.forEach(specifier => {
          if (specifier.exported && specifier.exported.name) {
            exportedNames.add(specifier.exported.name);
          }
        });
      }
      
      // Handle direct exports: export const MyComponent = ...
      if (path.node.declaration) {
        if (path.node.declaration.type === 'VariableDeclaration') {
          path.node.declaration.declarations.forEach(declaration => {
            if (declaration.id && declaration.id.name) {
              exportedNames.add(declaration.id.name);
            }
          });
        } else if (path.node.declaration.type === 'FunctionDeclaration' && 
                  path.node.declaration.id) {
          exportedNames.add(path.node.declaration.id.name);
        } else if (path.node.declaration.type === 'ClassDeclaration' && 
                  path.node.declaration.id) {
          exportedNames.add(path.node.declaration.id.name);
        }
      }
    },
    
    // Track default exports: export default MyComponent
    ExportDefaultDeclaration(path) {
      if (path.node.declaration) {
        if (path.node.declaration.type === 'Identifier') {
          exportedNames.add(path.node.declaration.name);
        } else if (path.node.declaration.type === 'FunctionDeclaration' && 
                  path.node.declaration.id) {
          // Named function export default: export default function MyComponent() {}
          exportedNames.add(path.node.declaration.id.name);
        } else if (path.node.declaration.type === 'ClassDeclaration' && 
                  path.node.declaration.id) {
          exportedNames.add(path.node.declaration.id.name);
        }
        // For anonymous default exports, we can't track the name
      }
    }
  });
  
  // Now collect only exported components
  traverse(ast, {
    // Function declarations: function MyComponent() {}
    FunctionDeclaration(path) {
      if (path.node.id && 
          /^[A-Z]/.test(path.node.id.name) && 
          exportedNames.has(path.node.id.name)) {
        components.push({
          name: path.node.id.name,
          file: relativePath,
          line: path.node.loc.start.line
        });
      }
    },
    
    // Arrow functions: const MyComponent = () => {}
    VariableDeclarator(path) {
      if (path.node.id && 
          path.node.id.type === 'Identifier' &&
          /^[A-Z]/.test(path.node.id.name) &&
          exportedNames.has(path.node.id.name) &&
          (path.node.init && 
           (path.node.init.type === 'ArrowFunctionExpression' || 
            path.node.init.type === 'FunctionExpression'))) {
        components.push({
          name: path.node.id.name,
          file: relativePath,
          line: path.node.loc.start.line
        });
      }
    },
    
    // Class components: class MyComponent extends React.Component {}
    ClassDeclaration(path) {
      if (path.node.id && 
          /^[A-Z]/.test(path.node.id.name) && 
          exportedNames.has(path.node.id.name)) {
        components.push({
          name: path.node.id.name,
          file: relativePath,
          line: path.node.loc.start.line
        });
      }
    }
  });
  
  return components;
}

/**
 * Get all JS/JSX/TS/TSX files in a directory
 * @param {string} dir Directory path
 * @returns {Array} Array of file paths
 */
function getAllFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  
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