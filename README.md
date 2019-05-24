# Badplatser Cloud functions
This is a part of project [Badplatser](https://github.com/benforsrup/WebMobileProject) containing Firebase Cloud functions for the project.


## Requirements
Before you get started make sure to install [npm](https://www.npmjs.com/get-npm
) and the [Firebase CLI](https://firebase.google.com/docs/cli) as it's used to deploy the functions.

You will also need to be a member of the Firebase project and have appropriate permissions. This can be granted by other members through the Firebase web console.


## Get started
Start off by cloning the repo and signing in to your Google account connected to the project through the Firebase CLI.
```shell
$ git clone https://github.com/benforsrup/Badplatser-fbfunc.git
$ cd Badplatser-fbfunc
$ firebase login
```
Once this is done you will be able to easily deploy any new functionality directly to the Firebase project.
```shell
$ firebase deploy
```

## More info
All functions are currenly written in JavaScript and gathered in the index file found in the functions directory. To make a function publicly available it needs to be exported. Request URL and logs can be found in the Firebase console under section " [...] Functions".


## Making a request
The functions supporting HTTP POST request take indata in JSON format attached to the body. It should include the necessary parameters for the request. Follwing is an overview of the functions and parameters that should be included.

-  `getClosestRequest`
returns a list of n closest bathing locations sorted in ascending order based on distance from base point. Input data: 
- lat      -       latitude of base point for the query.
- long     -       longitude of base point for the query.
- n        -       max number of results to return.
- maxDistance  -   Specifies a max distance for the query in kilometers. Limits query distance by ignoring all results outside the range.

-  `getWithinDistanceRequest`
returns a list of all bathing locations within specified distance, sorted in ascending order based on distance from base point. Input data: 
- lat         -     latitude of base point for the query.
- long         -    longitude of base point for the query.
- maxDistance   -   Specifies a distance for the query in kilometers. Limits query distance by ignoring all results outside the range.


- `getHighestTempCall`
returns id for bathing location with the highest meassured water temperature. NOTE: Many places in the Stockholm area could be missing up-to-date values for water temperature.


- `getImagesRequest`
returns up to n number of image URL:s from specified bathing location. If the requested number of images exceed the available number, all available will be returned. Input data:
- bathing   -    location ID
- n         -    number of images returned
