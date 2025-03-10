const db = require("../connection")
const format = require("pg-format")
const { convertTimestampToDate, formatArticleID } = require("./utils")

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db.query("DROP TABLE IF EXISTS comments;")
  .then(()=>{return db.query("DROP TABLE IF EXISTS articles;")})
  .then(()=>{return db.query("DROP TABLE IF EXISTS users;")})
  .then(()=>{return db.query("DROP TABLE IF EXISTS topics;")})

  .then(()=>{return createTopics()})
  .then(()=>{return createUsers()})
  .then(()=>{return createArticles()})
  .then(()=>{return createComments()})

  .then(()=>{return insertTopics(topicData)})
  .then(()=>{return insertUsers(userData)})
  .then(()=>{return insertArticles(articleData)})
  .then(()=>{return insertComments(commentData, articleData)})
};


function createTopics() {
  return db.query("CREATE TABLE topics (slug VARCHAR(20) PRIMARY KEY, description VARCHAR(250), img_url VARCHAR(1000))")
  .then(() => {
    return db
  })
}

function createUsers() {
  return db.query("CREATE TABLE users (username VARCHAR(20) PRIMARY KEY, name VARCHAR(50), avatar_url VARCHAR(1000))")
  .then(() => {
    return db
  })
}

function createArticles() {
  return db.query("CREATE TABLE articles (article_id SERIAL PRIMARY KEY, title VARCHAR(250), topic VARCHAR(20) REFERENCES topics(slug), author VARCHAR(20) REFERENCES users(username), body TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, votes INT DEFAULT 0, article_img_url VARCHAR(1000))")
  .then(() => {
    return db
  })
}

function createComments() {
  return db.query("CREATE TABLE comments (comment_id SERIAL PRIMARY KEY, article_id INT REFERENCES articles(article_id), body TEXT, votes INT DEFAULT 0, author VARCHAR(20) REFERENCES users(username), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
  .then(() => {
    return db
  })
}


function insertTopics(topicData) {
  const formattedTopics = topicData.map((obj) => {
    return Object.values(obj)
  })
  const sqlString = format(`INSERT INTO topics (description, slug, img_url) VALUES %L`, formattedTopics)
  return db.query(sqlString)
}

function insertUsers(userData) {
  const formattedUsers = userData.map((obj) => {
    return Object.values(obj)
  })
  const sqlString = format(`INSERT INTO users (username, name, avatar_url) VALUES %L`, formattedUsers)
  return db.query(sqlString)
}

function insertArticles(articleData) {
  const jsTimestamp = articleData.map((obj) => {
    return convertTimestampToDate(obj)
  })
  const formattedArticles = jsTimestamp.map((obj) =>{
    return Object.values(obj)
  })
  const withVotes = formattedArticles.map((arr)=>{
    if(arr.length === 6) {
      arr.splice(5, 0, 0)
    }
    return arr
  })

  const sqlString = format(`INSERT INTO articles (created_at, title, topic, author, body, votes, article_img_url) VALUES %L`, withVotes)
  return db.query(sqlString)
}

function insertComments(commentData, articleData) {
  const jsTimestamp = commentData.map((obj) => {
    return convertTimestampToDate(obj)
  })
  const withArticleID = formatArticleID(jsTimestamp, articleData)

  const sqlString = format(`INSERT INTO comments (article_id, body, votes, author, created_at) VALUES %L`, withArticleID)
  return db.query(sqlString)
}


module.exports = seed;
