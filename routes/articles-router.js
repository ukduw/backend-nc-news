const articlesRouter = require("express").Router()
const { getArticleById, getArticles, getCommentsByArticleId, postCommentByArticleId, patchArticleById, postArticle } = require("../controllers/nc-news.controller")

articlesRouter.route("/")
    .get(getArticles)
    .post(postArticle)


articlesRouter.route("/:article_id")
    .get(getArticleById)
    .patch(patchArticleById)

    
articlesRouter.route("/:article_id/comments")
    .get(getCommentsByArticleId)
    .post(postCommentByArticleId)

module.exports = articlesRouter