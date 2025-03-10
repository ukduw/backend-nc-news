const { fetchTopics, checkArticleIdExists, fetchArticleById, fetchArticles, fetchCommentsByArticleId, fetchPostedCommentByArticleId } = require("../models/nc-news.model")
const endpoints = require("../endpoints.json")

function getEndpoints(request, response) {
    response.status(200).send(endpoints)
}

function getTopics(request, response) {
    fetchTopics().then((topics) => {
        response.status(200).send({topics: topics})
    })
}

function getArticleById(request, response, next) {
    const {article_id} = request.params

    const promises = [fetchArticleById(article_id)]
    if(article_id) {
        promises.push(checkArticleIdExists(article_id))
    }

    Promise.all(promises).then(([article]) => {
        response.status(200).send({article: article})
    })
    .catch((error) => {
        next(error)
    })
}

function getArticles(request, response) {
    fetchArticles().then((articles) => {
        response.status(200).send({articles: articles})
    })
}

function getCommentsByArticleId(request, response, next) {
    const {article_id} = request.params

    fetchCommentsByArticleId(article_id).then((comments) => {
        response.status(200).send({comments: comments})
    })
    .catch((error) => {
        next(error)
    })
}

function PostCommentByArticleId(request, response, next) {
    const {article_id} = request.params
    const {author, body} = request.body

    fetchPostedCommentByArticleId(article_id, author, body).then((comment) => {
        response.status(201).send({comment: comment})
    })
    .catch((error) => {
        next(error)
    })
}



module.exports = {getEndpoints, getTopics, getArticleById, getArticles, getCommentsByArticleId, PostCommentByArticleId}