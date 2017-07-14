$(function() {

    // Map & Api Stuff
    var M = L.map('mapid').setView([40.645, -73.975], 8);
    var apikey = "mapzen-bUdwtHy";
    var apiurl = "https://search.mapzen.com/v1/autocomplete";
    var apiurl_reverse = "https://search.mapzen.com/v1/reverse";
    var marker;
    // Pure function
  function createMarker(p,M){
    return  L.marker(p,{draggable: true}).addTo(M);;
  }


    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiYmx1bnRlZG1pY2UiLCJhIjoiY2l6a2hqeHdvMDAxMzJ3cnY2czIyODE5aCJ9.fpYRJeHhMLu0KWDRHz2j-g'
    }).addTo(M);



    $("input").on('keyup', function(keyup) {
        console.log(input.value);
        $.get(apiurl, {
            api_key: apikey,
            text: input.value

        }, function(res, err) {
            console.log(res, err);
            console.log(res.features[0].geometry.coordinates);
            M.panTo(res.features[0].geometry.coordinates.reverse());
            var p = res.features[0].geometry.coordinates;
            console.log(p);
            if (marker) {
                marker.setLatLng(p);
            } else {

                marker = createMarker(p,M);
            }
            marker.bindPopup(res.features[0].properties.label + "<br />" + p).openPopup();

        });




    });




    M.on('click', function(click) {
        var p2 = click.latlng;

        $.get(apiurl_reverse, {
            api_key: apikey,
            'point.lat': p2.lat,
            'point.lon': p2.lng,


        }, function(res, err) {


            if (marker) {
                marker.setLatLng(p2);
            } else {

              marker = createMarker(p2,M);

                marker.on('moveend', function(moveend) {

                    var Mv = moveend.target.getLatLng();

                    $.get(apiurl_reverse, {
                            api_key: apikey,
                            'point.lat': Mv.lat,
                            'point.lon': Mv.lng,


                        },
                          function(res,err){


                            marker.bindPopup(res.features[0].properties.label + "<br />" + Mv.lat + " , " + Mv.lng).openPopup();

                        });

                });
            }
            marker.bindPopup(res.features[0].properties.label + "<br />" + p2.lat + " , " + p2.lng).openPopup();
            console.log(res.features[0].properties.label);
          if(res.features[0].properties === undefined){
  marker.bindPopup("No Address").openPopup();

}

        });




    });



});
