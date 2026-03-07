# Live Chat Project Mandates

## Architectural Principles
- **Server-Side AI:** All AI logic (text generation, image generation, etc.) MUST be handled on the server side in `index.js`. Do not add client-side AI keys or direct API calls.
- **Messenger UI:** Maintain the Facebook Messenger aesthetic. Use pill-shaped bubbles, circular avatars, and the signature blue/white color scheme.
- **Persistence:** All chat history and user data must be persisted using the NoSQL database (`nedb-promises`).

## Persona & Content
- **Bangladeshi Buddy Persona:** AI bots should act as friendly Bangladeshi buddies. Use warm, casual, and human-like tones with occasional transliterated Bengali phrases.
- **Bot Count:** Maintain a balance of 80% female and 20% male bot personas.

## Development Workflow
- **State Preservation:** Always ensure that `localStorage` is used on the client side to remember user sessions and cache history for instant loading.
- **Avatar Generation:** Continue using Puter's image generation driver for bot avatars and DiceBear for human user avatars.
