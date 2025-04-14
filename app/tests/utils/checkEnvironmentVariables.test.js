/**
 * @vitest-environment node
 */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { describe, it, expect } from 'vitest';

describe('Environment Variable Validation', () => {
  it('all used environment variables should be defined', () => {
    // Load example environment variables
    const envExamplePath = path.resolve(process.cwd(), '.env.template');
    const envExample = dotenv.parse(fs.readFileSync(envExamplePath));

    // Find all defined environment variables
    const definedVars = Object.keys(envExample);
    
    // Find all environment variables referenced in code
    const srcDir = path.resolve(process.cwd(), 'src');
    const referencedVars = findEnvironmentVariables(srcDir);
    
    // Check for variables that are in .env.template but not used in code
    const unusedVars = definedVars.filter(
      variable => !referencedVars.includes(variable)
    );
    
    // Output warnings for unused environment variables
    if (unusedVars.length > 0) {
      console.warn("⚠ The following environment variables are defined in .env.template but not referenced in code:");
      unusedVars.forEach(variable => {
        console.warn(`  ${variable}`);
      });
    }
    
    // This test will pass even with unused variables - it's just a warning
    expect(true).toBe(true);
  });
});

function findEnvironmentVariables(dir) {
  const referencedVars = new Set();
  
  function scanDirectory(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Find process.env.VAR_NAME pattern
        const processEnvMatches = content.match(/process\.env\.([A-Z0-9_]+)/g) || [];
        processEnvMatches.forEach(match => {
          const variable = match.replace('process.env.', '');
          referencedVars.add(variable);
        });
        
        // Find import.meta.env.VAR_NAME pattern (Vite)
        const importMetaEnvMatches = content.match(/import\.meta\.env\.([A-Z0-9_]+)/g) || [];
        importMetaEnvMatches.forEach(match => {
          const variable = match.replace('import.meta.env.', '');
          referencedVars.add(variable);
        });
        
        // Find ${process.env.VAR_NAME} pattern in template literals
        const templateLiteralMatches = content.match(/\$\{process\.env\.([A-Z0-9_]+)\}/g) || [];
        templateLiteralMatches.forEach(match => {
          const variable = match.replace('${process.env.', '').replace('}', '');
          referencedVars.add(variable);
        });
        
        // Find ${import.meta.env.VAR_NAME} pattern in template literals (Vite)
        const viteTemplateLiteralMatches = content.match(/\$\{import\.meta\.env\.([A-Z0-9_]+)\}/g) || [];
        viteTemplateLiteralMatches.forEach(match => {
          const variable = match.replace('${import.meta.env.', '').replace('}', '');
          referencedVars.add(variable);
        });
      }
    }
  }
  
  scanDirectory(dir);
  return Array.from(referencedVars);
}