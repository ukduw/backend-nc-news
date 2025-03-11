const endpointsJson = require("../endpoints.json");
const db = require("../db/connection.js")
const seed = require("../db/seeds/seed.js")
const data = require("../db/data/test-data")
const request = require("supertest")
const app = require("../app.js")

beforeEach(() => {
  return seed(data)
})

afterAll(() => {
  return db.end
})

describe("GET /api", () => {
  test.skip("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: responds with an array of topic objects, with properties slug and description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({body}) => {
        expect(body.topics).toHaveLength(3)
        body.topics.forEach((topic) => {
          expect(typeof topic.slug).toBe("string")
          expect(typeof topic.description).toBe("string")
        })
      })
  })
})

describe("GET /api/articles/:article_id", () => {
  test("200: responds with article object of requested id", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then(({body}) => {
        expect(body.article.author).toBe("icellusedkars")
        expect(body.article.title).toBe("Eight pug gifs that remind me of mitch")
        expect(body.article.article_id).toBe(3)
        expect(body.article.body).toBe("some gifs")
        expect(body.article.topic).toBe("mitch")
        expect(body.article.created_at).toBe("2020-11-03T09:12:00.000Z")
        expect(body.article.votes).toBe(0)
        expect(body.article.article_img_url).toBe("https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700")
      })
  })
  test("400: responds bad request if requested id is NaN", () => {
    return request(app)
      .get("/api/articles/notanumber")
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('bad request')
      })
  })
  test("404: responds not found if id is a number, but no such id exists in the table", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toBe('not found')
      })
  })
})

describe("GET /api/articles", () => {
  test("200: responds with array of article objects with comment count, without body property, and sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({body}) => {
        expect(body.articles).toHaveLength(13)
        body.articles.forEach((article) => {
          expect(typeof article.author).toBe("string")
          expect(typeof article.title).toBe("string")
          expect(typeof article.article_id).toBe("number")
          expect(typeof article.topic).toBe("string")
          expect(typeof article.created_at).toBe("string")
          expect(typeof article.votes).toBe("number")
          expect(typeof article.article_img_url).toBe("string")
          expect(typeof article.comment_count).toBe("string")
        })
        const sortedByDESC = body.articles.toSorted((a, b) => {
          return b.created_at - a.created_at
        })
        expect(body.articles).toEqual(sortedByDESC)
      })
  })
  test("200: (sort_by) responds with article objects sorted by requested column, on query", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id")
      .expect(200)
      .then(({body}) => {
        expect(body.articles).toHaveLength(13)
        expect(body.articles[0].article_id).toBe(13)
        expect(body.articles[12].article_id).toBe(1)
      })
  })
  test("200: (order) responds with sorted article objects, ASC or DESC, on query", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({body}) => {
        // default sort by: created_at
        const sortedByASC = body.articles.toSorted((a, b) => {
          return a.created_at - b.created_at
        })
      expect(body.articles).toEqual(sortedByASC)
      })
  })
  test("200: (topic) responds with article objects, filtered by topic, on query", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({body}) => {
        expect(body.articles).toHaveLength(12)
        body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch")
        })
      })
  })
  test("400: (sort_by) responds bad request when queried with non-greenlisted column name", () => {
    return request(app)
      .get("/api/articles?sort_by=notacolumn")
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('bad request')
      })
  })
  test("400: (order) responds bad request when queried with non-greenlisted order", () => {
    return request(app)
      .get("/api/articles?order=fromhightolow")
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('bad request')
      })
  })
  test("400: (topic) responds bad request when queried with non-greenlisted topic name", () => {
    return request(app)
      .get("/api/articles?topic=slug")
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('bad request')
      })
  })
})

describe("GET /api/articles/:article_id/comments", () => {
  test("200: responds with array of comment objects of requested id", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then(({body}) => {
        expect(body.comments).toHaveLength(2)
        body.comments.forEach((comment) => {
          expect(typeof comment.comment_id).toBe("number")
          expect(typeof comment.votes).toBe("number")
          expect(typeof comment.created_at).toBe("string")
          expect(typeof comment.author).toBe("string")
          expect(typeof comment.body).toBe("string")
          expect(comment.article_id).toBe(3)
        })
      })
  })
  test("200: responds with empty array if id exists, but article has no associated comments", () => {
    return request(app)
      .get("/api/articles/10/comments")
      .expect(200)
      .then(({body}) => {
        expect(body.comments).toHaveLength(0)
      })
  })
  test("400: responds bad request if requested id is NaN", () => {
    return request(app)
      .get("/api/articles/notanumber/comments")
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('bad request')
      })
  })
  test("404: responds not found if id is a number, but no such id exists in the table", () => {
    return request(app)
      .get("/api/articles/9999/comments")
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toBe('not found')
      })
  })
})

