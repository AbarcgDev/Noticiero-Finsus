// Test script to verify ES module imports work correctly
import('./src/app/services/noticierosService.js')
  .then(() => {
    console.log('✅ noticierosService.js imports successfully');
    return import('./src/app/services/noticiasService.js');
  })
  .then(() => {
    console.log('✅ noticiasService.js imports successfully');
    console.log('✅ All imports working correctly!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import error:', error.message);
    process.exit(1);
  });
