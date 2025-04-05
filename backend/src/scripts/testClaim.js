const { testClaim } = require('../utils/testClaim');

// Get the item ID from command line arguments
const itemId = process.argv[2];

if (!itemId) {
  console.error('Please provide an item ID as a command line argument');
  process.exit(1);
}

console.log(`Testing claim process for item ID: ${itemId}`);

// Run the test
testClaim(itemId)
  .then(() => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  }); 