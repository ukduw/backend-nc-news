const express = require("express")
const app = express()
const db = require("./db/connection")
const { getEndpoints, getTopics } = require("./controllers/nc-news.controller")
const { handlePsqlErrors, handleCustomErrors, handleServerErrors } = require("./controllers/errors.controller")

app.use(express.json())


app.get("/api", getEndpoints)
app.get("/api/topics", getTopics)
// app.get("/api/articles/:article_id", getArticleById) (+COMMENT COUNT)
// app.get("/api/articles", getArticles) (+SORT QUERY)
// app.get("/api/articles/:article_id/comments", getCommentsByArticleId)
// app.get("/api/users", getUsers)


// app.post("/api/articles/:article_id/comments", postCommentByArticleId)
// app.patch("/api/articles/:article_id", patchArticleById)
// app.delete("/api/comments/:comment_id", deleteCommentById)


app.use(handlePsqlErrors)
app.use(handleCustomErrors)
app.use(handleServerErrors)


module.exports = app