const app = require("../src/app");
const Asset = require("../src/models/Asset");
const mongoose = require("mongoose");
const supertest = require("supertest");

const token =
  "Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InBlcnVsMzY1QGdtYWlsLmNvbSIsImlhdCI6MTYxNzA5NjE2MX0.5TuckzbPnBUjo6x_DpWBCIdT3TswvKptQE_YEk87i88";

const data_asset = {
  name: "Black Beauty",
  desc: "Driven by Ashok, bought in 2014, used for carrying light weight goods",
  type: "truck",
  image_url:
    "https://i.pinimg.com/originals/7e/9a/4f/7e9a4ff12644542d8ac9e5156007d785.jpg",
  body: {
    modelNo: "Black Beauty XV",
    companyName: "Hyundai",
  },
  lat: 24.3,
  lon: 73.5,
};

const track_data = {
  timestamp: "2021-03-12T12:41:47.604+00:00",
  lat: 24.3,
  lon: 73.5,
};

let id;
let timestamp;

describe("Asset End points", () => {
  describe("POST /api/asset", () => {
    test("Create New Asset", async (done) => {
      const response = await supertest(app)
        .post("/api/asset")
        .send(data_asset)
        .set("Accept", "application/json");
      expect(response.statusCode).toBe(201);
      expect(response.body.data).not.toBe(null);
      done();
    });
  });

  describe("PATCH /api/asset/{id}", () => {
    test("Update Asset Location", async (done) => {
      const response = await supertest(app)
        .patch("/api/asset/" + id)
        .send(track_data)
        .set("Accept", "application/json");
      expect(response.statusCode).toBe(200);
      expect(response.body.data.success).toBe(true);
      done();
    });

    test("Update Asset Id Wrong", async (done) => {
      let temp_id = "6056186869f6f01ef4f3ed2d";
      const response = await supertest(app)
        .patch("/api/asset/" + temp_id)
        .send(track_data)
        .set("Accept", "application/json");
      expect(response.statusCode).toBe(422);
      expect(response.body.error.message).toBe("Asset not exist");
      done();
    });

    test("Lat Lon timestamp", async (done) => {
      let data = {
        lat: 24.3,
        lon: 73.5,
      };
      const response = await supertest(app)
        .patch("/api/asset/" + id)
        .send(data)
        .set("Accept", "application/json");
      expect(response.statusCode).toBe(422);
      expect(response.body.error.message).toBe(
        "Lat, lon and timestamp are required"
      );
      done();
    });
  });

  describe("GET /api/asset/list", () => {
    test("Get Asset List", async (done) => {
      const response = await supertest(app)
        .get("/api/asset/list")
        .set("Authorization", token)
        .expect(200);
      expect(Array.isArray(response.body.data)).toBeTruthy();
      done();
    });

    test("Asset Type List", async (done) => {
      let type = "truck"
      const response = await supertest(app)
        .get("/api/asset/list")
        .query({ type: type })
        .set("Authorization", token)
        .expect(200);
      expect(Array.isArray(response.body.data)).toBeTruthy();
      expect(response.body.data.forEach(element => {
          expect(element.type).toBe(type)
      }))
      done();
    });

    test("Asset Type Wrong", async (done) => {
      let type = "hello"
      const response = await supertest(app)
        .get("/api/asset/list")
        .query({ type: type })
        .set("Authorization", token)
        .expect(200);
      expect(response.body.error.message).toBe("Type is wrong")
      done();
    });

  });

  describe("GET /api/asset/track/id", () => {
    test("Get Asset", async (done) => {
      const response = await supertest(app)
        .get("/api/asset/track/"+id)
        .set("Authorization", token)
        .expect(200);
      expect(response.body.data).not.toBe(null)
      done();
    });

    test("Asset does not exist", async (done) => {
      let temp_id = "6056186869f6f01ef4f3ed2c";
      const response = await supertest(app)
        .get("/api/asset/track/"+temp_id)
        .set("Authorization", token)
        .expect(401);
      expect(response.body.error.message).toBe("Asset does not exist")
      done();
    });



  });

  describe("GET /api/asset/trackbytime/id", ()=> {

    test("Asset does not exist", async (done) => {
      let temp_id = "6056186869f6f01ef4f3ed2c";
      const response = await supertest(app)
        .get("/api/asset/trackbytime/"+temp_id)
        .set("Authorization", token)
        .expect(422);
      expect(response.body.error.message).toBe("Asset does not exist")
      done();
    });

    test("Start End Time required", async (done) => {
      const response = await supertest(app)
        .get("/api/asset/trackbytime/"+id)
        .set("Authorization", token)
        .expect(422);
      expect(response.body.error.message).toBe("start and end time required")
      done();
    });

    test("Get Asset between start and end", async (done) => {
      const response = await supertest(app)
        .get("/api/asset/trackbytime/"+id)
        .set("Authorization", token)
        .query({start: timestamp, end: timestamp})
        .expect(200);
      expect(response.body.data).not.toBe(null)
      done();
    });


  })

});


beforeAll(async (done) => {
  // DB init before all unit tests
  mongoose.connect(
    "mongodb+srv://chypsd:jumbotailtestgps5@cluster0.eoxco.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
    async () => {
      const response = await supertest(app)
        .post("/api/asset")
        .send(data_asset)
        .set("Accept", "application/json");
      id = response.body.data._id;
      timestamp = response.body.data.timestamp
      done();
    }
  );
});

afterAll(async (done) => {
  // DB close after all unit tests
  mongoose.connection.close();
  done();
});
