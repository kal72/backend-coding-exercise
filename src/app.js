'use strict';

const logger = require('./config/logger');

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

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

            const insertResult = await db.executeRun('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values);
            const result = await db.executeAll('SELECT * FROM Rides WHERE rideID = ?', insertResult.lastID);

            res.send(result.rows);
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

        var offset = (page-1) * size;
        var values = [size, offset];

        try {
            const result = await db.executeAll('SELECT * FROM Rides limit ? offset ?',values);

            if (result.rows.length === 0) {
                return res.send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }

            const countResult = await db.executeAll('SELECT count(*) as count FROM Rides');

            var count = countResult.rows[0].count;
            var totalPage = Math.ceil(count/size);

            res.send({
                page: page,
                size: size,
                totalPage: totalPage,
                totalRows: count,
                results: result.rows
            });
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
            const result = await db.executeAll(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`);

            if (result.rows.length === 0) {
                return res.send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }

            res.send(result.rows);
        }catch (err) {
            logger.error(err.message);
            res.send({
                error_code: 'SERVER_ERROR',
                message: 'Unknown error'
            });
        }
    });

    return app;
};
