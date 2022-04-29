// const map = L.map('map').locate({setView: true, maxZoom: 16}); //.setView([51.82673084052198, 14.143797321698354], 14); //
const map = L.map('map').setView([51.82673084052198, 14.143797321698354], 14);
const attribution = '&copy; <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl, {attribution});
tiles.addTo(map);
L.control.locate({}).addTo(map);
// let currentPosition = L.marker([0, 0], {icon: L.icon({
//     iconUrl: 'images/current-position.svg',
//     iconSize: [30, 30]
//   })
// }).addTo(map);
let markers = [];
let markerCount = 0;
let polyline;
let routes;

// const onLocationFound = (location) => {
//   currentPosition.setLatLng(location.latlng);
// }
// map.on('locationfound', onLocationFound);
// map.locate({watch: true});

const createMarker = (lat, lng) => {
  const marker = L.marker([lat, lng], {title: 'marker-' + markerCount}).addTo(map);
  markerCount += 1;
  marker.on('click', onMarkerClick)
  markers.push(marker);
  if (markers.length > 1) {
    if (polyline) map.removeLayer(polyline);
    const latLongs = markers.map((marker) => [marker._latlng.lat, marker._latlng.lng]);
    polyline = L.polyline(latLongs, {color: 'blue'}).addTo(map);
  }
}

const updateRouteSelect = () => {
  routeSelect.innerHTML = '';
  let standardOption = document.createElement('option');
  standardOption.value = '';
  standardOption.innerHTML = '- Select route -';
  routeSelect.appendChild(standardOption);
  const routeNames = Object.keys(routes);
  routeNames.forEach((routeName) => {
    const option = document.createElement('option');
    option.value = routeName;
    option.innerHTML = routeName;
    routeSelect.appendChild(option);
  })
}

const onMapClick = (e) => {
  createMarker(e.latlng.lat, e.latlng.lng);
};

const onMarkerClick = (e) => {
  markers = markers.filter((marker) => {
    if (marker.options.title === e.target.options.title) {
      map.removeLayer(marker);
      return false;
    }
    return true;
  });
  const latLongs = markers.map((marker) => [marker._latlng.lat, marker._latlng.lng]);
  map.removeLayer(polyline);
  polyline = L.polyline(latLongs, {color: 'blue'}).addTo(map);
};

map.on('click', onMapClick);
const saveButton = document.getElementById('save');
const routeNameInput = document.getElementById('route-name');
const routeSelect = document.getElementById('route-select');

saveButton.addEventListener('click', () => {
  const routeName = routeNameInput.value;
  if (routeName) {
    const latLongs = markers.map((marker) => [marker._latlng.lat, marker._latlng.lng]);
    fetch('save-route', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: routeName,
        positions: latLongs
      })
    })
      .then((res) => res.text())
      .then((result) => {
        routes = JSON.parse(result);
        updateRouteSelect();
      })
  }
});

routeSelect.addEventListener('change', (e) => {
  markers.forEach((marker) => map.removeLayer(marker))
  markers = [];
  if (polyline) map.removeLayer(polyline);
  const routeName = routeSelect.value;
  if (routeName) {
    routes[routeName].forEach((markerPosition) => createMarker(markerPosition[0], markerPosition[1]))
  }
})

window.addEventListener('load', () => {
  fetch('routes', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((res) => res.text())
    .then((result) => {
      routes = JSON.parse(result);
      updateRouteSelect();
    })
})