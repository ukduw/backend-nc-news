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
        expect(body.articles).toHaveLength(5)
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
})