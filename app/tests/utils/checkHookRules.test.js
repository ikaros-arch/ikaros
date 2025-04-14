/**
 * @vitest-environment node
 */
/**
* ## How This Hook Rules Validator Works
* 
* ### 1. Core Hook Rules Detection
* 
* This implementation checks for violation of React's two main hook rules:
* 
* #### Rule 1: Only Call Hooks at the Top Level
* - Detects hooks inside:
*   - Conditional statements (`if`, `else`, ternary operators `? :`)
*   - Loops (`for`, `while`, `do-while`)
*   - Nested functions
*   - Logical expressions (`&&`, `||`)
* 
* #### Rule 2: Only Call Hooks from React Functions
* - Ensures hooks are only called within:
*   - React components (functions starting with uppercase letters)
*   - Custom hooks (functions starting with "use")
* 
* ### 2. Advanced Context Tracking
* 
* The implementation maintains multiple stacks:
* 
* 1. **Function Stack**: Tracks entry/exit from all functions
* 2. **Valid Context Stack**: Tracks when we're inside components or custom hooks
* 3. **Hook List**: Combines standard React hooks with custom hooks detected in the file
* 
* ### 3. Smart Hook Detection
* 
* The test recognizes:
* 
* - Standard React hooks (`useState`, `useEffect`, etc.)
* - Popular library hooks (React Router, Redux, React Query)
* - Custom hooks defined in your codebase
* 
* ### 4. Intuitive Output
* 
* When violations are found, it reports:
* 
* - File path and line number
* - The hook that was misused
* - The specific context where the violation occurred
* - A reminder of the rule being violated
* 
* ## Example Violations It Will Catch
* 
* ```jsx
* function MyComponent() {
*   const [count, setCount] = useState(0);
*   
*   if (condition) {
*     // ❌ useState in conditional
*     const [name, setName] = useState(""); 
*   }
*   
*   const handleClick = () => {
*     // ❌ useEffect in nested function
*     useEffect(() => {
*       // Do something
*     }, []);
*   };
*   
*   return <div>{count}</div>;
* }
* 
* // ❌ useContext outside component/hook
* const theme = useContext(ThemeContext);
* 
* function regularFunction() {
*   // ❌ useState in regular function (not a component or hook)
*   const [value, setValue] = useState("");
* }
* ```
* 
* ## Feature Highlights
* 
* 1. **Comprehensive Analysis**: Checks all possible conditional and nested contexts
* 2. **Custom Hook Support**: Detects and validates your own custom hooks
* 3. **Correct Context Handling**: Understands component and custom hook boundaries
* 4. **Library Support**: Pre-configured with common hooks from popular libraries
* 5. **Detailed Reports**: Provides actionable information to fix issues
* 
* This implementation will help catch hook-related bugs early, 
* preventing hard-to-debug issues in your React application.
*/
import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

const srcDir = path.resolve(__dirname, '../../src');
const hooksDir = path.resolve(srcDir, 'hooks');

// Common React hooks to check for
const STANDARD_HOOKS = [
  'useState',
  'useEffect',
  'useContext',
  'useReducer',
  'useCallback',
  'useMemo',
  'useRef',
  'useImperativeHandle',
  'useLayoutEffect',
  'useDebugValue',
  'useDeferredValue',
  'useTransition',
  'useId',
  // React Router hooks
  'useParams',
  'useNavigate',
  'useLocation',
  'useRoutes',
  'useSearchParams',
  // Add other common library hooks you use
  'useQuery',
  'useMutation',
  'useForm',
  'useStore',
  'useSelector',
  'useDispatch',
  'useKeycloak',
  'useGridApiContext'
];

describe('React Hook Rules', () => {
  it.skip('hooks should only be called at the top level', () => {
    // First discover all custom hooks from hooks directory
    const customHooksFromDir = discoverCustomHooksFromDirectory();
    console.log(`Found ${customHooksFromDir.length} custom hooks in hooks directory`);
    
    // Use the combined list of hooks for validation
    const hookViolations = findHookRuleViolations(customHooksFromDir);
    
    if (hookViolations.length > 0) {
      console.error('\x1b[31m%s\x1b[0m', '🪝 Hook Rule Violations:');
      hookViolations.forEach(violation => {
        console.error('\x1b[31m%s\x1b[0m', `  In ${violation.file} at line ${violation.line}:`);
        console.error('\x1b[31m%s\x1b[0m', `    ${violation.hook} is called inside ${violation.context}`);
        console.error('\x1b[31m%s\x1b[0m', `    React Hooks must be called at the top level of your component or custom hook`);
      });
    }
    
    expect(hookViolations).toEqual([]);
  });
});

