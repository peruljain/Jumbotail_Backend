const app = require("../src/app");
const Asset = require("../src/models/Asset");
const mongoose = require("mongoose");
const supertest = require("supertest");

const token =
  "Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InBlcnVsMzY1QGdtYWlsLmNvbSIsImlhdCI6MTYxNzA5NjE2MX0.5TuckzbPnBUjo6x_DpWBCIdT3TswvKptQE_YEk87i88";

describe("Auth Endpoints", () => {
  // All Auth Endpoints goes here

  describe("POST /auth/signup", () => {
    test("Create New User", async (done) => {
      const data = {
        name: "perul jain",
        email: "perul365@gmail.com",
        password: "12345",
      };

      const response = await supertest(app)
        .post("/auth/signup")
        .send(data)
        .set("Accept", "application/json");
      expect(response.statusCode).toBe(201);
      expect(response.body.data.name).toBe(data.name);
      expect(response.body.data.email).toBe(data.email);
      expect(response.body.data.token).not.toBe("");
      done();
    });

    test("Email invalid", async (done) => {
      const data = {
        name: "perul jain",
        email: "perul365@.com",
        password: "12345",
      };

      const response = await supertest(app)
        .post("/auth/signup")
        .send(data)
        .set("Accept", "application/json");
      expect(response.statusCode).toBe(422);
      expect(response.body.error).toBe("Email is Invalid");
      done();
    });


  });

  describe("GET /auth/signin", () => {
    test("Login", async (done) => {
      const name = "perul jain";
      const user = {
        email: "perul365@gmail.com",
        password: "12345",
      };
      const response = await supertest(app)
        .post("/auth/signin")
        .send(user)
        .set("Accept", "application/json");

      expect(response.statusCode).toBe(200);
      expect(response.body.data.name).toBe(name);
      expect(response.body.data.email).toBe(user.email);
      expect(response.body.data.token).not.toBe("");
      done();
    });

    test("Wrong Password", async (done) => {
      const user = {
        email: "perul365@gmail.com",
        password: "123456",
      };
      const response = await supertest(app)
        .post("/auth/signin")
        .send(user)
        .set("Accept", "application/json");

      expect(response.statusCode).toBe(401);
      expect(response.body.error.message).toBe("Wrong Password");
      done();
    });

    test("User Not Exist", async (done) => {
      const user = {
        email: "tazril365@gmail.com",
        password: "123456",
      };
      const response = await supertest(app)
        .post("/auth/signin")
        .send(user)
        .set("Accept", "application/json");

      expect(response.statusCode).toBe(401);
      expect(response.body.error.message).toBe("User not found");
      done();
    });

  });

  describe("PUT /auth/updatePassword", ()=>{
    test("Token missing", async (done) => {
      const user = {
        oldPassword: "12345",
        newPassword: "12345",
      };
      const response = await supertest(app)
        .put("/auth/updatePassword")
        .send(user);

      expect(response.statusCode).toBe(401);
      expect(response.body.error.message).toBe("Not Authorization header");
      done();
    });

    test("Invalid Token", async (done) => {
      const user = {
        oldPassword: "12345",
        newPassword: "12345",
      };
      const response = await supertest(app)
        .put("/auth/updatePassword")
        .send(user)
        .set("Authorization", "123");

      expect(response.statusCode).toBe(401);
      expect(response.body.error.message).toBe("Token missing");
      done();
    });

    test("Authorization Failed", async (done) => {
      const user = {
        oldPassword: "12345",
        newPassword: "12345",
      };
      const response = await supertest(app)
        .put("/auth/updatePassword")
        .send(user)
        .set("Authorization", "Token 123");

      expect(response.statusCode).toBe(401);
      expect(response.body.error.message).toBe("Authorization failed");
      done();
    });

    test("Update Password", async (done) => {
      const user = {
        oldPassword: "12345",
        newPassword: "12345",
      };
      const response = await supertest(app)
        .put("/auth/updatePassword")
        .send(user)
        .set("Authorization", token);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.success).toBe(true);
      done();
    });



  })

});




beforeAll((done) => {
  // DB init before all unit tests
  mongoose.connect(
    "mongodb+srv://chypsd:jumbotailtestgps5@cluster0.eoxco.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
    () => {
      mongoose.connection.db.dropDatabase();
      done();
    }
  );
});

afterAll((done) => {
  // DB close after all unit tests
  mongoose.connection.close();
  done();
});
