const app = require("../src/app");
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

const geo_fence_data = {
  geometry: {
    coordinates: [
      [
        [66.26953125, 16.214674588248542],
        [93.42773437499999, 16.214674588248542],
        [93.42773437499999, 28.38173504322308],
        [66.26953125, 16.214674588248542],
      ],
    ],
    type: "Polygon",
  },
  type: "Feature",
};

const geo_route_data = {
  geometry: {
    coordinates: [
      [77.255859375, 16.130262012034756],
      [77.255859375, 28.304380682962783],
    ],
    type: "LineString",
  },
  type: "Feature",
};

let id;

describe("Geo End points", () => {
  describe("PUT /api/asset/geofence/id", () => {
    test("Asset does not exist", async (done) => {
      let temp_id = "6056186869f6f01ef4f3ed2c";
      const response = await supertest(app)
        .put("/api/asset/geofence/" + temp_id)
        .send(geo_fence_data)
        .set("Authorization", token)
        .expect(422);
      expect(response.body.error.message).toBe("Asset does not exist");
      done();
    });

    test("Empty body", async (done) => {
      const response = await supertest(app)
        .put("/api/asset/geofence/" + id)
        .send({})
        .set("Authorization", token)
        .expect(422);
      expect(response.body.error.message).toBe("body is required");
      done();
    });

    test("Update Geofence", async (done) => {
      const response = await supertest(app)
        .put("/api/asset/geofence/" + id)
        .send(geo_fence_data)
        .set("Authorization", token)
        .expect(200);
      expect(response.body.data.success).toBe(true);
      done();
    });
  });

  describe("PUT /api/asset/georoute/id", () => {
    test("Asset does not exist", async (done) => {
      let temp_id = "6056186869f6f01ef4f3ed2c";
      const response = await supertest(app)
        .put("/api/asset/georoute/" + temp_id)
        .send(geo_route_data)
        .set("Authorization", token)
        .expect(422);
      expect(response.body.error.message).toBe("Asset does not exist");
      done();
    });

    test("Empty body", async (done) => {
      const response = await supertest(app)
        .put("/api/asset/georoute/" + id)
        .send({})
        .set("Authorization", token)
        .expect(422);
      expect(response.body.error.message).toBe("body is required");
      done();
    });

    test("Update Georoute", async (done) => {
      const response = await supertest(app)
        .put("/api/asset/georoute/" + id)
        .send(geo_route_data)
        .set("Authorization", token)
        .expect(200);
      expect(response.body.data.success).toBe(true);
      done();
    });
  });

  describe("GET /api/asset/getgeoroute/id", () => {
    test("Id does not exist", async (done) => {
      let temp_id = "6056186869f6f01ef4f3ed2c";
      const response = await supertest(app)
        .get("/api/asset/getgeoroute/" + temp_id)
        .set("Authorization", token)
        .expect(422);
      expect(response.body.error.message).toBe("Georoute Id does not exist");
      done();
    });

    test("Get Georoute", async (done) => {
      const response = await supertest(app)
        .get("/api/asset/getgeoroute/" + id)
        .set("Authorization", token)
        .expect(200)
     
      expect(response.body.data).not.toBe(null);
      done();
    });
  });

  describe("GET /api/asset/getgeofence/id", () => {
    test("Id does not exist", async (done) => {
      let temp_id = "6056186869f6f01ef4f3ed2c";
      const response = await supertest(app)
        .get("/api/asset/getgeofence/" + temp_id)
        .set("Authorization", token)
        .expect(422);
      expect(response.body.error.message).toBe("Geofence Id does not exist");
      done();
    });

    test("Get Geofence", async (done) => {
      const response = await supertest(app)
        .get("/api/asset/getgeofence/" + id)
        .set("Authorization", token)
        .expect(200)
     
      expect(response.body.data).not.toBe(null);
      done();
    });
  });

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
      done();
    }
  );
});

afterAll(async (done) => {
  // DB close after all unit tests
  mongoose.connection.close();
  done();
});
