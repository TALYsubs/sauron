const { execSync } = require('child_process');

const args = process.argv.slice(2);

// Map subgraph names to their respective paths
const subgraphs = {
    user: './subgraphs/user',
    plan: './subgraphs/plan',
    product: './subgraphs/product',
    subscription: './subgraphs/subscription',
    payment: './subgraphs/payment',
    ecommerce: './subgraphs/ecommerce',
    company: './subgraphs/company'
};

// Determine which subgraphs to run
const filters = args.length
    ? args.map(name => subgraphs[name] ? `--filter=${subgraphs[name]}` : '').join(' ')
    : '--filter=./subgraphs/*';

// Build the Turbo command
const turboCommand = `turbo run dev --filter=./apps/federation ${filters} -- --param="subgraphs=${args.join(',')}"`;

console.log(`Running command: ${turboCommand}`);

// Execute the Turbo command
execSync(turboCommand, { stdio: 'inherit' });
