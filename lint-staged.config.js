export default {
  '*.{js,jsx, ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,yaml,yml}': ['prettier --write'],
  '*.{md,mdx}': ['prettier --write'],
}
