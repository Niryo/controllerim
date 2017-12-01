module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "jest": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 2017,
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
      "jsx": true
    },
    "sourceType": "module"
  },
  "plugins": [
    "react"
  ],
  "rules": {
    "no-console": ["error", { allow: ["warn", "error"] }],
    "quotes": [2, "single", { "avoidEscape": true, "allowTemplateLiterals": true }],
    "indent": [
      "error",
      4
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "semi": [
      "error",
      "always"
    ],
    "react/jsx-uses-vars": [2],
    "indent": [2, 2]
  }
};