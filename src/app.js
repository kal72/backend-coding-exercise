'use strict';

const logger = require('./config/logger');

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const rideService = require('./service/ride_service')

module.exports = (db) => {
    app.get('/health', async (req, res) => res.send('Healthy'));

    app.post('/rides', jsonParser, async (req, res) => {
        const startLatitude = Number(req.body.start_lat);
        const startLongitude = Number(req.body.start_long);
        const endLatitude = Number(req.body.end_lat);
        const endLongitude = Number(req.body.end_long);
        const riderName = req.body.rider_name;
        const driverName = req.body.driver_name;
        const driverVehicle = req.body.driver_vehicle;

        if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (typeof riderName !== 'string' || riderName.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        if (typeof driverName !== 'string' || driverName.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        try {
            var values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];
            const result = await rideService.storeRides(db, values)
            res.send(result);
        } catch (err) {
            logger.error(err.message);
            res.send({
                error_code: 'SERVER_ERROR',
                message: 'Unknown error'
            });
        }
    });

    app.get('/rides', async (req, res) => {
        const page = parseInt(req.query.page);
        const size = parseInt(req.query.size);

        if (page <= 0 || size <= 0){
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Page or size must be greater than 0'
            });
        }

        try {
            const result = await rideService.getRides(db, page, size);
            res.send(result);
        } catch (err) {
            logger.error(err.message);
            res.send({
                error_code: 'SERVER_ERROR',
                message: 'Unknown error'
            });
        }
    });

    app.get('/rides/:id', async (req, res) => {
        try {
            const result = await rideService.getRidesByID(db, req.params.id);
            res.send(result);
        } catch (err) {
            logger.error(err.message);
            res.send({
                error_code: 'SERVER_ERROR',
                message: 'Unknown error'
            });
        }
    });

    return app;
};
