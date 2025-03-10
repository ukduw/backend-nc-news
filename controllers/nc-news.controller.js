const { fetchTopics } = require("../models/nc-news.model")
const endpoints = require("../endpoints.json")

function getEndpoints(request, response) {
    response.status(200).send(endpoints)
}

function getTopics(request, response) {
    fetchTopics().then((topics) => {
        response.status(200).send({topics: topics})
    })
}




module.exports = {getEndpoints, getTopics}