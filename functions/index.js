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

exports.getWithinDistanceRequest = functions.https.onRequest((request, response) => {
    let a = 1;
    let b = a + a;
    console.log(request.body);
    response.send('All places withing distance, AND: ' + request.body);

   });