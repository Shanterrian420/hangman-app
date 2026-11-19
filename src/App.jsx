import { useState, useEffect, useRef } from 'react'
import './App.css'

// Available words to find in Hangman
const words = ['SENTENCE', 'PLAYSTATION', 'SUPERHERO', 'KEYBOARD', 'MANAGER']

// Emotions to show the progression of Hangman
function GameFace({ lives, gameWon }) {
  let face = '🙂'
  let message = 'Begin!'

  if (lives <= 4) {
    face = '😕'
    message = 'Incorrect letter. Try again.'
  }

  if (lives <= 3) {
    face = '😟'
    message = 'Getting worried.'
  }

  if (lives <= 2) {
    face = '😬'
    message = 'Be careful!'
  }

  if (lives <= 1) {
    face = '😰'
    message = 'Hang in there!'
  }

  if (lives === 0) {
    face = '☹️'
    message = 'Oh no!'
  }

  if (gameWon) {
    face = '😃'
    message = 'You did it!'
  }

  return (
    <div className="game-face">
      <span className="face-emoji">{face}</span>
      <p>{message}</p>
    </div>
  )
}

// Display an image based on incorrect guesses
function HangmanDrawing({ wrongGuesses }) {
  const imageNumber = wrongGuesses + 1

  return (
    <img
  className="hangman-drawing"
  src={`/images/hangman_${imageNumber}.png`}
  alt={`Hangman stage ${imageNumber}`}
/>

  )
}

// Main Hangman game
function App() {
  const [player, setPlayer] = useState(null)
  const playerID = player?.playerID
  const [playerName, setPlayerName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const resultSaved = useRef(false)

  async function registerPlayer(event) {
  event.preventDefault()

  if (!playerName.trim()) {
    setError('Please enter your name.')
    return
  }

  setLoading(true)
  setError('')

  try {
    const response = await fetch(
      `http://localhost:3001/players?playerName=${encodeURIComponent(playerName.trim())}`
    )

    let playerData

    if (response.ok) {
      const data = await response.json()
      playerData = data.players[0]
    } else if (response.status === 404) {
      const createResponse = await fetch('http://localhost:3001/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playerName: playerName.trim() })
      })

      if (!createResponse.ok) {
        throw new Error('Unable to register player.')
      }

      const data = await createResponse.json()
      playerData = data.player
    } else {
      throw new Error('Unable to find player.')
    }

    setPlayer(playerData)
  } catch (error) {
    setError(error.message || 'Something went wrong.')
  } finally {
    setLoading(false)
  }
}
  const [word, setWord] = useState(
    () => words[Math.floor(Math.random() * words.length)]
  )

  const [guessedLetters, setGuessedLetters] = useState([])
  const [lives, setLives] = useState(5)

  const gameWon = word.split('').every((letter) =>
    guessedLetters.includes(letter)
  )

  const gameLost = lives === 0
  const gameOver = gameWon || gameLost

  useEffect(() => {
  if (!playerID || !gameOver || resultSaved.current) return

  resultSaved.current = true

  async function updatePlayerStats() {
    try {
      const response = await fetch(
        `http://localhost:3001/players/${playerID}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            outcome: gameWon ? 'win' : 'loss'
          })
        }
      )

      if (!response.ok) {
        throw new Error('Unable to update player stats.')
      }

      const data = await response.json()
      setPlayer(data.player)
    } catch (error) {
      console.error(error)
      setError('Could not save your game result.')
    }
  }

  updatePlayerStats()
}, [gameOver, gameWon, playerID])

  // Handle a letter guess
  function guessLetter(letter) {
    if (guessedLetters.includes(letter) || gameOver) return

    setGuessedLetters((previous) => [...previous, letter])

    if (!word.includes(letter)) {
      setLives((previous) => previous - 1)
    }
  }
  
  // Function for receiving hints
  
function hintLetter() {
  if (gameOver) return

  const hiddenLetters = word
    .split('')
    .filter((letter) => !guessedLetters.includes(letter))

  if (hiddenLetters.length === 0) return

  const randomLetter =
    hiddenLetters[Math.floor(Math.random() * hiddenLetters.length)]

  setGuessedLetters((previous) =>
    previous.includes(randomLetter)
      ? previous
      : [...previous, randomLetter]
  )

  setLives(lives - 1)
}

  // Start a new game with a different word
  function newGame() {

    let nextWord = word
    resultSaved.current = false
    while (nextWord === word && words.length > 1) {
      nextWord = words[Math.floor(Math.random() * words.length)]
    }

    setWord(nextWord)
    setGuessedLetters([])
    setLives(5)
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
  <>
    {!player ? (
      <main className="game">
        
    <h1>Hangman</h1>

        <form onSubmit={registerPlayer}>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Start Game'}
          </button>
        </form>

        {error && <p>{error}</p>}
      </main>
    ) : (
      <main className="game">
        
    <h2>Welcome, {player.playerName}!</h2>
    <p>Let's see if you can guess the word.</p>

    <p>Wins: {player.wins}</p>
    <p>Losses: {player.losses}</p>

  <p>
    Winning Percentage:{' '}
  { player.wins + player.losses === 0
    ? '0%'
    : `${((player.wins / (player.wins + player.losses)) * 100).toFixed(1)}%`}
  </p>
        <p className="instructions">
        Guess the word before you run out of lives!
      </p>

      {/* Hangman image and emotion emoji */}
      <div className="game-display">
        <div className="hangman">
          <HangmanDrawing wrongGuesses={5 - lives} />
          <p>Lives remaining: {lives}</p>
        </div>

        <GameFace lives={lives} gameWon={gameWon} />
      </div>

      {/* Hidden word */}
      <div className="word">
        {word.split('').map((letter, index) => (
          <span className="letter" key={index}>
            {guessedLetters.includes(letter) || gameLost ? letter : '_'}
          </span>
        ))}
      </div>

<button
  className="hint-button"
  onClick={hintLetter}
  disabled={
    gameOver ||
    word.split('').every((letter) => guessedLetters.includes(letter))
  }
>
  💡 Want a hint?
</button>


      {/* Letter keyboard */}
      <div className="keyboard">
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => guessLetter(letter)}
            disabled={guessedLetters.includes(letter) || gameOver}
            className={
              guessedLetters.includes(letter)
                ? word.includes(letter)
                  ? 'correct'
                  : 'incorrect'
                : ''
            }
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Win or lose message */}
      {gameOver && (
        <div className="result">
          <h2>{gameWon ? 'You won!' : 'Game over!'}</h2>
          <p>The word was {word}.</p>
        </div>
      )}

      {/* Restart button */}
      <button className="new-game" onClick={newGame}>
        New Game
      </button>
    </main>
  )}
  </>
  )
}

export default App