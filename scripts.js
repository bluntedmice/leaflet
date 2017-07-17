//  Map & Api Stuff
/* global L,fetch */

// centers at downtown brooklyn

var M = L.map('mapid').setView([40.645, -73.975], 12)
var apikey = 'mapzen-bUdwtHy'
var apiurl = 'https://search.mapzen.com/v1/autocomplete'
var apiurlReverse = 'https://search.mapzen.com/v1/reverse'
var forecastApiurl = 'https://api.darksky.net/forecast/'
var forecastApikey = '9c4c46f1547235bf7052307be4bb9494'
var marker
L.Mapzen.apiKey = 'mapzen-bUdwtHy'

/* start mapzen plugin */
// Disable autocomplete and set parameters for the search query
var geocoderOptions = {
  autocomplete: false,
  params: {
    sources: 'osm',
    'boundary.country': 'USA',
    layers: 'address,venue'
  }
}

// Add the geocoder to the map, set parameters for geocoder options
var geocoder = L.Mapzen.geocoder(geocoderOptions)
geocoder.addTo(M)
/* end mapzen plugin */

// Pure function

function createMarker (p, M) {
  var newMarker = L.marker(p, { draggable: true }).addTo(M)
  newMarker.on('moveend', moveEnd)
  return newMarker
};

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: 'pk.eyJ1IjoiYmx1bnRlZG1pY2UiLCJhIjoiY2l6a2hqeHdvMDAxMzJ3cnY2czIyODE5aCJ9.fpYRJeHhMLu0KWDRHz2j-g'
}).addTo(M)

/* start of search function */
// handles the res by reversing coords, panning to it, and marking it.
function handleJSON (res) {
  M.panTo(res.features[0].geometry.coordinates.reverse())
  var p = res.features[0].geometry.coordinates
  console.log(p)
  if (marker) {
    marker.setLatLng(p)
  } else {
    marker = createMarker(p, M)
  }
  marker.bindPopup(res.features[0].properties.label + '<br />' + p).openPopup()
}

// Parses the json for search results
function searchAddress (res, err) {
  res.json().then(handleJSON)
}

// looks for input box and listens for KeyUp then handles it
document.querySelector('.leaflet-pelias-input').addEventListener('keyup', function (event) {
  console.log('Address: ' + event.target.value)

// options for URL
  var options = {
    api_key: apikey,
    text: event.target.value

  }

  // constructs search address URL
  var searchUrl = `${apiurl}?api_key=${options.api_key}&text=${options.text}`
  console.log(searchUrl)
  fetch(searchUrl).then(searchAddress)
})
/* end of search function */

/* start of click function */

// reverse the coords and displays it on  a popup
function displayAddressData (res) {
  var addressCoords = res.features[0].geometry.coordinates.reverse()
  console.log('Click : ' + addressCoords)
  marker.bindPopup(res.features[0].properties.label + '<br />' + addressCoords[0] + ' , ' + addressCoords[1]).openPopup()
};

function displayForecastData (res) {
  alert(res.currently.summary)
};
// parses the Address data so we can display it
function gotAddressData (res, err) {
  res.json().then(displayAddressData)
}

function gotForecastData (res, err) {
  res.json().then(displayForecastData)
}
// on the event of click if there is a marker avalible set
M.on('click', function (click) {
  var clickLocation = click.latlng

  if (marker) {
    marker.setLatLng(clickLocation)
  } else {
    marker = createMarker(clickLocation, M)
  }

// Gets the points from clickLocation
  var options = {
    lat: clickLocation.lat,
    lng: clickLocation.lng
  }
// constructs click URL function
  var clickUrl = `${apiurlReverse}?api_key=${apikey}&point.lat=${options.lat}&point.lon=${options.lng}`
// uses URL then runs gotAddress function
  fetch(clickUrl).then(gotAddressData)

  // constructs forecast URL
  var searchForecastUrl = `${forecastApiurl}${forecastApikey}/${options.lat},${options.lng}`

  fetch(searchForecastUrl, {mode: 'no-cors'})
.then(gotForecastData)
})
/* end of click function */

/* beginning of moveend function */

// runs the event of the moveEnd
function moveEnd (event) {
  // simply gets the coords of new moveEnd point
  var targetCoords = event.target.getLatLng()
  console.log('Move End' + targetCoords)

  function gotAddress (res, err) {
    // uses gotAddress then parses jSon
    res.json().then(gotJson)

   // gets the response and from the got address parsing and give it to  pop up
    function gotJson (res) {
      marker.bindPopup(res.features[0].properties.label + '<br />' + targetCoords.lat + ' , ' + targetCoords.lng).openPopup()
    };
  }

  // constructs URL
  var moveendUrl = `${apiurlReverse}?api_key=${apikey}&point.lat=${targetCoords.lat}&point.lon=${targetCoords.lng}`
  // uses URL then runs gotAddress function
  fetch(moveendUrl).then(gotAddress)
}

/* end of moveend function */
