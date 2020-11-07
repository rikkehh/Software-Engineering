import supertest from "supertest";
import { app } from "../server";
import { dbSpots, dbTest } from "../db/index.js";

// Hidden spot ?
const location = {
  "9e94b15ed312fa42232fd87a55db0d39": {
    ownerId: "c81e728d9d4c2f636f067f89cc14862c",
    address: "Batmans Cave",
    zipcode: "72000",
    hour_price: "75",
    day_price: "532",
    spots: "1"
  }
};

const toUrlEncoded = (obj) =>
  Object.keys(obj)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]))
    .join("&");

describe("GET /spots", () => {
  it("Should respond with JSON of parking spots", async () => {
    const response = await supertest(app)
      .get(`/spots`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body).toEqual(dbSpots.get());
  });
});

describe("GET /spots/<id>", () => {
  it("Should respond with parkingspot", async () => {
    // UDI = first
    const id = "c4ca4238a0b923820dcc509a6f75849b";

    const response = await supertest(app)
      .get(`/spots/${id}`)
      .expect("Content-Type", /json/)
      .expect(200);
    expect(response.body).toEqual(dbSpots.get(id));
  });

  it("Should respond with 204 if spot not in database", async () => {
    const id = "89320e2752aa13db5dbc61060d897af0";
    await supertest(app).get(`/spots/${id}`).expect(204);
  });
});

describe("POST /spots", () => {
  it("Should create a parkingspot, and add to database", async () => {

    const dummySpot = Object.values(location)[0];

    const response = await supertest(app)
      .post(`/spots`)
      .send(toUrlEncoded(dummySpot))
      .expect("Content-Type", /json/)
      .expect(201);

    const newParkingSpotId = response.body.id;
    expect(dbSpots.get(newParkingSpotId)).toEqual(
      expect.objectContaining(dummySpot)
    );

    // Cleanup - remove parkingspot
    dbSpots.delete(newParkingSpotId);
    // Verify cleanup
    expect(dbSpots.get(newParkingSpotId)).toBeUndefined();
  });
});

describe("DELETE /spots/<id>", () => {
  it("Should remove spot from database", async () => {
    const dummySpot = Object.entries(location);
    const spotId = dummySpot[0][0];
    const spotData = dummySpot[0][1];

    // Add spot directly to db
    dbTest.spots.set(spotId, spotData);

    const response = await supertest(app)
      .delete(`/spots/${spotId}`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body.message).toEqual(
      `Plass med id ${spotId} ble fjernet fra databasen.`
    );
    expect(dbSpots.get(spotId)).toBeUndefined();
  });

  it("Should return 404 and error message if userid not in database", async () => {
    const spotId = Object.keys(location);

    expect(dbSpots.get(spotId)).toBeUndefined();

    const response = await supertest(app)
      .delete(`/spots/${spotId}`)
      .expect("Content-Type", /json/)
      .expect(404);

    expect(response.body.message).toEqual(
      `Plass med id ${spotId} finnes ikke i databasen.`
    );
  });
});

describe("GET /spots/location/<zipcode>", () => {
  it("Should respond with parkingspot filterd by zipcode", async () => {
    const zipcode = "Oslo";

    const respond = await supertest(app)
      .get(`/spots/location/${zipcode}`)
      .expect("Content-Type", /json/)
      .expect(200);

    const recivedArrayContaining = respond.body.every(
      (item) => item[1].zipcode === zipcode
    );

    expect(recivedArrayContaining).toBe(true);
  });
});
