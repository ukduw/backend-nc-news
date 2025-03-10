const {response} = require("../app")
const db = require("../db/connection")
const {convertTimestampToDate, formatArticleID} = require("../db/seeds/utils")

function fetchTopics() {
    return db.query(`SELECT slug, description FROM topics`).then(({rows}) => {
        return rows
    })
}

function checkArticleIdExists(article_id) {
    return db.query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then(({rows}) => {
        if(rows.length === 0) {
            return Promise.reject({status:404, msg: 'not found'})
        }
    })
}

function fetchArticleById(article_id) {
    return db.query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then(({rows}) => {
        return rows[0]
    })
}





module.exports = {fetchTopics, checkArticleIdExists, fetchArticleById}