/**
 * Discover all custom hooks defined in the hooks directory
 * @returns {Array} Array of custom hook names
 */
function discoverCustomHooksFromDirectory() {
  const customHooks = [];
  
  if (!fs.existsSync(hooksDir)) {
    console.warn(`Hooks directory not found: ${hooksDir}`);
    return customHooks;
  }
  
  const hookFiles = getAllFiles(hooksDir);
  
  for (const file of hookFiles) {
    const hooksInFile = extractCustomHooksFromFile(file);
    customHooks.push(...hooksInFile);
  }
  
  return customHooks;
}

/**
 * Extract custom hooks from a file
 * @param {string} filePath Path to the file
 * @returns {Array} Array of custom hook names
 */
function extractCustomHooksFromFile(filePath) {
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
  
  const hooks = [];
  
  traverse(ast, {
    // Find custom hook definitions (functions starting with "use")
    FunctionDeclaration(path) {
      if (path.node.id && 
          path.node.id.name.startsWith('use') && 
          /^[a-z]/.test(path.node.id.name)) {
        hooks.push(path.node.id.name);
      }
    },
    
    // Find custom hooks defined as arrow functions or function expressions
    VariableDeclarator(path) {
      if (path.node.id && 
          path.node.id.type === 'Identifier' && 
          path.node.id.name.startsWith('use') && 
          /^[a-z]/.test(path.node.id.name)) {
        if (path.node.init && 
            (path.node.init.type === 'ArrowFunctionExpression' || 
             path.node.init.type === 'FunctionExpression')) {
          hooks.push(path.node.id.name);
        }
      }
    },
    
    // Check for exports
    ExportNamedDeclaration(path) {
      if (path.node.declaration) {
        if (path.node.declaration.type === 'FunctionDeclaration' && 
            path.node.declaration.id &&
            path.node.declaration.id.name.startsWith('use') && 
            /^[a-z]/.test(path.node.declaration.id.name)) {
          hooks.push(path.node.declaration.id.name);
        } else if (path.node.declaration.type === 'VariableDeclaration') {
          path.node.declaration.declarations.forEach(declaration => {
            if (declaration.id && 
                declaration.id.type === 'Identifier' && 
                declaration.id.name.startsWith('use') && 
                /^[a-z]/.test(declaration.id.name)) {
              hooks.push(declaration.id.name);
            }
          });
        }
      }
      
      // Handle export { useHook } style
      if (path.node.specifiers) {
        path.node.specifiers.forEach(specifier => {
          if (specifier.exported && 
              specifier.exported.name &&
              specifier.exported.name.startsWith('use') && 
              /^[a-z]/.test(specifier.exported.name)) {
            hooks.push(specifier.exported.name);
          }
        });
      }
    },
    
    // Handle default exports
    ExportDefaultDeclaration(path) {
      if (path.node.declaration) {
        if (path.node.declaration.type === 'FunctionDeclaration' && 
            path.node.declaration.id &&
            path.node.declaration.id.name.startsWith('use') && 
            /^[a-z]/.test(path.node.declaration.id.name)) {
          hooks.push(path.node.declaration.id.name);
        } else if (path.node.declaration.type === 'Identifier' && 
                  path.node.declaration.name.startsWith('use') && 
                  /^[a-z]/.test(path.node.declaration.name)) {
          hooks.push(path.node.declaration.name);
        }
      }
    }
  });
  
  return hooks;
}

/**
 * Find all hook rule violations in the project
 * @param {Array} additionalHooks Additional custom hooks to check
 * @returns {Array} Array of hook rule violations
 */
function findHookRuleViolations(additionalHooks = []) {
  const files = getAllFiles(srcDir);
  const violations = [];
  
  // Combine standard hooks with project-wide custom hooks
  const projectWideHooks = [...STANDARD_HOOKS, ...additionalHooks];
  
  for (const file of files) {
    // Skip files in the hooks directory during analysis as they contain hook definitions
    if (file.includes(path.sep + 'hooks' + path.sep)) {
      const hookName = path.basename(file).replace(/\.[^/.]+$/, "");
      // Skip analyzing hook files for violations in the hooks themselves
      // This can be removed if you want to check hook files for violations too
      if (hookName.startsWith('use')) {
        continue;
      }
    }
    
    const fileViolations = findHookViolationsInFile(file, projectWideHooks);
    violations.push(...fileViolations);
  }
  
  return violations;
}

/**
 * Find hook rule violations in a specific file
 * @param {string} filePath Path to the file
 * @param {Array} projectWideHooks List of known hooks across the project 
 * @returns {Array} Array of hook rule violations in the file
 */
