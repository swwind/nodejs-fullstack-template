/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testRegex: ".spec.ts$",
  globals: {
    'ts-jest': {
      tsconfig: 'tests/tsconfig.json',
      useESM: true,
    }
  }
};