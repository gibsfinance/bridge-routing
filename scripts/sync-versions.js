const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PACKAGE_JSON = 'package.json';

const ROOT = path.join(__dirname, '..');
const ROOT_PACKAGE_JSON = require(path.join(ROOT, PACKAGE_JSON));
const matcher = /"version":\s*"\d+\.\d+\.\d+"/g;
const replacement = `"version": "${ROOT_PACKAGE_JSON.version}"`;
console.log(`updating version to ${ROOT_PACKAGE_JSON.version}`);
ROOT_PACKAGE_JSON.workspaces.forEach((workspace) => {
  console.log(`Syncing version for ${workspace}`);
  const items = workspace.split('/');
  const packageJsonPath = path.join(ROOT, ...items, PACKAGE_JSON);
  const file = fs.readFileSync(packageJsonPath, 'utf8');
  const updated = file.replace(matcher, replacement)
  fs.writeFileSync(packageJsonPath, updated);
  execSync(`git add ${packageJsonPath}`, { cwd: ROOT });
});
// update versions all of the packages in yarn.lock
console.log('updating versions in yarn.lock');
execSync('yarn', { cwd: ROOT, stdio: 'ignore' });
console.log('done');
