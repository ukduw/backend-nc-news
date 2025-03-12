const commentsRouter = require("express").Router()
const {deletesCommentById, patchCommentById} = require("../controllers/nc-news.controller")

commentsRouter.route("/:comment_id")
    .delete(deletesCommentById)
    .patch(patchCommentById)

module.exports = commentsRouter