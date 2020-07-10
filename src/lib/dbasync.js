'use strict';

module.exports = (db) => {
    db.executeRun = (sql, params) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err){
                    reject(err);
                } else {
                    resolve({lastID: this.lastID});
                }
            });
        });
    };

    db.executeAll = (sql, params) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, function (err, rows) {
                if (err){
                    reject(err);
                } else {
                    resolve({rows: rows});
                }
            });
        });
    };
}