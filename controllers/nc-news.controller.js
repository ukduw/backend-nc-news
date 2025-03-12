const { fetchTopics, checkArticleIdExists, checkCommentIdExists, checkUsernameExists, fetchArticleById, fetchArticles, fetchCommentsByArticleId, insertCommentByArticleId, updateArticleById, deleteCommentById, fetchUsers, fetchUserByUsername, updateCommentById } = require("../models/nc-news.model")
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

function getArticles(request, response, next) {
    const {sort_by, order, topic} = request.query

    fetchArticles(sort_by, order, topic).then((articles) => {
        response.status(200).send({articles: articles})
    })
    .catch((error) => {
        next(error)
    })
}

function getCommentsByArticleId(request, response, next) {
    const {article_id} = request.params

    const promises = [fetchCommentsByArticleId(article_id)]
    if(article_id) {
        promises.push(checkArticleIdExists(article_id))
    }

    Promise.all(promises).then(([comments]) => {
        response.status(200).send({comments: comments})
    })
    .catch((error) => {
        next(error)
    })
}

function postCommentByArticleId(request, response, next) {
    const {article_id} = request.params
    const {author, body} = request.body

    const promises = [insertCommentByArticleId(article_id, author, body)]
    if(article_id) {
        promises.push(checkArticleIdExists(article_id))
    }

    Promise.all(promises).then(([comment]) => {
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

    checkCommentIdExists(comment_id)
    .then(()=>{ deleteCommentById(comment_id).then(({comment}) => {
            response.status(204).send({comment: comment})
        }) 
    })
    .catch((error) => {
        next(error)
    })
}

function getUsers(request, response, next) {
    fetchUsers().then((users) => {
        response.status(200).send({users: users})
    })
    .catch((error) => {
        next(error)
    })
}

function getUserByUsername(request, response, next) {
    const {username} = request.params

    const promises = [fetchUserByUsername(username)]
    if(username) {
        promises.push(checkUsernameExists(username))
    }

    Promise.all(promises).then(([user]) => {
        response.status(200).send({user: user})
    })
    .catch((error) => {
        next(error)
    })
}

function patchCommentById(request, response, next) {
    const {comment_id} = request.params
    const {inc_votes} = request.body

    updateCommentById(comment_id, inc_votes).then((comment) => {
        response.status(201).send({comment: comment})
    })
    .catch((error) => {
        next(error)
    })
}


module.exports = { getEndpoints, getTopics, getArticleById, getArticles, getCommentsByArticleId, postCommentByArticleId, patchArticleById, deletesCommentById, getUsers, getUserByUsername, patchCommentById }