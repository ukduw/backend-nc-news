const {response} = require("../app")
const db = require("../db/connection")
const {convertTimestampToDate, formatArticleID} = require("../db/seeds/utils")

function fetchTopics() {
    return db.query(`SELECT slug, description FROM topics`).then(({rows}) => {
        return rows
    })
}

function checkArticleIdExists(article_id) {
    let match = false
    return db.query(`SELECT articles.article_id, COUNT(comments.comment_id) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id GROUP BY articles.article_id`).then(({rows}) => {
        rows.forEach((obj) => {
            if(obj.article_id === Number(article_id)) {
                match = true
            }
        })
        if(match === false) {
            return Promise.reject({status: 404, msg: 'not found'})
        }
    })
}

function checkCommentIdExists(comment_id) {
    let match = false
    return db.query(`SELECT comment_id FROM comments`).then(({rows}) => {
        rows.forEach((obj) => {
            if(obj.comment_id === Number(comment_id)) {
                match = true
            }
        })
        if(match === false) {
            return Promise.reject({status: 404, msg: 'not found'})
        }
    })
}

function fetchArticleById(article_id) {
    return db.query(`SELECT articles.author, articles.title, articles.article_id, articles.body, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id`, [article_id])
    .then(({rows}) => {
        if(rows.length === 0) {
            return Promise.reject({status: 404, msg: 'not found'})
        }
        return rows[0]
    })
}

function fetchArticles(sort_by, order, topic) {
    let queryString = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id`
    let queryValues = []

    // GREENLIST TOPIC
    const allowedTopics = ["mitch", "cats", "paper"]
    if(topic !== undefined && !allowedTopics.includes(topic)) {
        return Promise.reject({status: 400, msg: "bad request"})
    }

    if(topic) {
        queryString += ` WHERE articles.topic = $1`
        queryValues.push(topic)
    }
    queryString += " GROUP BY articles.article_id"

    // GREENLIST SORT_BY
    const allowedColumns = ["article_id", "title", "topic", "author", "body", "created_at", "votes", "article_img_url"]
    if(sort_by !== undefined && !allowedColumns.includes(sort_by)) {
        return Promise.reject({status: 400, msg: "bad request"})
    }

    if(sort_by) {
        queryString += ` ORDER BY articles.${sort_by}`
    } else {
        queryString += " ORDER BY articles.created_at"
    }

    // GREENLIST ORDER
    const allowedOrders = ["asc", "desc"]
    if(order !== undefined && !allowedOrders.includes(order)) {
        return Promise.reject({status: 400, msg: "bad request"})
    }

    if(order === "asc") {
        queryString += " ASC"
    } else {
        queryString += " DESC"
    }


    return db.query(queryString, queryValues).then(({rows}) => {
        return rows
    })
}

function fetchCommentsByArticleId(article_id) {
    if(article_id === undefined || Number(article_id) === NaN) {
        return Promise.reject({status: 400, msg: 'bad request'})
    }

    return db.query(`SELECT comments.comment_id, comments.votes, comments.created_at, comments.author, comments.body, comments.article_id FROM comments JOIN articles ON comments.article_id = articles.article_id WHERE comments.article_id = $1`, [article_id]).then(({rows}) => {
        return rows
    })
}

function insertCommentByArticleId(article_id, author, body) {
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

function updateArticleById(article_id, inc_votes) {
    if(inc_votes === undefined || typeof inc_votes !== 'number') {
        return Promise.reject({status: 400, msg: 'bad request'})
    }

    return db.query(`UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *`, [inc_votes, article_id]).then(({rows}) => {
        if(rows.length === 0) {
            return Promise.reject({status: 404, msg: 'not found'})
        }
        return rows[0]
    })
}

function deleteCommentById(comment_id) {
    return db.query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *`, [comment_id]).then(({rows}) => {
        return rows[0]
    })
}

function fetchUsers() {
    return db.query(`SELECT * FROM users`).then(({rows}) => {
        return rows
    })
}


module.exports = {fetchTopics, checkArticleIdExists, checkCommentIdExists, fetchArticleById, fetchArticles, fetchCommentsByArticleId, insertCommentByArticleId, updateArticleById, deleteCommentById, fetchUsers}