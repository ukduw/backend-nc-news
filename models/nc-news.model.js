const {response} = require("../app")
const db = require("../db/connection")
const {convertTimestampToDate, formatArticleID} = require("../db/seeds/utils")

function fetchTopics() {
    return db.query(`SELECT slug, description FROM topics`).then(({rows}) => {
        return rows
    })
}

function checkArticleIdExists(article_id) {
    if(typeof Number(article_id) === NaN) {
        return Promise.reject({status:400, msg: 'bad request'})
    }

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
    if(typeof Number(comment_id) === NaN) {
        return Promise.reject({status:400, msg: 'bad request'})
    }

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

function checkUsernameExists(username) {
    let match = false
    return db.query(`SELECT username FROM users`).then(({rows}) => {
        rows.forEach((obj) => {
            if(obj.username === username) {
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

function fetchArticles(sort_by, order, topic, limit, p) {
    let queryString = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count, (SELECT COUNT(articles.article_id) FROM articles) AS total_count FROM articles FULL JOIN comments ON articles.article_id = comments.article_id`
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

    // GREENLIST LIMIT
    if(limit !== undefined && Number(limit) === NaN) {
        return Promise.reject({status: 400, msg: 'bad request'})
    }
    if(limit) {
        queryString += ` LIMIT $1`
        queryValues.push(limit)
    } else {
        queryString += ` LIMIT 10`
    }

    // GREENLIST PAGE (OFFSET)
    if(p !== undefined && Number(p) === NaN) {
        return Promise.reject({status: 400, msg: 'bad request'})
    }
    const offsetBy = (p - 1) * 10

    if(p) {
        queryString += ` OFFSET $1`
        queryValues.push(offsetBy)
    } else {
        queryString += ` OFFSET 0`
    }


    return db.query(queryString, queryValues).then(({rows}) => {
        return rows
    })
}

function fetchCommentsByArticleId(article_id, limit, p) {
    let queryString = `SELECT comments.comment_id, comments.votes, comments.created_at, comments.author, comments.body, comments.article_id FROM comments JOIN articles ON comments.article_id = articles.article_id WHERE comments.article_id = $1`
    let queryValues = [article_id]

    if(limit !== undefined && Number(limit) === NaN) {
        return Promise.reject({status: 400, msg: 'bad request'})
    }
    if(p !== undefined && Number(p) === NaN) {
        return Promise.reject({status: 400, msg: 'bad request'})
    }

    if(limit) {
        queryString += ` LIMIT $2`
        queryValues.push(limit)
    } else {
        queryString += ` LIMIT 10`
    }

    const offsetBy = (p - 1) * 10
    if(p) {
        queryString += ` OFFSET $2`
        queryValues.push(offsetBy)
    } else {
        queryString += ` OFFSET 0`
    }


    return db.query(queryString, queryValues).then(({rows}) => {
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

function fetchUserByUsername(username) {
    return db.query(`SELECT * FROM users WHERE username = $1`, [username]).then(({rows}) => {
        return rows[0]
    })
}

function updateCommentById(comment_id, inc_votes) {
    if(inc_votes === undefined || typeof inc_votes !== 'number') {
        return Promise.reject({status: 400, msg: 'bad request'})
    }

    return db.query(`UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *`, [inc_votes, comment_id]).then(({rows}) => {
        if(rows.length === 0) {
            return Promise.reject({status: 404, msg: 'not found'})
        }
        return rows[0]
    })
}

function insertArticle(author, title, body, topic, article_img_url) {
    if(author === undefined || title === undefined || body === undefined || topic === undefined) {
        return Promise.reject({status: 400, msg: 'bad request'})
    }
    if(typeof author !== 'string' || typeof title !== 'string' || typeof body !== 'string' || typeof body !== 'string') {
        return Promise.reject({status: 400, msg: 'bad request'})
    }

    if(article_img_url && typeof article_img_url !== 'string') {
        return Promise.reject({status: 400, msg: 'bad request'})
    }
    if(article_img_url === undefined) {
        article_img_url = ""
    }

    let queryArticleId = 0
    return db.query(`INSERT INTO articles (author, title, body, topic, article_img_url) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [author, title, body, topic, article_img_url])
    .then(({rows}) => { queryArticleId = rows[0].article_id })
    .then(() => {
        return db.query(`SELECT articles.article_id, articles.author, articles.title, articles.body, articles.topic, articles.votes, articles.created_at, articles.article_img_url, COUNT(comments.comment_id) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id`, [queryArticleId]).then(({rows}) => {
            return rows[0]
        })
    })

}


module.exports = {fetchTopics, checkArticleIdExists, checkCommentIdExists, checkUsernameExists, fetchArticleById, fetchArticles, fetchCommentsByArticleId, insertCommentByArticleId, updateArticleById, deleteCommentById, fetchUsers, fetchUserByUsername, updateCommentById, insertArticle}