const topicsRouter = require("express").Router()
const {getTopics, postTopic} = require("../controllers/nc-news.controller")

topicsRouter.route("/")
    .get(getTopics)
    .post(postTopic)

module.exports = topicsRouter