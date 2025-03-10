const {response} = require("../app")
const db = require("../db/connection")
const {convertTimestampToDate, formatArticleID} = require("../db/seeds/utils")

function fetchTopics() {
    return db.query(`SELECT slug, description FROM topics`).then(({rows}) => {
        return rows
    })
}





module.exports = {fetchTopics}