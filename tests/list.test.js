const listHelper = require('../utils/list_helper')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(listHelper.initialBlogs)
}, 100000)

test('blogs are returned as json', async () => {
  // 4.8: Blog list tests, step1
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
    const blogs = await listHelper.blogsInDb()
    expect(blogs).toHaveLength(2)   
})
test('dummy returns one', () => {
  // 4.3: helper functions and unit tests, step1
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})
describe('total likes', () => {
  // 4.4: helper functions and unit tests, step2
    const listWithOneBlog = [
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
        likes: 5,
        __v: 0
      }
    ]
    const Emptylist = [
    ]
    const listWithBlogs = [
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
        likes: 5,
        __v: 0
      },
      {
        _id: '5a422aa71b54a676234d17f9',
        title: 'Title 2',
        author: 'Author 2',
        url: 'https://example.com/article2',
        likes: 10,
        __v: 0
      }
    ]  
    test('when list has only one blog, equals the likes of that', () => {
      const result = listHelper.totalLikes(listWithOneBlog)
      expect(result).toBe(5)
    })

    
    test('of empty list is zero', () => {
        const result = listHelper.totalLikes(Emptylist)
        expect(result).toBe(0)
    })
    test('of a bigger list is calculated right', () => {
      const result = listHelper.totalLikes(listWithBlogs)
      expect(result).toBe(15)
  })
  })

describe('favoriteBlog', () => {
  // 4.5*: helper functions and unit tests, step3
  const blogs = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    },
    {
      _id: '5a422aa71b54a676234d17f9',
      title: 'Title 2',
      author: 'Author 2',
      url: 'https://example.com/article2',
      likes: 10,
      __v: 0
    }
  ]
  const Fav = {
    _id: '5a422aa71b54a676234d17f9',
    title: 'Title 2',
    author: 'Author 2',
    url: 'https://example.com/article2',
    likes: 10,
    __v: 0
  }
  test('favoriteBlogs', () => {
    const result = listHelper.favoriteBlog(blogs)
    expect(result).toEqual(Fav)
})
})
test('blog post has property id defined', async () => {
  // 4.9*: Blog list tests, step2
  const Blogs = await listHelper.blogsInDb()
  const blogPost = await Blogs[0]

  expect(blogPost.id).toBeDefined()
})
describe('creating new blogs', () => {
  // 4.10: Blog list tests, step3
  test('a valid post can be added', async () => {
    const blogsAtStart = await listHelper.blogsInDb()
    const newPost = {
      title: 'Test Title',
      author: 'Test Author',
      url: 'http://testurl.com',
      likes: 10
    }

    await api
    .post('/api/blogs')
    .send(newPost)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await listHelper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length + 1)

    const titles = blogsAtEnd.map(n => n.title)
    expect(titles).toContain('Test Title')
    })

  test('likes property defaults to 0 if missing', async () => {
    // 4.11*: Blog list tests, step4
    const newPost = {
      title: 'Test Title',
      author: 'Test Author',
      url: 'http://testurl.com'
    }

    const response = await api
      .post('/api/blogs')
      .send(newPost)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(response.body.likes).toBeDefined()
    expect(response.body.likes).toBe(0)
  },10000)
  test('responds with 400 if url is missing', async () => {
    // 4.12*: Blog list tests, step5
    const newBlog = {
      author: 'Test Author',
      likes: 5
    }
    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
  })

  test('fails with status code 400 if username or password is too short', async () => {
    // 4.16*: bloglist expansion, step4
    const newUser = {
      username: 'te',
      name: 'Test User',
      password: 'pa'
    };
  
    await api
      .post('/api/users')
      .send(newUser)
      .expect(400) 
  

  },100000 )
  test('fails with status code 400 if username is not unique', async () => {
    const newUser1 = {
      username: 'testuser',
      name: 'Test User',
      password: 'password123'
    };
  
    await api
      .post('/api/users')
      .send(newUser1)
  
    const newUser2 = {
      username: 'testuser',
      name: 'Another Test User',
      password: 'anotherpassword'
    }
  
    await api
      .post('/api/users')
      .send(newUser2)
      .expect(400)
  
    const usersAtEnd = await User.find({})
    expect(usersAtEnd).toHaveLength(1)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    // 4.13 Blog list expansions, step1
    const blogsAtStart = await listHelper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await listHelper.blogsInDb()
    
    expect(blogsAtEnd).toHaveLength(
      listHelper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(n => n.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
})
describe('updating a blog post', () => {
  test('succeeds updating likes of blog',async () => {
    // 4.14 Blog list expansions, step2
    const blogsAtStart = await listHelper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const updatedLikes = blogToUpdate.likes + 1
    await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send({ likes: updatedLikes })
    .expect(200)
    .expect('Content-Type', /application\/json/)
    const updatedBlog = await Blog.findById(blogToUpdate.id)
    expect(updatedBlog.likes).toBe(updatedLikes)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
// 4.6/4.7/ 没写