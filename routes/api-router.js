const apiRouter = require("express").Router()
const {getEndpoints} = require("../controllers/nc-news.controller")
const topicsRouter = require("./topics-router")
const articlesRouter = require("./articles-router")
const usersRouter = require("./users-router")
const commentsRouter = require("./comments-router")

apiRouter.use("/topics", topicsRouter)
apiRouter.use("/articles", articlesRouter)
apiRouter.use("/users", usersRouter)
apiRouter.use("/comments", commentsRouter)


apiRouter.get("/", getEndpoints)

module.exports = apiRouter