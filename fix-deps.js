const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.dependencies['@tanstack/react-router'] = '1.121.0-alpha.27';
pkg.dependencies['@tanstack/react-start'] = '1.121.0-alpha.27';
pkg.dependencies['@tanstack/react-router-devtools'] = '1.121.0-alpha.27';

pkg.overrides = pkg.overrides || {};
const depsToPin = [
  'react-start-client', 'react-start-server', 'react-start-plugin',
  'start-server-functions-client', 'start-client-core', 'start-server-core',
  'start-plugin-core', 'router-core', 'router-plugin', 'router-generator',
  'router-devtools-core', 'directive-functions-plugin', 'server-functions-plugin',
  'start-server-functions-fetcher', 'start-storage-context', 'start-fn-stubs',
  'virtual-file-routes', 'react-router'
];

depsToPin.forEach(d => {
  pkg.overrides[`@tanstack/${d}`] = '1.121.0-alpha.27';
});

// A few known mismatches
pkg.overrides['@tanstack/router-utils'] = '1.121.0-alpha.26';
pkg.overrides['@tanstack/start-server-functions-server'] = '1.121.0-alpha.26';

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 4));
