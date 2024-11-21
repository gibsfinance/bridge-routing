module.exports = {
  // Specify the schema URL
  schema: process.env.PUBLIC_INDEXER_URL,
  target: 'typescript',
  generates: {
    './src/lib/gql/': {
      preset: 'client',
      plugins: ['typescript', 'typescript-operations'],
    },
  },
}
