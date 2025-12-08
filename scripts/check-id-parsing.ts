/**
 * Script to check all API routes for ID parsing issues
 * Run with: npx tsx scripts/check-id-parsing.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const apiDir = path.join(process.cwd(), 'app', 'api');
const routeFiles: string[] = [];

// Recursively find all route.ts files
function findRouteFiles(dir: string) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findRouteFiles(filePath);
    } else if (file === 'route.ts') {
      routeFiles.push(filePath);
    }
  }
}

// Check if file has ID parsing issues
function checkFile(filePath: string): { hasIssue: boolean; issues: string[] } {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues: string[] = [];
  
  // Check if file uses parseId import
  const hasParseIdImport = content.includes('parseId') && content.includes('id-parser');
  
  // Check for common patterns that need ID parsing
  const patterns = [
    { regex: /searchParams\.get\(['"`]userId['"`]\)/g, name: 'userId from searchParams' },
    { regex: /searchParams\.get\(['"`]eventId['"`]\)/g, name: 'eventId from searchParams' },
    { regex: /searchParams\.get\(['"`]chatId['"`]\)/g, name: 'chatId from searchParams' },
    { regex: /searchParams\.get\(['"`]hobbyId['"`]\)/g, name: 'hobbyId from searchParams' },
    { regex: /searchParams\.get\(['"`]locationId['"`]\)/g, name: 'locationId from searchParams' },
    { regex: /params\.(id|userId|eventId|chatId)/g, name: 'ID from params' },
  ];
  
  let hasIdUsage = false;
  for (const pattern of patterns) {
    const matches = content.match(pattern.regex);
    if (matches && matches.length > 0) {
      hasIdUsage = true;
      if (!hasParseIdImport) {
        issues.push(`Uses ${pattern.name} but missing parseId import`);
      }
    }
  }
  
  // Check for direct Prisma where clauses with string IDs
  const prismaWhereWithString = /where:\s*\{\s*id:\s*["'`]/.test(content) ||
                                  /where:\s*\{\s*userId:\s*["'`]/.test(content) ||
                                  /where:\s*\{\s*eventId:\s*["'`]/.test(content);
  
  if (prismaWhereWithString) {
    issues.push('Found Prisma where clause with string ID literal');
  }
  
  return {
    hasIssue: issues.length > 0,
    issues,
  };
}

// Main execution
findRouteFiles(apiDir);

console.log(`📊 Checking ${routeFiles.length} route files...\n`);

const problematicFiles: { file: string; issues: string[] }[] = [];

for (const file of routeFiles) {
  const result = checkFile(file);
  if (result.hasIssue) {
    const relativePath = path.relative(process.cwd(), file);
    problematicFiles.push({
      file: relativePath,
      issues: result.issues,
    });
  }
}

if (problematicFiles.length === 0) {
  console.log('✅ All route files look good!');
} else {
  console.log(`⚠️  Found ${problematicFiles.length} files that may need attention:\n`);
  
  for (const { file, issues } of problematicFiles) {
    console.log(`📁 ${file}`);
    for (const issue of issues) {
      console.log(`   ⚠️  ${issue}`);
    }
    console.log('');
  }
  
  console.log('\n💡 Tip: Import parseId from @/lib/utils/id-parser and use it to convert string IDs to integers');
}

process.exit(problematicFiles.length > 0 ? 1 : 0);
