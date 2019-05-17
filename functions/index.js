const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

//response.send({object})
// postman friendly
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

// Returns ID for badplats with highest meassured temperature.
exports.getHighestTempCall = functions.https.onCall((data, context) => {
    let ref = admin.firestore().collection('badlocations').where('feature.properties.KMN_NAMN', "==", "Stockholm");
    let temps = new Map();
    let useless = ref.get()
    .then(locations => {
        let maxTemp;
        let maxTempID;
        locations.forEach(document => {
            const { feature } = document.data();
            const { details } = document.data();
            const id = feature.id;
            const temp = details.sampleTemperature;

            if (temp) {
                temps[id] = temp;
                if (temp > maxTemp || !maxTemp) {
                    maxTemp = temp;
                    maxTempID = id;
                }
            }
        });
        return maxTempID;
    })
    .then(maxTempID => {
        // console.log('Maxtemp stuff: ' + maxTempID + ', ' + temps[maxTempID]);
        return { result: maxTempID };
    })
    .catch((error) => {
        console.log(error)
        return error;
    })
});

// Returns ID for badplats with highest meassured temperature.
exports.getHighestTempRequest = functions.https.onRequest((req, res) => {
    let ref = admin.firestore().collection('badlocations').where('feature.properties.KMN_NAMN', "==", "Stockholm");
    let temps = new Map();
    let useless = ref.get()
    .then(locations => {
        let maxTemp;
        let maxTempID;
        locations.forEach(document => {
            const { feature } = document.data();
            const { details } = document.data();
            const id = feature.id;
            const temp = details.sampleTemperature;

            if (temp) {
                temps[id] = temp;
                if (temp > maxTemp || !maxTemp) {
                    maxTemp = temp;
                    maxTempID = id;
                }
            }
        });
        return maxTempID;
    })
    .then(maxTempID => {
        // console.log('Maxtemp stuff: ' + maxTempID + ', ' + temps[maxTempID]);
        res.status(200).send(maxTempID);
        return maxTempID;
    })
    .catch((error) => {
        console.log(error)
        res.status(500).send(error)
    })
});

