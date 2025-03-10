const db = require("./connection")

function allUsernames() {
    return db.query("SELECT username FROM users;").then(({rows})=>{
        console.log(rows)
        //db.end()
    })
}

function allCodingArticles() {
    return db.query("SELECT title FROM articles WHERE topic = 'coding'").then(({rows}) =>{
        console.log(rows)
        //db.end()
    })
}

function allNegativeVoteComments() {
    return db.query("SELECT body FROM comments WHERE votes < 0").then(({rows}) =>{
        console.log(rows)
        //db.end()
    })
}

function allTopics() {
    return db.query("SELECT DISTINCT topic FROM articles").then(({rows})=>{
        console.log(rows)
        //db.end()
    })
}

function grumpy19Articles() {
    return db.query("SELECT title FROM articles WHERE author = 'grumpy19'").then(({rows})=>{
        console.log(rows)
        //db.end()
    })
}

function commentsWith10PlusVotes() {
    return db.query("SELECT body FROM comments WHERE votes > 10").then(({rows})=>{
        console.log(rows)
        //db.end()
    })
}


allUsernames()
allCodingArticles()
allNegativeVoteComments()
allTopics()
grumpy19Articles()
commentsWith10PlusVotes()

