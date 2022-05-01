const map = L.map('map').locate({setView: true, maxZoom: 16}); //.setView([51.82673084052198, 14.143797321698354], 14); //0
const attribution = '&copy; <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl, {attribution});
tiles.addTo(map);
L.control.locate({}).addTo(map);
let markers = [];
let markerCount = 0;
let polyline;
let routes;

const saveButton = document.getElementById('save');
const deleteButton = document.getElementById('delete');
const routeNameInput = document.getElementById('route-name');
const routeSelect = document.getElementById('route-select');
const closeButton = document.getElementById('close-button');
const openButton = document.getElementById('open-button');
const userInputWrapper = document.getElementsByClassName('user-input')[0];
const loader = document.getElementById('loader-wrapper');

const hideLoader = () => loader.classList.add('hide');
const showLoader = () => loader.classList.remove('hide');

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

const removeAllRouteElementsFromMap = () => {
  markers.forEach((marker) => map.removeLayer(marker))
  markers = [];
  if (polyline) map.removeLayer(polyline);
}

const updateRouteSelect = () => {
  routeSelect.innerHTML = '';
  let standardOption = document.createElement('option');
  standardOption.value = '';
  standardOption.innerHTML = '- Select route -';
  routeSelect.appendChild(standardOption);
  routes.forEach((route) => {
    const option = document.createElement('option');
    option.value = route._id;
    option.innerHTML = route.name;
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

saveButton.addEventListener('click', () => {
  const routeName = routeNameInput.value;
  if (routeName) {
    showLoader();
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
      .then((res) => res.json())
      .then((result) => {
        routes = result;
        updateRouteSelect();
      })
      .finally(hideLoader)
  }
});

deleteButton.addEventListener('click', () => {
  const routeId = routeSelect.value;
  if (routeId) {
    const route = routes.find((route) => route._id === routeId);
    if (confirm(`Do you want to delete the "${route.name}" route?`)) {
      showLoader();
      removeAllRouteElementsFromMap();
      fetch(`/delete-route/${routeId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
        .then((res) => res.json())
        .then((result) => {
          routes = result;
          updateRouteSelect();
        })
        .finally(hideLoader)
    }
  }
});

closeButton.addEventListener('click', () => {
  userInputWrapper.classList.remove('open');
  userInputWrapper.classList.add('closed');
});

openButton.addEventListener('click', () => {
  userInputWrapper.classList.add('open');
  userInputWrapper.classList.remove('closed');
});

routeSelect.addEventListener('change', (e) => {
  removeAllRouteElementsFromMap();
  const routeId = routeSelect.value;
  if (routeId) {
    const selectedRoute = routes.find((route) => route._id === routeId);
    const averagePosition = [0, 0];
    selectedRoute.markers.forEach((markerPosition) => {
      averagePosition[0] += markerPosition[0];
      averagePosition[1] += markerPosition[1];
      createMarker(markerPosition[0], markerPosition[1])
    });
    averagePosition[0] /= selectedRoute.markers.length;
    averagePosition[1] /= selectedRoute.markers.length;
    map.flyTo(averagePosition);
  }

})

window.addEventListener('load', () => {
  showLoader();
  fetch('routes', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((res) => res.json())
    .then((result) => {
      routes = result;
      updateRouteSelect();
    })
    .finally(hideLoader)
})
