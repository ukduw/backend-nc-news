const express = require("express")
const app = express()
const db = require("./db/connection")
const { getEndpoints, getTopics, getArticleById, getArticles, getCommentsByArticleId, postCommentByArticleId, patchArticleById, deletesCommentById, getUsers, getUserByUsername } = require("./controllers/nc-news.controller")
const { handlePsqlErrors, handleCustomErrors, handleServerErrors } = require("./controllers/errors.controller")
const apiRouter = require("./routes/api-router")

app.use(express.json())


app.use("/api", apiRouter)

// app.get("/api", getEndpoints)
// app.get("/api/topics", getTopics)
// app.get("/api/articles/:article_id", getArticleById)
// app.get("/api/articles", getArticles)
// app.get("/api/articles/:article_id/comments", getCommentsByArticleId)
// app.get("/api/users", getUsers)
// app.get("/api/users/:username", getUserByUsername)


// app.post("/api/articles/:article_id/comments", postCommentByArticleId)
// app.patch("/api/articles/:article_id", patchArticleById)
// app.delete("/api/comments/:comment_id", deletesCommentById)


app.use(handlePsqlErrors)
app.use(handleCustomErrors)
app.use(handleServerErrors)


module.exports = app