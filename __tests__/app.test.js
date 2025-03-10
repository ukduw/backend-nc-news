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
        body.topics.forEach((topic) => {
          expect(typeof topic.slug).toBe("string")
          expect(typeof topic.description).toBe("string")
        })
      })
  })
})