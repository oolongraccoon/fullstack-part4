const dummy = (blogs) => {
    return 1
  }
  

const totalLikes = (blogs) =>{
    const likes = blogs.reduce(function(sum, blog){
         
        return sum + blog.likes
    },0)
    return likes  
}
const favoriteBlog = (blogs) =>{
    let maxLikes = -1
    for (const blog of blogs) {
        if (blog.likes > maxLikes) {
          maxLikes = blog.likes
          favorite = {
            title: blog.title,
            author: blog.author,
            likes: blog.likes
          }
        }
    }

    return blogs.length === 0
        ? null
        : favorite        
}
module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
  }