'use strict';

const assert = require('assert');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/migration/schemas');
const buildAsync = require('../src/lib/dbasync');

const rideService = require('../src/service/ride_service');

const ride = {
    "start_lat": -10.8688,
    "start_long": 10.8688,
    "end_lat": 1.34003,
    "end_long": 3.900783,
    "rider_name": "test rider",
    "driver_name": "test driver",
    "driver_vehicle": "test vehicle"
};

describe('Ride service tests', () => {
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

    describe('Func storeRides()', () => {
        it('should has inserted ride success', async () => {
            const values = [ride.start_lat, ride.start_long, ride.end_lat, ride.end_long, ride.rider_name, ride.driver_name, ride.driver_vehicle];
            const result = await rideService.storeRides(db, values);

            assert.ok(result.error_code === undefined)
            assert.equal(result[0].rideID, 1);
        });
    });

    describe('Func getRides()', () => {
        it('should has rides found', async () => {
            var page = 1;
            var size = 10;

            const result = await rideService.getRides(db, page, size);

            assert.ok(result.error_code === undefined);
            assert.equal(result.page, page);
            assert.equal(result.size, size);
            assert.ok(result.results.length > 0);
        });
    });

    describe('Func getRidesByID()', () => {
        it('should has rides found', async () => {
            var ID = 1;

            const result = await rideService.getRidesByID(db, ID);

            assert.ok(result.error_code === undefined);
            assert.equal(result[0].rideID, ID);
        });
    });
});