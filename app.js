const express = require("express")
const app = express()
const db = require("./db/connection")
const { handlePsqlErrors, handleCustomErrors, handleServerErrors } = require("./controllers/errors.controller")
const apiRouter = require("./routes/api-router")

app.use(express.json())


app.use("/api", apiRouter)


app.use(handlePsqlErrors)
app.use(handleCustomErrors)
app.use(handleServerErrors)


module.exports = app