// Returns n closest badplatser.
exports.getClosestRequest = functions.https.onRequest((req, res) => { 
    
    if(!req.body.lat || !req.body.long) {
        res.sendStatus(400);
    }

    const lat = parseFloat(req.body.lat);
    const long = parseFloat(req.body.long);
    const maxDistance = parseFloat(req.body.distance);
    const n = parseFloat(req.body.n);

    let ref = admin.firestore().collection('badlocations').where('feature.properties.KMN_NAMN', "==", "Stockholm");

    let data = ref.get()
    .then(locations => {
        let features = []
        locations.forEach(document => {
            const { feature } = document.data()
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

            if (dist <= maxDistance) {
                let i = 0;
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

        // Slice down the results to fit request
        results = results.slice(0, n);

        ids = [];
        results.forEach(thing => {
            ids.push(thing.id);
        });

        res.status(200).send(ids);
        return results; // welp
    })
    .catch((error) => {
        console.log(error)
        res.status(500).send(error)
    })

})

// Returns n closest badplatser.
exports.getClosestCall = functions.https.onCall((data, context) => { 
    
    const lat = parseFloat(data.lat);
    const long = parseFloat(data.long);
    const maxDistance = parseFloat(data.distance);
    const n = parseFloat(data.n);
    console.log('Input: ' + lat + ', ' + long + ', ' + distance + ', ' + n);

    let ref = admin.firestore().collection('badlocations').where('feature.properties.KMN_NAMN', "==", "Stockholm");

    let useless = ref.get()
    .then(locations => {
        let features = []
        locations.forEach(document => {
            const { feature } = document.data()
            features.push(feature)
        });
        return features;
    })
    .then(features => {
        let result = [];
        let map = new Map();

        features.forEach(feature => {
            const id = feature.id;
            const tmpLong = parseFloat(feature.geometry.coordinates[0]);
            const tmpLat = parseFloat(feature.geometry.coordinates[1]);
            const dist = distance(lat, long, tmpLat, tmpLong);

            if (dist <= maxDistance) {
                let i = 0;
                for (; i < result.length; i++) {
                    let tmpName = result[i].properties.NAMN;
                    if (dist <= map[tmpName]) {
                        break;
                    }
                }
                console.log('splice on index ' + i);
                result.splice(i, 0, feature);
                map[feature.properties.NAMN] = dist;
            }    
        });

        // Slice down the result to fit request
        result = result.slice(0, n);

        ids = [];
        result.forEach(thing => {
            ids.push(thing.id);
        });
        // let o = {ids};
        // return o;
        return { result: result };
    })
    .catch((error) => {
        console.log(error)
        return error;
    })

})

exports.getWithinDistanceRequest = functions.https.onRequest((req, res) => {
    
    if(!req.body.lat || !req.body.long) {
        res.sendStatus(400);
    }
    
    let lat = parseFloat(req.body.lat);
    let long = parseFloat(req.body.long);
    let maxDistance = parseFloat(req.body.distance);
    
    let ref = admin.firestore().collection('badlocations').where('feature.properties.KMN_NAMN', "==", "Stockholm");

    let data = ref.get()
    .then(locations => {
        let features = []
        locations.forEach(document => {
            const { feature } = document.data()
            features.push(feature)
        });
        return features;
    })
    .then(features => {
        let result = [];
        let map = new Map();

        features.forEach(feature => {
            const id = feature.id;
            const tmpLong = parseFloat(feature.geometry.coordinates[0]);
            const tmpLat = parseFloat(feature.geometry.coordinates[1]);
            const dist = distance(lat, long, tmpLat, tmpLong);

            if (dist <= maxDistance) {
                let i = 0;
                for (; i < result.length; i++) {
                    let tmpName = result[i].properties.NAMN;
                    if (dist <= map[tmpName]) {
                        break;
                    }
                }
                console.log('splice on index ' + i);
                result.splice(i, 0, feature);
                map[feature.properties.NAMN] = dist;
            }    
        });

        ids = [];
        result.forEach(thing => {
            ids.push(thing.id);
        });

        res.status(200).send(ids);
        return ids; // welp
    })
    .catch((error) => {
        console.log(error)
        res.status(500).send(error)
    })
});

exports.getWithinDistanceCall = functions.https.onCall((data, context) => {

    
    let lat = parseFloat(data.lat);
    let long = parseFloat(data.long);
    let maxDistance = parseFloat(data.distance);
    
    let ref = admin.firestore().collection('badlocations').where('feature.properties.KMN_NAMN', "==", "Stockholm");

    let useless = ref.get()
    .then(locations => {
        let features = []
        locations.forEach(document => {
            const { feature } = document.data()
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

            if (dist <= maxDistance) {
                let i = 0;
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

        ids = [];
        results.forEach(thing => {
            ids.push(thing.id);
        });

        let o = { ids };
        return o;
    })
    .catch((error) => {
        console.log(error)
    })
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

// Returns array of relevant image URL's.
exports.getImagesRequest = functions.https.onRequest((req, res) => {
    let n = req.body.n || 3;
    let id = req.body.id;

    let ref = admin.firestore().collection('badimages').where('id', "==", id);

    let useless = ref.get()
    .then(document => {
        let info = [];
        document.forEach(col => {
            console.log('col: ' + col);
            const { information } = col.data();
            info.push(information);
        });
        return info[0]; // It should just be one value right now. TODO fix it wtf
    })
    .then(information => {
        images = information.images;
        console.log('images: ' + images);
        images = images.slice(0,n);
        res.status(200).send(images);
        return images; // welp
    })
    .catch((error) => {
        console.log(error)
        res.status(500).send(error)
    })
});

// Returns array of relevant image URL's.
exports.getImagesCall = functions.https.onCall((data, context) => {
    let n = data.n || 3;
    let id = data.id;

    let ref = admin.firestore().collection('badimages').where('id', "==", id);

    let useless = ref.get()
    .then(document => {
        let info = [];
        document.forEach(col => {
            console.log('col: ' + col);
            const { information } = col.data();
            info.push(information);
        });
        return info[0];
    })
    .then(information => {
        images = information.images;
        console.log('images: ' + images);
        images = images.slice(0,n);
        return {images : images };
    })
    .catch((error) => {
        console.log(error)
        res.status(500).send(error)
    })
});