# Live Chat Application

A real-time, lightweight chat application built with Node.js, Express, and Socket.io. This project allows users to set a nickname and communicate instantly in a shared chat room.

## 🚀 Features

- **Real-time Messaging:** Instant message delivery using WebSockets (Socket.io).
- **Nickname System:** Users can set a custom identity before joining the chat.
- **Responsive Design:** A simple, clean interface that works on both desktop and mobile devices.
- **Visual Feedback:** Differentiates between sent and received messages with distinct colors and alignment.

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Real-time Engine:** Socket.io
- **Frontend:** HTML5, CSS3, jQuery (legacy), JavaScript

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jQsafi/live-chat.git
   cd live-chat
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   The server will be running at `http://localhost:3000`.

## 🚧 Planned Improvements

- [ ] **Payload Optimization:** Combine user and message into a single object to prevent race conditions.
- [ ] **Dependency Updates:** Upgrade to the latest versions of Socket.io and Express for better security and performance.
- [ ] **Modernization:** Refactor legacy code to use ES6+ syntax and remove jQuery dependencies.
- [ ] **Enhanced UI/UX:** Add system notifications for user joins/leaves and improved input validation.

## 👨‍💻 Author

**Shafayat Hossain**
- GitHub: [@jQsafi](https://github.com/jQsafi)
- Email: [shafayat@engineer.com](mailto:shafayat@engineer.com)

---
*Developed with ❤️ by Shafayat Hossain*
