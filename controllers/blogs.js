const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const logger = require('../utils/logger')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

blogsRouter.get('/api/blogs', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/api/blogs',async (request, response) => {
  const blogData = request.body
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)
 
  // if(!user){
  //   return response.status(400).json({ error: 'user is missing' });
  // }
  // console.log(JSON.stringify(user))
  if (typeof blogData.likes === 'undefined') {
    blogData.likes = 0
  }
  const blog = new Blog({
    url: blogData.url,
    title: blogData.title,
    author: blogData.author,
    likes: blogData.likes,
    user: user._id
})
  logger.info(user._id)
  try {
    if (!blogData.title || !blogData.url) {
      return response.status(400).json({ error: 'Title or URL is missing' });
    } 

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
} catch (error) {
  response.status(400).json({ error: error.message })
}
})
blogsRouter.delete('/api/blogs/:id', async (request, response, next) => {
  try {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (exception) {
    next(exception)
  }
})
blogsRouter.put('/api/blogs/:id', (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.autho,
    url: body.url,
    likes: body.likes
  }

  Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    .then(updatedBlog => {
      response.json(updatedBlog)
    })
    .catch(error => next(error))
})
module.exports = blogsRouter