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
  test("200: responds with article object of requested id, with comment count", () => {
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
        expect(body.article.comment_count).toBe("2")
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
        expect(body.articles).toHaveLength(10)
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
        expect(body.articles).toHaveLength(10)
        expect(body.articles[0].article_id).toBe(13)
        expect(body.articles[9].article_id).toBe(4)
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
        expect(body.articles).toHaveLength(10)
        body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch")
        })
      })
  })
  test("200: (limit) responds with article objects with LIMIT, on query", () => {
    return request(app)
      .get("/api/articles?limit=7")
      .expect(200)
      .then(({body}) => {
        expect(body.articles).toHaveLength(7)
        body.articles.forEach((article) => {
          expect(article.total_count).toBe("13")
        })
      })
  })
  test("200: (p) responds with page of article objects, on query", () => {
    return request(app)
      .get("/api/articles?p=2")
      .expect(200)
      .then(({body}) => {
        expect(body.articles).toHaveLength(3)

        expect(body.articles[0].title).toBe("Does Mitch predate civilisation?")
        expect(body.articles[2].title).toBe("Z")
        body.articles.forEach((article) => {
          expect(article.total_count).toBe("13")
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
  test("400: (limit) responds bad request if requested a NaN limit", () => {
    return request(app)
        .get("/api/articles?limit=one")
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe('bad request')
      })
  })
  test("400: (p) responds bad request if requested a NaN page", () => {
    return request(app)
        .get("/api/articles?p=three")
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
  test("200: (limit) responds with comment objects with LIMIT, on query", () => {
    return request(app)
    .get("/api/articles/1/comments?limit=7")
    .expect(200)
    .then(({body}) => {
      expect(body.comments).toHaveLength(7)
    })
  })
  test("200: (p) responds with page of comment objects, on query", () => {
    return request(app)
      .get("/api/articles/1/comments?p=2")
      .expect(200)
      .then(({body}) => {
        expect(body.comments).toHaveLength(1)

        expect(body.comments[0].comment_id).toBe(18)
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
  test("400: (limit) responds bad request if requested a NaN limit", () => {
    return request(app)
        .get("/api/articles/3/comments?limit=one")
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe('bad request')
      })
  })
  test("400: (p) responds bad request if requested a NaN page", () => {
    return request(app)
        .get("/api/articles/3/comments?p=three")
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe('bad request')
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

describe("GET /api/users/:username", () => {
  test("200: responds with user object of requested username", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({body}) => {
          expect(body.user.username).toBe("butter_bridge")
          expect(body.user.avatar_url).toBe("https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg")
          expect(body.user.name).toBe("jonny")
      })
  })

  test("404: responds not found if no such username exists", () => {
    return request(app)
      .get("/api/users/testusername")
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toBe('not found')
    })
  })
})

describe("PATCH /api/comments/:comment_id", () => {
  test("201: responds with patched comment with requested comment id", () => {
    return request(app)
      .patch("/api/comments/3")
      .send({inc_votes: -50})
      .expect(201)
      .then(({body}) => {
        expect(body.comment.comment_id).toBe(3)
        expect(body.comment.article_id).toBe(1)
        expect(body.comment.body).toBe("Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.")
        expect(body.comment.votes).toBe(50)
        expect(body.comment.author).toBe("icellusedkars")
        expect(body.comment.created_at).toBe("2020-03-01T01:13:00.000Z")
      })
  })

  test("400: responds bad request if requested id is NaN", () => {
    return request(app)
      .patch("/api/comments/notanumber")
      .send({inc_votes: 10})
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('bad request')
    })
  })
  test("404: responds not found if id is a number, but no such id exists", () => {
    return request(app)
      .patch("/api/comments/999")
      .send({inc_votes: 10})
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toBe('not found')
    })
  })
  test("400: responds bad request if request is missing parameter(s)", () => {
    return request(app)
      .patch("/api/comments/3")
      .send({})
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('bad request')
      })
  })
  test("400: responds bad request if request contains incorrect parameter type", () => {
    return request(app)
      .patch("/api/comments/3")
      .send({inc_votes: "ten"})
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('bad request')
    })
  })
})

describe("POST /api/articles", () => {
  test("201: responds with posted article, with comment count", () => {
    return request(app)
      .post("/api/articles/")
      .send({author: "butter_bridge", title: "test-title", body: "test-body", topic: "cats"})
      .expect(201)
      .then(({body}) => {
        expect(body.article.article_id).toBe(14)
        expect(body.article.author).toBe("butter_bridge")
        expect(body.article.title).toBe("test-title")
        expect(body.article.body).toBe("test-body")
        expect(body.article.topic).toBe("cats")
        expect(body.article.votes).toBe(0)
        expect(body.article.article_img_url).toBe("")
        expect(typeof body.article.created_at).toBe("string")
        expect(body.article.comment_count).toBe("0")
      })
  })
  test("201: posts and ignores unnecessary properties in post object", () => {
    return request(app)
      .post("/api/articles/")
      .send({nothing: "test", testparam: "test", author: "butter_bridge", title: "test-title", body: "test-body", topic: "cats"})
      .expect(201)
      .then(({body}) => {
        expect(body.article.article_id).toBe(14)
        expect(body.article.author).toBe("butter_bridge")
        expect(body.article.title).toBe("test-title")
        expect(body.article.body).toBe("test-body")
        expect(body.article.topic).toBe("cats")
        expect(body.article.votes).toBe(0)
        expect(body.article.article_img_url).toBe("")
        expect(typeof body.article.created_at).toBe("string")
        expect(body.article.comment_count).toBe("0")
      })
  })

  test("400: responds bad request if request is missing parameter(s)", () => {
    return request(app)
      .post("/api/articles/")
      .send({author: "butter_bridge"})
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('bad request')
      })
  })
  test("400: responds bad request if request contains incorrect parameter type", () => {
    return request(app)
      .post("/api/articles/")
      .send({author: 123, title: 123, body: 123})
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('bad request')
    })
  })
})

describe.only("POST /api/topics", () => {
  test("201: responds with posted topic", () => {
    return request(app)
      .post("/api/topics/")
      .send({slug: "topic-name", description: "test-description"})
      .expect(201)
      .then(({body}) => {
        expect(body.topic.slug).toBe("topic-name")
        expect(body.topic.description).toBe("test-description")
        expect(body.topic.img_url).toBe("")
      })
  })
  test("201: posts and ignores unnecessary properties in post object", () => {
    return request(app)
      .post("/api/topics/")
      .send({testparam: "nothing", slug: "topic-name", description: "test-description", img_url: "test-url"})
      .expect(201)
      .then(({body}) => {
        expect(body.topic.slug).toBe("topic-name")
        expect(body.topic.description).toBe("test-description")
        expect(body.topic.img_url).toBe("test-url")
      })
  })

  test("400: responds bad request if request is missing parameter(s)", () => {
    return request(app)
      .post("/api/topics/")
      .send({slug: "topic-name"})
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('bad request')
      })
  })
  test("400: responds bad request if request contains incorrect parameter type", () => {
    return request(app)
      .post("/api/topics/")
      .send({slug: 123, description: 123, img_url: 123})
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('bad request')
    })
  })
})