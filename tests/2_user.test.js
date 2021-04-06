const app = require("../src/app");
const Asset = require("../src/models/Asset");
const mongoose = require("mongoose");
const supertest = require("supertest");

const token =
  "Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InBlcnVsMzY1QGdtYWlsLmNvbSIsImlhdCI6MTYxNzA5NjE2MX0.5TuckzbPnBUjo6x_DpWBCIdT3TswvKptQE_YEk87i88";

describe("User Endpoints", () => {
  describe("GET /user/getuser", () => {
    test("Get User Data", async (done) => {
      const response = await supertest(app)
        .get("/user/getuser")
        .set("Authorization", token);

      expect(response.statusCode).toBe(200);
      expect(response.body.data).not.toBe(null);
      done();
    });

    test("Authorization Failed", async (done) => {
      const response = await supertest(app)
        .get("/user/getuser")
        .set("Authorization", "Token 123");

      expect(response.statusCode).toBe(401);
      expect(response.body.error.message).toBe("Authorization failed");
      done();
    });
  });
});

beforeAll((done) => {
  // DB init before all unit tests
  mongoose.connect(
    "mongodb+srv://chypsd:jumbotailtestgps5@cluster0.eoxco.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
    () => {
      done();
    }
  );
});

afterAll((done) => {
  // DB close after all unit tests
  mongoose.connection.close();
  done();
});
