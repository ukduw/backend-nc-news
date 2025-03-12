const commentsRouter = require("express").Router()
const {deletesCommentById} = require("../controllers/nc-news.controller")

commentsRouter.route("/:comment_id")
    .delete(deletesCommentById)

module.exports = commentsRouter