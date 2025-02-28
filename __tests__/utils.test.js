const {
  convertTimestampToDate,
  formatArticleID
} = require("../db/seeds/utils");

describe("convertTimestampToDate", () => {
  test("returns a new object", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result).not.toBe(input);
    expect(result).toBeObject();
  });
  test("converts a created_at property to a date", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result.created_at).toBeDate();
    expect(result.created_at).toEqual(new Date(timestamp));
  });
  test("does not mutate the input", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    convertTimestampToDate(input);
    const control = { created_at: timestamp };
    expect(input).toEqual(control);
  });
  test("ignores includes any other key-value-pairs in returned object", () => {
    const input = { created_at: 0, key1: true, key2: 1 };
    const result = convertTimestampToDate(input);
    expect(result.key1).toBe(true);
    expect(result.key2).toBe(1);
  });
  test("returns unchanged object if no created_at property", () => {
    const input = { key: "value" };
    const result = convertTimestampToDate(input);
    const expected = { key: "value" };
    expect(result).toEqual(expected);
  });
});


describe.only("formatArticleID", () => {
  test("returns new array", () => {
    const testComments = [{
      article_title: "They're not exactly dogs, are they?",
      body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
      votes: 16,
      author: "butter_bridge",
      created_at: 1586179020000,
    }]
    const testArticles = [{
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: 1594329060000,
      votes: 100,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    }]

    expect(formatArticleID(testComments, testArticles)).not.toBe(testComments)
    expect(formatArticleID(testComments, testArticles)).not.toBe(testArticles)
  })
  test("returns nested array, replacing each array's title with its corresponding article_id", () => {
    const testComments = [{
      article_title: "They're not exactly dogs, are they?",
      body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
      votes: 16,
      author: "butter_bridge",
      created_at: 1586179020000,
    }]
    const testArticles = [{
      title: "They're not exactly dogs, are they?",
      topic: "mitch",
      author: "butter_bridge",
      body: "Well? Think about it.",
      created_at: 1591438200000,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    }]
    const expectedOutput = [[
      1,
      "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
      16,
      "butter_bridge",
      1586179020000,
    ]]

    expect(formatArticleID(testComments, testArticles)).toEqual(expectedOutput)
  })
  test("does the above when passed multi-object arrays", () => {
    const testComments = [{
      article_title: "They're not exactly dogs, are they?",
      body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
      votes: 16,
      author: "butter_bridge",
      created_at: 1586179020000,
    },
    {
      article_title: "Living in the shadow of a great man",
      body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
      votes: 14,
      author: "butter_bridge",
      created_at: 1604113380000,
    },
    {
      article_title: "Living in the shadow of a great man",
      body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
      votes: 100,
      author: "icellusedkars",
      created_at: 1583025180000,
    }]
    const testArticles = [{
      title: "They're not exactly dogs, are they?",
      topic: "mitch",
      author: "butter_bridge",
      body: "Well? Think about it.",
      created_at: 1591438200000,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    },
    {
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: 1594329060000,
      votes: 100,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    },]
    const expectedOutput = [[
      1,
      "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
      16,
      "butter_bridge",
      1586179020000,
    ],
    [
      2,
      "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
      14,
      "butter_bridge",
      1604113380000,
    ],
    [
      2,
      "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
      100,
      "icellusedkars",
      1583025180000,
    ]]

    expect(formatArticleID(testComments, testArticles)).toEqual(expectedOutput)
  })
  test("does not mutate input arrays", () => {
    const testComments = [{
      article_title: "They're not exactly dogs, are they?",
      body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
      votes: 16,
      author: "butter_bridge",
      created_at: 1586179020000,
    }]
    const testArticles = [{
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: 1594329060000,
      votes: 100,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    }]
    const copyComments = testComments
    const copyArticles = testArticles

    formatArticleID(testComments, testArticles)

    expect(testComments).toEqual(copyComments)
    expect(testArticles).toEqual(copyArticles)
  })
})