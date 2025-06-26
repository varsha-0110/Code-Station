# CodeStation - Code__Create_Collabrate

A collaborative, real-time code editor where users can seamlessly code together. It provides a platform for multiple users to enter a room, share a unique room ID, and collaborate on code simultaneously.

## 🚀 Live Preview

Preview of the project : [here](https://code-sync-live.vercel.app/).

## 🧑‍💻 Usage

1. Enter a username and room ID to join a room.
2. Edit code in the editor.
3. Others joining the same room can do chat and discuss.
4. Switch to drawing mode to sketch ideas.
5. Run code in supported languages using the Run tab.

## ⚙️ Installation

### Method 1: Manual Installation

1. **Fork this repository:** Click the Fork button located in the top-right corner of this page.
2. **Clone the repository:**
   ```bash
   git clone https://github.com/<user-name>/Code-Station.git
   ```
3. **Create .env file:**
   Inside the client and server directories create `.env` and set:

   Frontend:

   ```bash
   VITE_BACKEND_URL=<your_server_url>
   ```

   Backend:

   ```bash
   PORT=3000
   ```

4. **Install dependencies:**
   ```bash
   npm install     # Run in both client and server directories
   ```
5. **Start the servers:**
   Frontend:
   ```bash
   cd client
   npm run dev
   ```
   Backend:
   ```bash
   cd server
   npm run dev
   ```
6. **Access the application:**
   ```bash
   http://localhost:5173/


