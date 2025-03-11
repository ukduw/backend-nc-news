const { fetchTopics, checkArticleIdExists, fetchArticleById, fetchArticles, fetchCommentsByArticleId, insertCommentByArticleId, updateArticleById, deleteCommentById } = require("../models/nc-news.model")
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

    fetchArticleById(article_id).then((article) => {
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

    if(checkArticleIdExists(article_id)) {
        fetchCommentsByArticleId(article_id).then((comments) => {
            response.status(200).send({comments: comments})
        })
    } else {
        return Promise.reject({status: 404, msg: 'not found'})
    }

    // .catch((error) => {
    //     next(error)
    // })
}

function postCommentByArticleId(request, response, next) {
    const {article_id} = request.params
    const {author, body} = request.body

    insertCommentByArticleId(article_id, author, body).then((comment) => {
        response.status(201).send({comment: comment})
    })
    .catch((error) => {
        next(error)
    })
}

function patchArticleById(request, response, next) {
    const {article_id} = request.params
    const {inc_votes} = request.body

    updateArticleById(article_id, inc_votes).then((article) => {
        response.status(201).send({article: article})
    })
    .catch((error) => {
        next(error)
    })
}

function deletesCommentById(request, response, next) {
    const {comment_id} = request.params

    deleteCommentById(comment_id).then((comment) => {
        response.status(204).send({comment: comment})
    })
    .catch((error) => {
        console.log(error)
        next(error)
    })
}



module.exports = {getEndpoints, getTopics, getArticleById, getArticles, getCommentsByArticleId, postCommentByArticleId, patchArticleById, deletesCommentById}