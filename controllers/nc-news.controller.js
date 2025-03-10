const { fetchTopics, checkArticleIdExists, fetchArticleById } = require("../models/nc-news.model")
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



module.exports = {getEndpoints, getTopics, getArticleById}