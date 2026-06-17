
module.exports = {
  preset: 'jest-preset-angular',
  roots: ['<rootDir>/src/'],
  testMatch: ['**/+(*.)+(spec).+(ts|js)'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  collectCoverage: true,
  coverageReporters: ['html', 'text-summary'],
  // Perimetre de couverture : code applicatif, hors config/boilerplate
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.spec.ts',
    '!src/app/app.config.ts',
    '!src/app/app.routes.ts',
    '!src/app/shared/material.module.ts',
    '!src/app/core/service/user-mock.service.ts',
  ],
  // Seuil minimum de couverture : 80%
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