function findHookViolationsInFile(filePath, projectWideHooks = []) {
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
  
  const violations = [];
  const relativePath = path.relative(srcDir, filePath);
  
  // Find all custom hooks defined in this file to add to our check
  const customHooks = [];
  
  traverse(ast, {
    // Find custom hook definitions (functions starting with "use")
    FunctionDeclaration(path) {
      if (path.node.id && path.node.id.name.startsWith('use') && /^[a-z]/.test(path.node.id.name)) {
        customHooks.push(path.node.id.name);
      }
    },
    
    // Find custom hooks defined as arrow functions or function expressions
    VariableDeclarator(path) {
      if (path.node.id && path.node.id.type === 'Identifier' && 
          path.node.id.name.startsWith('use') && /^[a-z]/.test(path.node.id.name)) {
        if (path.node.init && 
            (path.node.init.type === 'ArrowFunctionExpression' || 
             path.node.init.type === 'FunctionExpression')) {
          customHooks.push(path.node.id.name);
        }
      }
    }
  });
  
  // Combine project-wide hooks with file-specific custom hooks
  const allHooks = [...projectWideHooks, ...customHooks];
  
  // Track function stack to detect nested functions
  const functionStack = [];
  
  // Track component or custom hook contexts
  const validHookContexts = [];
  
  traverse(ast, {
    // Track all function declarations to determine contexts
    FunctionDeclaration: {
      enter(path) {
        const functionName = path.node.id ? path.node.id.name : 'anonymous';
        functionStack.push(functionName);
        
        // Check if this is a component or custom hook
        if (functionName.startsWith('use') || 
            (functionName && /^[A-Z]/.test(functionName))) {
          validHookContexts.push(functionName);
        }
      },
      exit() {
        functionStack.pop();
        if (validHookContexts.length > 0) {
          validHookContexts.pop();
        }
      }
    },
    
    // Track arrow functions and function expressions
    ArrowFunctionExpression: {
      enter(path) {
        let functionName = 'anonymous';
        let isComponent = false;
        
        // Get name from variable declaration
        if (path.parent.type === 'VariableDeclarator' && 
            path.parent.id && 
            path.parent.id.type === 'Identifier') {
          functionName = path.parent.id.name;
          isComponent = isLikelyComponent(functionName, filePath);
        }
        
        // Check for direct exports: export const Component = () => {}
        if (path.parent.type === 'VariableDeclarator' && 
            path.parent.parent && 
            path.parent.parent.type === 'VariableDeclaration' && 
            path.parent.parent.parent && 
            path.parent.parent.parent.type === 'ExportNamedDeclaration') {
          isComponent = isLikelyComponent(functionName, filePath);
        }
        
        // Check for props destructuring - a strong signal of a component
        if (path.node.params && 
            path.node.params[0] && 
            path.node.params[0].type === 'ObjectPattern') {
          // Check for common React prop names
          const propNames = path.node.params[0].properties.map(p => 
            p.key && p.key.name ? p.key.name : ''
          );
          
          if (propNames.some(name => ['props', 'children', 'className', 'style', 'onClick'].includes(name))) {
            isComponent = true;
          }
        }
        
        // Add to valid contexts if it looks like a component or hook
        if (isComponent || (functionName && functionName.startsWith('use'))) {
          validHookContexts.push(functionName);
        }
        
        functionStack.push(functionName);
      },
      exit() {
        functionStack.pop();
        if (validHookContexts.length > 0 && 
            (functionStack.length < validHookContexts.length)) {
          validHookContexts.pop();
        }
      }
    },
    
    // Track function expressions
    FunctionExpression: {
      enter(path) {
        let functionName = path.node.id ? path.node.id.name : 'anonymous';
        
        // Try to detect component or hook name from variable assignment
        if (path.parent.type === 'VariableDeclarator' && 
            path.parent.id && 
            path.parent.id.type === 'Identifier') {
          functionName = path.parent.id.name;
          
          // Check if this is a component or custom hook
          if (functionName.startsWith('use') || 
              (functionName && /^[A-Z]/.test(functionName))) {
            validHookContexts.push(functionName);
          }
        }
        
        functionStack.push(functionName);
      },
      exit() {
        functionStack.pop();
        if (validHookContexts.length > 0 && 
            (functionStack.length < validHookContexts.length)) {
          validHookContexts.pop();
        }
      }
    },
    
    // Check for hook calls inside conditionals
    IfStatement(path) {
      findHooksInNode(path.node.consequent, 'if statement', allHooks, validHookContexts, violations, relativePath);
      if (path.node.alternate) {
        findHooksInNode(path.node.alternate, 'else statement', allHooks, validHookContexts, violations, relativePath);
      }
    },
    
    // Check for hook calls inside loops
    ForStatement(path) {
      findHooksInNode(path.node.body, 'for loop', allHooks, validHookContexts, violations, relativePath);
    },
    
    WhileStatement(path) {
      findHooksInNode(path.node.body, 'while loop', allHooks, validHookContexts, violations, relativePath);
    },
    
    DoWhileStatement(path) {
      findHooksInNode(path.node.body, 'do-while loop', allHooks, validHookContexts, violations, relativePath);
    },
    
    // Check for hook calls inside ternary operators
    ConditionalExpression(path) {
      findHooksInNode(path.node.consequent, 'ternary conditional ? branch', allHooks, validHookContexts, violations, relativePath);
      findHooksInNode(path.node.alternate, 'ternary conditional : branch', allHooks, validHookContexts, violations, relativePath);
    },
    
    // Check for hook calls inside logical expressions (&& and ||)
    LogicalExpression(path) {
      findHooksInNode(path.node.right, `logical ${path.node.operator} expression`, allHooks, validHookContexts, violations, relativePath);
    },
    
    // Check for hook calls in general
    CallExpression(path) {
      // Only process if this is a direct call (not nested in another call)
      if (path.parent.type !== 'CallExpression') {
        const callee = path.node.callee;
        
        // Check if this is a hook call
        if (callee.type === 'Identifier' && allHooks.includes(callee.name)) {
          // If we're inside a component or custom hook but this is a nested function, it's a violation
          if (validHookContexts.length > 0 && functionStack.length > validHookContexts.length) {
            violations.push({
              hook: callee.name,
              context: `nested function inside ${validHookContexts[validHookContexts.length - 1]}`,
              file: relativePath,
              line: path.node.loc.start.line
            });
          }
          // If we're not inside any component or custom hook, it's a violation
          else if (validHookContexts.length === 0) {
            violations.push({
              hook: callee.name,
              context: 'regular function (not a component or custom hook)',
              file: relativePath,
              line: path.node.loc.start.line
            });
          }
        }
      }
    },
    VariableDeclaration(path) {
      // Check for component exports
      if (path.parent && path.parent.type === 'ExportNamedDeclaration') {
        for (const declaration of path.node.declarations) {
          if (declaration.id && declaration.id.type === 'Identifier') {
            const name = declaration.id.name;
            
            // If it looks like a component and initializes with a function
            if (isLikelyComponent(name, filePath) && 
                declaration.init && 
                (declaration.init.type === 'ArrowFunctionExpression' || 
                 declaration.init.type === 'FunctionExpression')) {
              // Mark this as a valid context for hooks
              validHookContexts.push(name);
            }
          }
        }
      }
    }
  });
  
  return violations;
}

