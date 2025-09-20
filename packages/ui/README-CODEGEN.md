# GraphQL Code Generation Setup

This document describes the GraphQL code generation setup for generating TypeScript types from the indexer's GraphQL schema.

## Overview

We have set up GraphQL Code Generator to automatically generate TypeScript types from the public indexer GraphQL endpoint. This ensures type safety when making GraphQL queries.

## Setup

### Dependencies Added

The following dependencies were added to `packages/ui/package.json`:

```json
{
  "devDependencies": {
    "@graphql-codegen/cli": "^3.3.1",
    "@graphql-codegen/typescript": "^3.0.4",
    "@graphql-codegen/typescript-operations": "^3.0.4"
  }
}
```

### Configuration

The GraphQL Code Generator is configured via `packages/ui/codegen.yml`:

```yaml
overwrite: true
schema: '${PUBLIC_INDEXER:https://staging.indexer.gibs.finance}/graphql'
documents: 'src/**/*.{ts,tsx,js,jsx,svelte}'
generates:
  src/lib/gql/graphql.ts:
    plugins:
      - 'typescript'
      - 'typescript-operations'
    config:
      scalars:
        BigInt: string
        JSON: any
      skipTypename: false
      enumsAsTypes: true
      constEnums: true
      futureProofEnums: true
      numericEnums: false
      strictScalars: true
      namingConvention:
        typeNames: pascal-case#pascalCase
        enumValues: keep
```

### Scripts

The following scripts were added to both the ui package and root package.json:

**UI (`packages/ui/package.json`):**

```json
{
  "scripts": {
    "codegen": "node ../../node_modules/@graphql-codegen/cli/cjs/bin.js --config codegen.yml",
    "codegen:watch": "node ../../node_modules/@graphql-codegen/cli/cjs/bin.js --config codegen.yml --watch"
  }
}
```

**Root (`package.json`):**

```json
{
  "scripts": {
    "ui:codegen": "yarn workspace ui run codegen"
  }
}
```

## Usage

### Running Code Generation

To generate types from the GraphQL schema:

```bash
# From root directory
yarn ui:codegen

# Or from ui directory
yarn workspace ui run codegen

# Watch mode (regenerates on schema changes)
yarn workspace ui run codegen:watch
```

### Using Generated Types

The generated types are available in `src/lib/gql/graphql.ts` and can be imported like this:

```typescript
import type { Query, UserRequestForSignature, UserRequestForAffirmation } from '../gql/graphql'
```

### Example Usage

```typescript
import { gql, GraphQLClient } from 'graphql-request'
import type { Query, UserRequestForSignatureFilter } from '../gql/graphql'

const client = new GraphQLClient('https://staging.indexer.gibs.finance/graphql')

const query = gql`
  query GetBridges($where: UserRequestForSignatureFilter) {
    userRequestForSignatures(where: $where, limit: 100) {
      items {
        messageId
        orderId
        from
        to
        amount
        token
      }
    }
  }
`

const result = await client.request<Query>(query, { where: filter })
```

## Configuration Details

- **Schema Source**: The schema is fetched from the `PUBLIC_INDEXER` environment variable, defaulting to `https://staging.indexer.gibs.finance/graphql`
- **Output**: Types are generated to `src/lib/gql/graphql.ts`
- **Scalars**:
  - `BigInt` is mapped to `string` for JSON compatibility
  - `JSON` is mapped to `any` for flexibility
- **Documents**: All GraphQL queries/mutations in `.ts`, `.tsx`, `.js`, `.jsx`, and `.svelte` files are processed

## Troubleshooting

If you encounter issues with the code generation:

1. Ensure the indexer endpoint is accessible
2. Check that all dependencies are installed: `yarn install`
3. Verify the schema is valid by visiting the GraphQL endpoint directly
4. Clear any cached files and regenerate: `rm -rf src/lib/gql && yarn ui:codegen`

## Integration with Existing Code

The generated types work seamlessly with the existing GraphQL queries in the codebase. The `history.ts` store already uses these types for type-safe GraphQL operations.
