const puter = require('./puter-backend.js');

async function test() {
    console.log("Testing Puter AI...");
    try {
        const response = await puter.ai.chat("Hello! Who are you?");
        console.log("AI Response:", response.toString());
        
        console.log("Testing Puter txt2img...");
        // This might return an Image object in JSDOM, we need the src
        const image = await puter.ai.txt2img("A cute cat", true);
        console.log("Image source starts with:", image.src.substring(0, 50) + "...");
    } catch (err) {
        console.error("Test failed:", err);
    }
}

test();