describe("POST /api/articles/:article_id/comments", () => {
  test("201: responds with posted comment to requested article id", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({author: "butter_bridge", body: "test body test body"})
      .expect(201)
      .then(({body}) => {
        expect(body.comment.comment_id).toBe(19)
        expect(body.comment.article_id).toBe(3)
        expect(body.comment.body).toBe("test body test body")
        expect(body.comment.votes).toBe(0)
        expect(body.comment.author).toBe("butter_bridge")
        expect(typeof body.comment.created_at).toBe("string")
      })
  })
  test("201: posts and ignores unnecessary properties in post object", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({author: "butter_bridge", body: "test body", votes: 50, test: "test"})
      .expect(201)
      .then(({body}) => {
        expect(body.comment.comment_id).toBe(19)
        expect(body.comment.article_id).toBe(3)
        expect(body.comment.body).toBe("test body")
        expect(body.comment.votes).toBe(0)
        expect(body.comment.author).toBe("butter_bridge")
        expect(typeof body.comment.created_at).toBe("string")
      })
  })
  test("400: responds bad request if requested id is NaN", () => {
    return request(app)
      .post("/api/articles/notanumber/comments")
      .send({author: "butter_bridge", body: "test"})
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('bad request')
    })
  })
  test("404: responds not found if id is a number, but no such id exists", () => {
    return request(app)
      .post("/api/articles/999/comments")
      .send({author: "butter_bridge", body: "test"})
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toBe('not found')
    })
  })
  test("400: responds bad request if request is missing parameter(s)", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({author: "butter_bridge"})
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('bad request')
      })
  })
  test("400: responds bad request if request contains incorrect parameter type", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({author: 123, body: 123})
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('bad request')
    })
  })
  test("404: responds not found if request contains non-existent username", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({author: "test-name", body: "test-body"})
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toBe('not found')
      })
  })
})

describe("PATCH /api/articles/:article_id", () => {
  test("201: responds with patched article with requested article id", () => {
    return request(app)
      .patch("/api/articles/3")
      .send({inc_votes: -50})
      .expect(201)
      .then(({body}) => {
        expect(body.article.article_id).toBe(3)
        expect(body.article.title).toBe("Eight pug gifs that remind me of mitch")
        expect(body.article.topic).toBe("mitch")
        expect(body.article.author).toBe("icellusedkars")
        expect(body.article.body).toBe("some gifs")
        expect(body.article.created_at).toBe("2020-11-03T09:12:00.000Z")
        expect(body.article.votes).toBe(-50)
        expect(body.article.article_img_url).toBe("https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700")
      })
  })
  test("400: responds bad request if requested id is NaN", () => {
    return request(app)
      .patch("/api/articles/notanumber")
      .send({inc_votes: 10})
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('bad request')
    })
  })
  test("404: responds not found if id is a number, but no such id exists", () => {
    return request(app)
      .patch("/api/articles/999")
      .send({inc_votes: 10})
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toBe('not found')
    })
  })
  test("400: responds bad request if request is missing parameter(s)", () => {
    return request(app)
      .patch("/api/articles/3")
      .send({})
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('bad request')
      })
  })
  test("400: responds bad request if request contains incorrect parameter type", () => {
    return request(app)
      .patch("/api/articles/3")
      .send({inc_votes: "ten"})
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('bad request')
    })
  })
})

describe("DELETE /api/comments/:comment_id", () => {
  test("204: deletes comment and responds with no content", () => {
    return request(app)
      .delete("/api/comments/3")
      .expect(204)
      .then(({body}) => {
        expect(body).toEqual({})
      })
  })
  test("404: responds not found if id does not exist", () => {
    return request(app)
      .delete("/api/comments/999")
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toBe('not found')
    })
  })
})

describe("GET /api/users", () => {
  test("200: responds with array of all user objects", () => {
    return request(app)
    .get("/api/users")
    .expect(200)
    .then(({body}) => {
      expect(body.users).toHaveLength(4)
      body.users.forEach((user) => {
        expect(typeof user.username).toBe("string")
        expect(typeof user.name).toBe("string")
        expect(typeof user.avatar_url).toBe("string")
      })
    })
  })
})