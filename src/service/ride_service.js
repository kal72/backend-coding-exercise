'use strict';

exports.storeRides = async (db, values) => {
    const insertResult = await db.executeRun('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values);
    const result = await db.executeAll('SELECT * FROM Rides WHERE rideID = ?', insertResult.lastID);

    return result.rows;
}

exports.getRides = async (db, page, size) => {
    var offset = (page - 1) * size;
    var values = [size, offset];

    const result = await db.executeAll('SELECT * FROM Rides limit ? offset ?', values);

    if (result.rows.length === 0) {
        return {
            error_code: 'RIDES_NOT_FOUND_ERROR',
            message: 'Could not find any rides'
        };
    }

    const countResult = await db.executeAll('SELECT count(*) as count FROM Rides');

    var count = countResult.rows[0].count;
    var totalPage = Math.ceil(count / size);

    return {
        page: page,
        size: size,
        totalPage: totalPage,
        totalRows: count,
        results: result.rows
    };
}

exports.getRidesByID = async (db, ID) => {
    const result = await db.executeAll('SELECT * FROM Rides WHERE rideID=?', [ID]);

    if (result.rows.length === 0) {
        return {
            error_code: 'RIDES_NOT_FOUND_ERROR',
            message: 'Could not find any rides'
        }
    }

    return result.rows;
}

