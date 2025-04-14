/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const srcDir = path.resolve(__dirname, '../../src');

describe('Component Size Analysis', () => {
  it('should identify large component files', () => {
    const SIZE_THRESHOLD = 20 * 1024; // 20KB for raw file size (lower than before because we're not bundling)
    const componentFiles = findComponentFiles();
    
    const largeFiles = componentFiles
      .map(file => ({
        path: file,
        name: path.basename(file),
        size: fs.statSync(file).size
      }))
      .filter(file => file.size > SIZE_THRESHOLD)
      .sort((a, b) => b.size - a.size);
    
    if (largeFiles.length > 0) {
      console.warn('📦 Large File Warning:');
      largeFiles.forEach(file => {
        console.warn(`  ${file.name}: ${(file.size / 1024).toFixed(1)}KB`);
        console.warn(`    Path: ${path.relative(srcDir, file.path)}`);
      });
      
      console.info('\nPossible optimization strategies:');
      console.info('1. Use dynamic imports and React.lazy for code splitting');
      console.info('2. Extract reusable logic into custom hooks');
      console.info('3. Move large data constants to separate files');
      console.info('4. Use virtualization for long lists');
    } else {
      console.log('✅ All component files are within reasonable size!');
    }
    
    // This passes the test regardless - it's just informational
    expect(true).toBe(true);
  });
});

function findComponentFiles() {
  const componentDirs = [
    path.resolve(srcDir, 'components'),
    path.resolve(srcDir, 'pages'),
    path.resolve(srcDir, 'views')
  ];
  
  let files = [];
  
  for (const dir of componentDirs) {
    if (fs.existsSync(dir)) {
      files = files.concat(getAllFiles(dir, ['.js', '.jsx', '.ts', '.tsx']));
    }
  }
  
  return files.filter(file => {
    const fileName = path.basename(file).toLowerCase();
    return !fileName.includes('.test.') && 
           !fileName.includes('.spec.') && 
           !fileName.includes('.stories.') && 
           !fileName.startsWith('index.');
  });
}

function getAllFiles(dir, extensions) {
  const files = [];
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const itemPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      files.push(...getAllFiles(itemPath, extensions));
    } else {
      const ext = path.extname(item.name);
      if (extensions.includes(ext)) {
        files.push(itemPath);
      }
    }
  }
  
  return files;
}