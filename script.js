'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

/*              GLOBAL VARIABLE DECLARATION                         */
let map, mapEvent;
/********************************************************************/

/*                   Creating Class for App                         */

class App {
  // class specific properties
  workouts = [];
  map;

  constructor() {
    /**
     *  Using geolocation API of browser to get user's current location
     */

    navigator.geolocation.getCurrentPosition(
      function (position) {
        // getting current latitude and longitude
        const coords = _getPosition(position);

        // loading the map
        map = _loadMap(coords);
      },
      function () {
        alert("Couldn't get your current location");
      }
    );
  }

  _getPosition(position) {
    console.log(position);
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];
    return coords;
  }

  _loadMap(position) {
    // defining a map
    map = L.map('map').setView(coords, 13);

    // adding tile map
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 25,
      attribution: '© OpenStreetMap',
    }).addTo(map);

    return map;
  }

  _showForm() {}

  _toggleElevationField() {}

  _newWorkout() {}
}

/********************************************************************/

/**
 *  Adding submit event listener on form
 */

form.addEventListener('submit', function (event) {
  event.preventDefault();
  const { lat, lng } = mapEvent.latlng;
  // adding marker to map
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        autoClose: false,
        maxWidth: 250,
        minWidth: 100,
        closeOnClick: false,
        className: 'running-popup',
      })
    )
    .setPopupContent('Hello')
    .openPopup();

  // clear input fields
  inputDistance.value = '';
  inputDuration.value = '';
  inputCadence.value = '';
  inputElevation.value = '';
});

/**
 *  Adding event listener on workout dropdown
 */
inputType.addEventListener('change', function () {
  inputCadence.parentElement.classList.toggle('form__row--hidden');
  inputElevation.parentElement.classList.toggle('form__row--hidden');
});

// creating instance of app
// new App();
