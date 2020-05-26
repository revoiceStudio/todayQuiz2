require('dotenv').config();
const express = require('express');
const router = require('./routes/router')
const app = express();
app.use(express.json());

app.get('/revoice/health', (req, res) => {
    console.log(`helath request : ${req.headers}`);
    return res.status(200).send('OK');
});

app.use('/revoice', (req, res, next) => {
    try {
        checkAuthorization(req)
        next();
    } catch (err) {
        next(err);
    }
});

app.use('/revoice', router);

app.use(function (err, req, res, next) {
    console.error(err.message)
    res.status(err.status).send(err.message);
});

app.listen((process.env.PORT), () => {
    console.log(`todayQuiz app listening on port ${process.env.PORT}`);
});

function checkAuthorization(req) {
    if (req.headers.authorization) {
        if (req.headers.authorization.split(' ')[1] != process.env.APIKEY) {
            const error = new Error('authorization failed');
            error.status = 401;
            return error;
        } else {
            console.log('authorization success');
            return;
        }
    } else {
        const error = new Error('not found');
        error.status = 404;
        return error;
    }
}