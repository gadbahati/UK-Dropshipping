import('../dist/index.js').then(module => {
  const app = module.default;
  export default app;
}).catch(err => {
  console.error('Failed to load app:', err);
  process.exit(1);
});
