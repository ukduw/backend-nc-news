const topicsRouter = require("express").Router()
const {getTopics} = require("../controllers/nc-news.controller")

topicsRouter.route("/")
    .get(getTopics)

module.exports = topicsRouter