;
(function() {
  'use strict';
  angular.module('app.routeInput', [])
    .controller('RouteInputController', ['$location', '$q', 'RouteService', function($location, $q, RouteService) {
      var vm = this;
      vm.map = RouteService.map;
      var polyline;
 
      var queryResult;
      vm.autocompleteQuery = function(searchText) {
        console.log('address:', searchText);
        var defer = $q.defer();
        RouteService.geocoding(searchText)
          .then(function successCb(res) {
            console.log('res', res.data.features);
            queryResult = res.data.features;
            defer.resolve(queryResult);
          }, function errorCb(res) {
            console.error("failed to rectrieve coordinates from mapbox...", res);
          });
        
        return defer.promise;
      };

     vm.submitRoute = function() {

        var prevPoint, nextPoint, incrementDist = 5;
        var start = vm.selectedStart.center;
        var end = vm.selectedEnd.center;
        var prefs = '';
        console.log("start", vm.selectedStart, "end", vm.selectedEnd);

        vm.route = [];
        RouteService.postRouteRequest(start, end, prefs)
          .then(function successCb(res) {
            console.log('result', res);

            RouteService.cleanMap(polyline !== "undefined", vm.map);
            var coords = res.data[0];
            var elevation = res.data[1];
            console.log(elevation, coords);
            // path as array of long/lat tuple
            var path = RouteService.getPath(coords);
            // re-format elevation data with turf points
            var elevationCollection = RouteService.getElevationPath(elevation);
            // turf linestring
            var turfLine = turf.linestring(path);
            // turf collection with elevation data
            var turfElevation = turf.featurecollection(elevationCollection);
            console.log('geo JSON data---->', JSON.stringify(elevationCollection));
            // draw route on the map and fit the bounds of the map viewport to the route
            polyline = L.geoJson(turfLine, {color : 'red'}).addTo(vm.map);
            vm.map.fitBounds(polyline.getBounds());

            // draw elevation points
            // L.geoJson(turfLine, {
            //   pointToLayer: function(feature, latlng) {
            //     var myIcon = L.divIcon({
            //       className: 'markerline',
            //       html: '<div class="elevmarker"><div class="markercircle bottomcap"></div><div class="markerline" style="height:' + feature.properties.elevation * 20 + 'px">' + '</div><div class="markercircle"></div><div class="elevfigure"><strong>' + (feature.properties.elevation * 3.28).toFixed(0) + ' ft </strong><span style="font-size:0.9em"></span></div>'
            //     });
            //     return L.marker(latlng, {
            //       icon: myIcon
            //     });
            //   }
            // }).addTo(vm.map);

//##########################################################

    // var resample = function(line, interval, unit) {
    //   var features = [];
    //   var interval = interval;
    //   features.push(line);
    //   //with hard coded interval values, 42 is the amount we can fit in the current path--fix this
    //   for (var i = 0; i < 35; i++) {
    //     var point = turf.along(line, interval, unit);
    //     // console.log(point.geometry.coordinates);
    //     var pointCoords = point.geometry.coordinates;
    //     // console.log("----------------------------->>>>>>",pointCoords);
    //     features.push(point);
    //     interval = interval + 0.01;
    //   }
    //   return features;
    // }

    // // var myFeatures = resample(myLine, 0.01, 'miles');
    // //send the coordinates of new points to google elevation api
    // var coordsToSend = myFeatures.slice();
    // coordsToSend.shift();

    // var sampledPointCoordinates = coordsToSend.map(function(n, i) {
    //   return n.geometry.coordinates;
    // });
    // //send to googleapi:
    // // RouteService.postRouteRequest(sampledPointCoordinates)
    // //   .then(function successCb(res){
    // //     console.log(res)
    // //   }, function errorCb(res){
    // //     console.log('error in elevation request', res.status);
    // // });

    // var resampledRoute = {
    //   "type": "FeatureCollection",
    //   "features": myFeatures
    // };

    // L.geoJson(resampledRoute).addTo(vm.map);

    //renders the resampledRoute after the elevation data is returned from googleapi:

    // L.geoJson(turfElevation, {
    //   pointToLayer: function(feature, latlng) {
    //     var myIcon = L.divIcon({
    //       className: 'markerline',
    //       html: '<div class="elevmarker"><div class="markercircle bottomcap"></div><div class="markerline" style="height:' + feature.properties.elevation * 20 + 'px">' + '</div><div class="markercircle"></div><div class="elevfigure"><strong>' + (feature.properties.elevation * 3.28).toFixed(0) + ' ft </strong><span style="font-size:0.9em"></span></div>'
    //     });
    //     // return L.circleMarker(latlng, {radius: feature.properties.elevation*10});
    //     return L.marker(latlng, {
    //       icon: myIcon
    //     });
    //   }
    // }).addTo(vm.map);

          }, function errorCb(res) {
            console.log("error posting route request", res.status);
          });
      };      

    }])
})();