/**
 * Find hooks called within a node (used for conditional and loop bodies)
 * @param {Object} node AST node to check
 * @param {string} context Description of the context
 * @param {Array} hooks List of hook names to check
 * @param {Array} validContexts List of valid contexts
 * @param {Array} violations Array to add violations to
 * @param {string} filePath Path to the file being checked
 */
function findHooksInNode(node, context, hooks, validContexts, violations, filePath) {
  if (!node) return;
  
  // Create a temporary AST just for this node to traverse
  traverse(node, {
    CallExpression(path) {
      const callee = path.node.callee;
      
      if (callee.type === 'Identifier' && hooks.includes(callee.name)) {
        // Verify we're in a valid hook context before reporting
        if (validContexts.length > 0) {
          violations.push({
            hook: callee.name,
            context,
            file: filePath,
            line: path.node.loc.start.line
          });
        }
        
        // Stop traversal to avoid duplicate reports
        path.stop();
      }
    }
  }, {});
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
 * Add this helper function to improve component detection
 * @param {string} name Name of the function
 * @param {string} filePath Path to the file
 * @returns {boolean} Whether the function is likely a component
 */
function isLikelyComponent(name, filePath) {
  if (!name) return false;
  
  // Components should start with uppercase letter (React convention)
  const isUppercase = /^[A-Z]/.test(name);
  
  // If it's uppercase, it's very likely a component
  if (isUppercase) return true;
  
  // Check component-specific directories
  const isInComponentDir = filePath.includes('/components/') || 
                          filePath.includes('/pages/') ||
                          filePath.includes('/views/') ||
                          filePath.includes('/screens/');
                          
  // Check component-specific file names
  const fileBaseName = path.basename(filePath, path.extname(filePath));
  const fileHasComponentName = fileBaseName.includes('Component') ||
                              fileBaseName.includes('Page') ||
                              fileBaseName.includes('View');
                              
  // If it's in a component directory or has a component-like filename,
  // we can be more lenient with the naming convention
  return isInComponentDir || fileHasComponentName;
}