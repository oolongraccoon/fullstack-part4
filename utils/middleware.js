const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Blog = require('../models/blog')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  }
  next(error)
}
const tokenExtractor = (request, response ) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  } 
  return null
 
}
const userExtractor = async (request, response, next) => {
  try {
    const token = tokenExtractor(request)
    if (!token) {
      return response.status(401).json({ error: 'token invalid' })
    }    
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
    request.user = await User.findById(decodedToken.id)
    if (!request.user) {
      return response.status(400).json({ error: 'user is missing' })
    }
    next()
  } catch (error) {
    next(error)  
  }
} 
module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}