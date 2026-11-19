# Hangman Game

## Project Description
This project is a Hangman game built using React and Vite for the frontend, Express.js for the backend, and DynamoDB Local for storing player information and game statistics.

Players can enter their name to start playing. The application checks whether the player already exists in the database. If they do, their existing record is loaded. If they are new, a player record is created.

The application tracks wins and losses and calculates each player's winning percentage.

## Technologies Used
- React
- Vite
- JavaScript
- Express.js
- Node.js
- Amazon DynamoDB Local
- Docker Compose
- AWS SDK for JavaScript

## Features
- Player registration and lookup
- Random word selection
- Interactive letter guessing
- Hangman images that change as lives are lost
- Win and loss detection
- Persistent player statistics
- Winning percentage calculation
- New Game functionality

## Project Setup

### 1. Install Dependencies
Open a terminal in the project directory and run:

```bash
npm install
```

### 2. Start DynamoDB Local
Run Docker Desktop, then execute:

```bash
docker compose up -d
```

### 3. Start the Backend Server
Open a terminal in the project directory and run:

```bash
npm run server
```

The backend runs at:

`http://localhost:3001`

### 4. Start the Frontend
Open another terminal in the project directory and run:

```bash
npm run dev
```

Open the local Vite address shown in the terminal, usually:

`http://localhost:5173`

## Database Management
DynamoDB Local stores player records in a table named `Players`.

Each player record contains:
- `playerID`
- `playerName`
- `wins`
- `losses`

The DynamoDB Admin interface is available at:

`http://localhost:8001`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/players?playerName=NAME` | Finds a player by name |
| POST | `/players` | Creates a new player |
| PUT | `/players/:playerID` | Updates a player's wins or losses |

## Backend Files
- `server/server.js` – Express server and API routes
- `server/db.js` – DynamoDB client configuration

## Stopping the Application
To stop the frontend and backend, press `Control + C` in their respective terminals.

To stop the Docker containers, run:

```bash
docker compose down
```
