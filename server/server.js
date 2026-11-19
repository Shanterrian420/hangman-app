import process from 'node:process'

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { randomUUID } from 'node:crypto'
import {
  PutCommand,
  QueryCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb'
import db from './db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Home route
app.get('/', (req, res) => {
  res.json({ message: 'Hangman API is running!' })
})

// POST: Register a new player
app.post('/players', async (req, res) => {
  try {
    const { playerName } = req.body

    if (!playerName || !playerName.trim()) {
      return res.status(400).json({
        message: 'Player name is required.'
      })
    }

    const player = {
      playerID: randomUUID(),
      playerName: playerName.trim(),
      wins: 0,
      losses: 0
    }

    await db.send(
      new PutCommand({
        TableName: 'Players',
        Item: player
      })
    )

    res.status(201).json({
      message: 'Player registered successfully!',
      player
    })
  } catch (error) {
    console.error('Error registering player:', error)
    res.status(500).json({
      message: 'Unable to register player.'
    })
  }
})

// GET: Find a player by name
app.get('/players', async (req, res) => {
  try {
    const playerName = req.query.playerName?.trim()

    if (!playerName) {
      return res.status(400).json({
        message: 'Player name is required.'
      })
    }

    const result = await db.send(
      new QueryCommand({
        TableName: 'Players',
        IndexName: 'playerName-index',
        KeyConditionExpression: '#name = :name',
        ExpressionAttributeNames: {
          '#name': 'playerName'
        },
        ExpressionAttributeValues: {
          ':name': playerName
        }
      })
    )

    if (!result.Items || result.Items.length === 0) {
      return res.status(404).json({
        message: 'Player not found.'
      })
    }

    res.status(200).json({
      message: 'Player found!',
      players: result.Items
    })
  } catch (error) {
    console.error('Error finding player:', error)
    res.status(500).json({
      message: 'Unable to find player.'
    })
  }
})

// PUT: Update a player's wins or losses
app.put('/players/:playerID', async (req, res) => {
  try {
    const { playerID } = req.params
    const { outcome } = req.body

    if (!['win', 'loss'].includes(outcome)) {
      return res.status(400).json({
        message: 'Outcome must be win or loss.'
      })
    }

    const stat = outcome === 'win' ? 'wins' : 'losses'

    const result = await db.send(
      new UpdateCommand({
        TableName: 'Players',
        Key: { playerID },
        UpdateExpression: `SET #stat = if_not_exists(#stat, :zero) + :one`,
        ExpressionAttributeNames: {
          '#stat': stat
        },
        ExpressionAttributeValues: {
          ':zero': 0,
          ':one': 1
        },
        ConditionExpression: 'attribute_exists(playerID)',
        ReturnValues: 'ALL_NEW'
      })
    )

    res.status(200).json({
      message: 'Player stats updated successfully!',
      player: result.Attributes
    })
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return res.status(404).json({
        message: 'Player not found.'
      })
    }

    console.error('Error updating player stats:', error)
    res.status(500).json({
      message: 'Unable to update player stats.'
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
