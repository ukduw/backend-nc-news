const db = require("../../db/connection");

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};


exports.formatArticleID = (commentData, articleData) => {
  const articleDataLookup = {}
  
  for(let i=0; i<articleData.length; i++) {
    articleDataLookup[articleData[i].title] = i + 1
  }

  const idFormatCommentData = commentData.map((obj) => {
    const commentCopy = {...obj}

    commentCopy.article_id = articleDataLookup[commentCopy.article_title]
    delete commentCopy.article_title

    return [ commentCopy.article_id, commentCopy.body, commentCopy.votes, commentCopy.author, commentCopy.created_at ]
  })

  return idFormatCommentData
}

