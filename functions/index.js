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
    
    if(!req.body.lat || !req.body.long) {
        res.sendStatus(400);
    }
    
    // console.log('content-type: ' + req.get('content-type'));
    let lat = parseFloat(req.body.lat);
    let long = parseFloat(req.body.long);
    let maxDistance = parseFloat(req.body.distance);
    
    let ref = admin.firestore().collection('badlocations').where('feature.properties.KMN_NAMN', "==", "Stockholm");

    let data = ref.get()
    .then(locations => {
        // console.log('Got the documents.')
        let features = []
        locations.forEach(document => {
            const { feature } = document.data()
            // console.log('The name is ' + feature.properties.NAMN)
            // console.log('Document feature: ' + feature)
            features.push(feature)
        });
        return features;
    })
    .then(features => {
        let results = [];
        let map = new Map();

        features.forEach(feature => {
            const id = feature.id;
            const tmpLong = parseFloat(feature.geometry.coordinates[0]);
            const tmpLat = parseFloat(feature.geometry.coordinates[1]);
            const dist = distance(lat, long, tmpLat, tmpLong);
            // console.log('Distance to ' + feature.properties.NAMN + 'is ' + dist + 'km');
            // result.push(dist);

            if (dist <= maxDistance) {
                let i = 0;
                // console.log(dist + 'km to ' + feature.properties.NAMN);
                for (; i < results.length; i++) {
                    let tmpName = results[i].properties.NAMN;
                    if (dist <= map[tmpName]) {
                        break;
                    }
                }
                console.log('splice on index ' + i);
                results.splice(i, 0, feature);
                map[feature.properties.NAMN] = dist;
            }    
        });

        // For testing purposes. TODO remove it.
        names = [];
        results.forEach(thing => {
            names.push(thing.properties.NAMN);
        });

        res.status(200).send('These places are within the given distance: ' + names);
        return results; // welp
    })
    .catch((error) => {
        console.log(error)
        res.status(500).send(error)
    })

    // TODO return sorted array with IDs. Closest place first.

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

