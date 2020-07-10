'use strict';

const request = require('supertest');
const assert = require('assert');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/migration/schemas');
const buildAsync = require('../src/lib/dbasync');

const ride = {
    "start_lat": -10.8688,
    "start_long": 10.8688,
    "end_lat": 1.34003,
    "end_long": 3.900783,
    "rider_name": "test rider",
    "driver_name": "test driver",
    "driver_vehicle": "test vehicle"
};

describe('API tests', () => {
    before((done) => {
        db.serialize((err) => { 
            if (err) {
                return done(err);
            }

            buildSchemas(db);
            buildAsync(db)

            done();
        });
    });

    describe('GET /health', () => {
        it('should return health', (done) => {
            request(app)
                .get('/health')
                .expect('Content-Type', /text/)
                .expect(200, done);
        });
    });

    describe('POST /rides', () => {
        it('should has status code 200 with return valid data', (done) => {
            request(app)
                .post('/rides')
                .send(ride)
                .set('Content-Type', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);

                    var result = res.body[0];
                    assert.notEqual(result.rideID, 0);
                    assert.equal(result.startLat, ride.start_lat);
                    assert.equal(result.startLong, ride.start_long);
                    assert.equal(result.endLat, ride.end_lat);
                    assert.equal(result.endLong, ride.end_long);
                    assert.equal(result.driverName, ride.driver_name);
                    assert.equal(result.riderName, ride.rider_name);
                    assert.equal(result.driverVehicle, ride.driver_vehicle);
                    assert.ok(result.created);

                    done();
                });
        });

        it('should has response with error validation start latitude and longitude', (done) => {
            let rideReq = Object.create(ride);
            rideReq.start_lat = -91.12345
            rideReq.start_long = 181.12345

            request(app)
                .post('/rides')
                .send(rideReq)
                .set('Content-Type', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);

                    assert.equal(res.body.error_code, 'VALIDATION_ERROR');
                    assert.equal(res.body.message, 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively');

                    done()
                });
        });

        it('should has response with error validation end latitude and longitude', (done) => {
            let rideReq = Object.create(ride);
            rideReq.end_lat = -91.12345
            rideReq.end_long = 181.12345

            request(app)
                .post('/rides')
                .send(rideReq)
                .set('Content-Type', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);

                    assert.equal(res.body.error_code, 'VALIDATION_ERROR');
                    assert.equal(res.body.message, 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively');

                    done()
                });
        });

        it('should has response with error validation if ride_name is empty string', (done) => {
            let rideReq = Object.create(ride);
            rideReq.rider_name = ''

            request(app)
                .post('/rides')
                .send(rideReq)
                .set('Content-Type', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);

                    assert.equal(res.body.error_code, 'VALIDATION_ERROR');
                    assert.equal(res.body.message, 'Rider name must be a non empty string');

                    done()
                });
        });

        it('should has response with error validation if driver_name is empty string', (done) => {
            var rideReq = Object.create(ride)
            rideReq.driver_name = ''

            request(app)
                .post('/rides')
                .send(rideReq)
                .set('Content-Type', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);

                    assert.equal(res.body.error_code, 'VALIDATION_ERROR');
                    assert.equal(res.body.message, 'Rider name must be a non empty string');

                    done();
                });
        });

        it('should has response with error validation if driver_vehicle is empty string', (done) => {
            let rideReq = Object.create(ride);
            rideReq.driver_vehicle = ''

            request(app)
                .post('/rides')
                .send(rideReq)
                .set('Content-Type', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);

                    assert.equal(res.body.error_code, 'VALIDATION_ERROR');
                    assert.equal(res.body.message, 'Rider name must be a non empty string');

                    done();
                });
        });

        it('should has response with server error ', (done) => {
            let rideReq = {
                "rider_name": "test rider",
                "driver_name": "test driver",
                "driver_vehicle": "test vehicle"
            }

            request(app)
                .post('/rides')
                .send(rideReq)
                .set('Content-Type', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);

                    assert.equal(res.body.error_code, 'SERVER_ERROR');
                    assert.equal(res.body.message, 'Unknown error');

                    done()
                });
        });
    });

    describe('GET /rides', () => {
        var page = 1;
        var size = 10;

        it('should has status code 200 with rides is found', (done) => {
            request(app)
                .get('/rides')
                .query({page: page, size: size})
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);

                    assert.equal(res.body.page, page);
                    assert.equal(res.body.size, size);
                    assert.ok(res.body.results.length > 0)

                    done();
                });
        });

        it('should has response with error validation page or size less than 1', (done) => {
            page = -1;
            size = 0;

            request(app)
                .get('/rides')
                .query({page: page, size: size})
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);

                    assert.equal(res.body.error_code, 'VALIDATION_ERROR');
                    assert.equal(res.body.message, 'Page or size must be greater than 0');

                    done();
                });
        });

        it('should has response with rider is not found', (done) => {
            page = 5;
            size = 10;

            request(app)
                .get('/rides')
                .query({page: page, size: size})
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);

                    assert.equal(res.body.error_code, 'RIDES_NOT_FOUND_ERROR');
                    assert.equal(res.body.message, 'Could not find any rides');

                    done();
                });
        });
    });

    describe('GET /rides/:id', () => {
        it('should has status code 200 with rides is found', (done) => {
            request(app)
                .get('/rides/1')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);

                    assert.equal(res.body[0].rideID, 1);

                    done();
                })
        });

        it('should has status code 200 with rides is not found', (done) => {
            request(app)
                .get('/rides/0')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);

                    assert.equal(res.body.error_code, 'RIDES_NOT_FOUND_ERROR');
                    assert.equal(res.body.message, 'Could not find any rides');

                    done();
                })
        });

        it('should has response with server error', (done) => {
            request(app)
                .get('/rides/?')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);

                    assert.equal(res.body.error_code, 'SERVER_ERROR');
                    assert.equal(res.body.message, 'Unknown error');

                    done();
                })
        });
    });
});