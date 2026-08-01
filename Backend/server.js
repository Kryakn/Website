require("dotenv").config({ quiet: true });

const app = require("./src/app");
const connectDatabase = require("./src/config/database");

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDatabase();

        app.listen(PORT, function () {
            console.log(`VoxIntel API is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
}

startServer();