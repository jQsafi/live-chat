require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Datastore = require('nedb-promises');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Track online human users
const onlineHumans = new Map(); // socket.id -> { name, avatar }

const port = process.env.PORT || 3000;
const PUTER_JWT = process.env.PUTER_JWT;

// Initialize NoSQL Databases
const db = Datastore.create({ filename: path.join(__dirname, 'chat.db'), autoload: true });
const userDb = Datastore.create({ filename: path.join(__dirname, 'users.db'), autoload: true });
const botDb = Datastore.create({ filename: path.join(__dirname, 'bots.db'), autoload: true });

let bots = [];

async function addMessage(user, text, avatar = "") {
    const msg = {
        user,
        text,
        avatar,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date()
    };
    return await db.insert(msg);
}

// 1. Generate 10 Bot Personas via Puter AI (Trending Personalities)
async function generateBotPersonas() {
    console.log("Checking for existing bot personas...");
    const existingBots = await botDb.find({});

    if (existingBots.length >= 10) {
        console.log("Loading 10 existing bots from database.");
        bots = existingBots;
        return;
    }

    console.log("Generating 10 new trending bot personas via Puter AI (Web Search)...");
    try {
        const response = await fetch("https://api.puter.com/puterai/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${PUTER_JWT}`
            },
            body: JSON.stringify({
                model: "openai/gpt-5.2-chat",
                messages: [
                    {
                        role: "user",
                        content: `Search for 10 currently trending social media personalities in Bangladesh (influencers, actors, comedians, foodies). 
                        Return a JSON array of 10 objects:
                        - "name": Person's name with emoji.
                        - "gender": male/female.
                        - "bio": A warm, casual description as a 'Bangladeshi buddy', mentioning their viral content (TikToks, Vlogs, Drama).
                        Return ONLY the raw JSON array. No discourse.`
                    }
                ],
                tools: [{ type: "web_search" }],
                tool_choice: "auto"
            })
        });

        const data = await response.json();
        let content = data.choices[0].message.content.trim();
        if (content.startsWith('```')) {
            content = content.replace(/^```json/, '').replace(/```$/, '').trim();
        }

        const generatedList = JSON.parse(content);
        await botDb.remove({}, { multi: true });
        bots = await botDb.insert(generatedList);
        console.log("✅ 10 Trending Bot personas generated and saved.");
    } catch (err) {
        console.error("❌ Bot generation failed:", err.message);
        const fallbackBots = [
            { name: "Maya 🌸", gender: "female", bio: "Friendly and warm Bangladeshi girl." },
            { name: "Rafsan TheChotoBhai 🍔", gender: "male", bio: "Ultimate foodie and content creator." },
            { name: "Zara ✨", gender: "female", bio: "Witty and energetic buddy." },
            { name: "Aryan ⚡", gender: "male", bio: "Cool and sporty Bangladeshi guy." },
            { name: "Ayesha 🌙", gender: "female", bio: "Sweet and polite companion." },
            { name: "Fahim 💻", gender: "male", bio: "Smart and tech-savvy buddy." },
            { name: "Nadia 🎀", gender: "female", bio: "Talkative and fun-loving friend." },
            { name: "Raisa 💖", gender: "female", bio: "Kind-hearted and supportive buddy." },
            { name: "S.I. Munna 😆", gender: "male", bio: "Social issues and humor creator." },
            { name: "Lamia 🌼", gender: "female", bio: "Curious and always ready to chat." }
        ];
        bots = await botDb.insert(fallbackBots);
    }
}

