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
  #workouts = [];
  #map;
  #mapEvent;

  constructor() {
    /**
     *    Getting current position from browser geolocation API
     */
    this._getPosition();

    /**
     *  Adding submit event listener on form
     */
    form.addEventListener('submit', this._newWorkout.bind(this));

    /**
     *  Adding event listener on workout dropdown
     */
    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    /**
     *  Using geolocation API of browser to get user's current location
     */
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert("Couldn't get your current location");
      }
    );
  }

  _loadMap(position) {
    // defining a map
    console.log(position);
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);

    // adding tile map
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 25,
      attribution: '© OpenStreetMap',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(event) {
    this.#mapEvent = event;
    // showing the form on the side
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputCadence.parentElement.classList.toggle('form__row--hidden');
    inputElevation.parentElement.classList.toggle('form__row--hidden');
  }

  _newWorkout(event) {
    event.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;
    // adding marker to map
    L.marker([lat, lng])
      .addTo(this.#map)
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
  }
}

/********************************************************************/

/* creating instance of app */
const app = new App();
