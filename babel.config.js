const presets = [
  '@babel/preset-react',
  [
    '@babel/env',
    {
      useBuiltIns: 'usage',
    },
  ],
];

module.exports = { presets };