const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
// postman friendly
exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

//response.send({object})
exports.fetchTopRatedRequest = functions.https.onRequest((request, response) => {
    let o = {
        text: 'testing'
    }
    response.send(o);
});

//returnera object
exports.fetchTopRatedCall = functions.https.onCall((data, context) => {
    let o = {
        text: 'testing'
    }
    return o;
});

exports.getWithinDistanceRequest = functions.https.onRequest((req, res) => {
    if(!req.body.lat || !req.body.long) {
        res.sendStatus(400);
    }
    console.log('content-type: ' +req.get('content-type'));
    let lat = req.body.lat;
    let long = req.body.long; 
    res.status(200).send(`lat ${lat} and long ${long}`);
});