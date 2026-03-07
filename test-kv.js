const puter = require('./puter-backend.js');

async function testKV() {
    console.log("Testing Puter Key-Value Storage...");
    try {
        // Test setting a value
        const testKey = "test_key_" + Date.now();
        const testValue = { hello: "world", timestamp: new Date().toISOString() };
        
        console.log(`Setting ${testKey}...`);
        await puter.kv.set(testKey, JSON.stringify(testValue));
        
        console.log(`Getting ${testKey}...`);
        const value = await puter.kv.get(testKey);
        console.log("Retrieved Value:", value);
        
        if (value === JSON.stringify(testValue)) {
            console.log("KV Test Passed!");
        } else {
            console.log("KV Test Failed: Value mismatch");
        }
        
    } catch (err) {
        console.error("KV Test Error:", err);
    }
}

testKV();
