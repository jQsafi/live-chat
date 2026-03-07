const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

// Mock browser environment for puter.js
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    url: "https://jqsafi.github.io/",
    runScripts: "dangerously",
    resources: "usable"
});

const PUTER_REFERER = "https://jqsafi.github.io/";

// Intercept fetch to add Referer/Origin headers
const nativeFetch = global.fetch;
const fetchWithHeaders = async (url, options = {}) => {
    if (url.includes("puter.com")) {
        options.headers = options.headers || {};
        options.headers['Referer'] = PUTER_REFERER;
        options.headers['Origin'] = PUTER_REFERER;
    }
    return nativeFetch(url, options);
};

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.screen = dom.window.screen;
global.location = dom.window.location;
global.XMLHttpRequest = dom.window.XMLHttpRequest;
global.Image = dom.window.Image;
global.fetch = fetchWithHeaders;

dom.window.fetch = fetchWithHeaders;
dom.window.URL = global.URL;
dom.window.Blob = global.Blob;

// Load the library
const scriptContent = fs.readFileSync(path.join(__dirname, "puter-lib.js"), "utf8");
try {
    // Eval the script in the mock window context
    dom.window.eval(scriptContent);
    console.log("Puter Backend Library initialized successfully.");
} catch (err) {
    console.error("Error loading Puter library in Node:", err);
}

// Export the puter object from the window
module.exports = dom.window.puter;
