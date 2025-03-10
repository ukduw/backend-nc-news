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

function fetchArticles() {
    return db.query(`SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count FROM articles JOIN comments ON articles.article_id = comments.article_id GROUP BY articles.article_id ORDER BY articles.created_at DESC`).then(({rows}) => {
        return rows
    })
}

function fetchCommentsByArticleId(article_id) {
    return db.query(`SELECT comments.comment_id, comments.votes, comments.created_at, comments.author, comments.body, comments.article_id FROM comments JOIN articles ON comments.article_id = articles.article_id WHERE comments.article_id = $1`, [article_id]).then(({rows}) => {
        if(rows.length === 0) {
            return Promise.reject({status: 404, msg: 'not found'})
        }
        return rows
    })
}

function fetchPostedCommentByArticleId(article_id, author, body) {
    if(author === undefined || body === undefined) {
        return Promise.reject({status: 400, msg: 'bad request'})
    }
    if(typeof author !== 'string' || typeof body !== 'string') {
        return Promise.reject({status: 400, msg: 'bad request'})
    }

    return db.query(`INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *`, [author, body, article_id]).then(({rows}) => {
        if(rows.length === 0) {
            return Promise.reject({status: 404, msg: 'not found'})
        }
        return rows[0]
    })
}



module.exports = {fetchTopics, checkArticleIdExists, fetchArticleById, fetchArticles, fetchCommentsByArticleId, fetchPostedCommentByArticleId}