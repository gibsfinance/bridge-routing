const fs = require('fs');
const path = require('path');

const PACKAGE_JSON = 'package.json';

const ROOT = path.join(__dirname, '..');
const ROOT_PACKAGE_JSON = require(path.join(ROOT, PACKAGE_JSON));
const matcher = /"version":\s*"\d\.\d\.\d"/g;
const replacement = `"version": "${ROOT_PACKAGE_JSON.version}"`;

ROOT_PACKAGE_JSON.workspaces.forEach((path) => {
  const items = path.split('/');
  const packageJsonPath = path.join(ROOT, ...items, PACKAGE_JSON);
  const file = fs.readFileSync(packageJsonPath, 'utf8');
  const updated = file.replace(matcher, replacement)

  fs.writeFileSync(packageJsonPath, updated);
});
