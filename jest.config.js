const common = {
  testEnvironment: 'node',
};

module.exports = {
  projects: [
    {
      ...common,
      displayName: 'e2e',
      testMatch: ['<rootDir>/__e2e__/*{.,-}test.[jt]s'],
    },
  ],
};
