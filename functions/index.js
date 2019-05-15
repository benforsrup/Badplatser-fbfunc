const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

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
    
    // if(!req.body.lat || !req.body.long) {
    //     res.sendStatus(400);
    // }
    
    let ref = admin.firestore().collection('badlocations').where('feature.properties.KMN_NAMN', "==", "Stockholm");
    
    let data = ref.get()
    .then(snapShot => {
        console.log('Got the documents.')
        let a = []
        snapShot.forEach(document => {
            const { feature } = document.data()
            const { name } = document.data()
            console.log('The name is ' + name)
            // console.log('Document feature: ' + feature)
            a.push(feature)
        });
        return a;   
    })
    .then(features => {
        const results = [];
        features.forEach(feature => {
            const id = feature.id;
            results.push(id);
            // console.log('feature.id = ' + id);
            // console.log('feature.geometry.coordinates = ' + feature.geometry.coordinates);
        })
        res.status(200).send("Here's a response! " + results);
        return results; // welp
    })
    .catch((error) => {
        console.log(error)
        res.status(500).send(error)
    })


    console.log('data is: ' + data);

    // console.log('content-type: ' + req.get('content-type'));
    let lat = parseFloat(req.body.lat);
    let long = parseFloat(req.body.long);

    let dist = distance(lat, long, 59.835229, 17.655732);
    // res.status(200).send("Here's a response! " + data);
    // TODO return sorted array with IDs
});

// Return distance between coordinates in km
function distance(lat1, long1, lat2, long2) {
    var radlat1 = Math.PI * lat1/180;
    var radlat2 = Math.PI * lat2/180;
    var theta = long1-long2;
    var radtheta = Math.PI * theta/180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344;

    return dist;
}  