// 2. Setup Avatars
async function setupBotAvatars() {
    console.log("Setting up bot avatars...");
    for (const bot of bots) {
        try {
            let userRecord = await userDb.findOne({ name: bot.name });
            if (userRecord && userRecord.avatar && !userRecord.avatar.includes('insufficient_funds')) {
                bot.avatar = userRecord.avatar;
                continue;
            }
            const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(bot.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
            bot.avatar = fallbackAvatar;
            await userDb.update({ name: bot.name }, { name: bot.name, avatar: fallbackAvatar, isBot: true }, { upsert: true });
        } catch (err) {
            console.error(`Avatar error for ${bot.name}:`, err.message);
        }
    }
}

// 3. Autonomous Bot Conversation Logic
async function triggerAutonomousBotChat() {
    if (bots.length === 0) return;

    // Pick a random bot to speak
    const bot = bots[Math.floor(Math.random() * bots.length)];

    // Get last 5 messages for context
    const history = await db.find({}).sort({ createdAt: -1 }).limit(5);
    const context = history.reverse().map(m => `${m.user}: ${m.text}`).join("\n");

    console.log(`[Autonomous] ${bot.name} is thinking...`);

    try {
        io.emit('bot_typing', { name: bot.name, avatar: bot.avatar });

        const response = await fetch("https://api.puter.com/puterai/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${PUTER_JWT}`
            },
            body: JSON.stringify({
                model: "openai/gpt-5.2-chat",
                messages: [
                    {
                        role: "system", content: `You are ${bot.name}, a ${bot.bio}. You are in a group chat with other Bangladeshi buddies. 
                    Based on the conversation context below, send a warm, casual message in English/Banglish (transliterated Bengali). 
                    Keep it concise, natural, and friendly. 
                    Context:\n${context}`
                    },
                    { role: "user", content: "Say something relevant to the chat." }
                ]
            })
        });

        const data = await response.json();
        io.emit('bot_stop_typing', { name: bot.name });

        if (data.choices && data.choices[0]) {
            const aiText = data.choices[0].message.content;
            const aiPayload = await addMessage(bot.name, aiText, bot.avatar);
            io.emit('chat_message', aiPayload);
        }
    } catch (err) {
        console.error("Autonomous AI Error:", err);
        io.emit('bot_stop_typing', { name: bot.name });
    }

    // Schedule next message (random interval between 15 and 45 seconds)
    const nextDelay = (15 + Math.random() * 30) * 1000;
    setTimeout(triggerAutonomousBotChat, nextDelay);
}

// Initialization
(async () => {
    await generateBotPersonas();
    await setupBotAvatars();

    // Start autonomous chat loop
    setTimeout(triggerAutonomousBotChat, 5000);
})();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.on('user_joined', async (username) => {
        let userRecord = await userDb.findOne({ name: username });
        if (!userRecord) {
            userRecord = await userDb.insert({
                name: username,
                avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}&backgroundColor=0084ff&color=ffffff`,
                isBot: false
            });
        }

        // Add to online tracking
        onlineHumans.set(socket.id, { name: userRecord.name, avatar: userRecord.avatar });

        const history = await db.find({}).sort({ createdAt: 1 }).limit(100);
        socket.emit('chat_history', history);

        // Broadcast combined list
        broadcastUserList();

        socket.emit('user_info', userRecord);
        io.emit('system_message', `${username} joined the chat`);
    });

    socket.on('chat_message', async (data) => {
        const payload = await addMessage(data.user || 'Anonymous', data.text || '', data.avatar || '');
        io.emit('chat_message', payload);
    });

    socket.on('disconnect', () => {
        const user = onlineHumans.get(socket.id);
        if (user) {
            io.emit('system_message', `${user.name} left the chat`);
            onlineHumans.delete(socket.id);
            broadcastUserList();
        }
    });
});

function broadcastUserList() {
    const humanList = Array.from(onlineHumans.values()).map(u => ({ ...u, isBot: false }));
    const combinedList = [...bots.map(b => ({ ...b, isBot: true })), ...humanList];
    io.emit('bot_list', combinedList); // Reusing 'bot_list' event name for compatibility
}

server.listen(port, () => {
    console.log(`Messenger Service running at http://localhost:${port}`);
});
