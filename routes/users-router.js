const usersRouter = require("express").Router()
const {getUsers, getUserByUsername} = require("../controllers/nc-news.controller")

usersRouter.route("/")
    .get(getUsers)

usersRouter.route("/:username")
    .get(getUserByUsername)

module.exports = usersRouter