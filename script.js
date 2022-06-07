'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

/*             Creating Abstract Parent Class for Workout           */

class Workout {
  date = new Date();
  //   id = (new Date() + '').slice(-10);
  id = 'id' + Math.random().toString(16).slice(2);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in mins
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    }`;
  }
}
/********************************************************************/

/*             Creating Concrete Childe Class for Running           */
class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.type = 'running';
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

/********************************************************************/

/*             Creating Concrete Childe Class for Cycling           */
class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.type = 'cycling';
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

/********************************************************************/

/*                   Creating Class for App                         */

class App {
  // class specific properties
  #workouts = [];
  #mapZoomLevel = 13;
  #map;
  #mapEvent;

  constructor() {
    /**
     *    Getting current position from browser geolocation API
     */
    this._getPosition();

    /**
     *  Fetching workouts from local storage
     */
    this._getWorkoutsFromLocalStorage();

    /**
     *  Adding submit event listener on form
     */
    form.addEventListener('submit', this._newWorkout.bind(this));

    /**
     *  Adding event listener on workout dropdown
     */
    inputType.addEventListener('change', this._toggleElevationField);

    /**
     *  Adding event listener on workouts container to listen to click
     *  event so that the map focus changes to the workout coordinates
     */
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
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
    // console.log(position);
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    // adding tile map
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 25,
      attribution: '© OpenStreetMap',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(workout => this._renderWorkoutMarker(workout));
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

    const validInputs = (...inputs) =>
      inputs.every(input => Number.isFinite(input));
    const inputsPositive = (...inputs) => inputs.every(input => input > 0);

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;

    // if workout running, create running object
    if (type === 'running') {
      // check if data is valid
      const cadence = +inputCadence.value;
      if (
        validInputs(distance, duration, cadence) &&
        inputsPositive(distance, duration, cadence)
      ) {
        workout = new Running([lat, lng], distance, duration, cadence);
      } else {
        return alert('Inputs should be positive number');
      }
    } else {
      // if workout cycling, create cycling object
      // check if data is valid
      const elevationGain = +inputElevation.value;
      if (
        validInputs(duration, distance, elevationGain) &&
        inputsPositive(distance, duration)
      ) {
        workout = new Cycling([lat, lng], distance, duration, elevationGain);
      } else {
        return alert('Inputs should be positive number');
      }
    }

    // add workout to array
    // console.log(workout);
    this.#workouts.push(workout);

    // render the workout on map as marker
    this._renderWorkoutMarker(workout);

    // render workout entry
    this._renderWorkout(workout);

    // store the workout in local storage
    this._storeWorkoutInLocalStorage();

    // clear input fields
    this._hideForm();
  }

  _hideForm() {
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);

    inputDistance.value = '';
    inputDuration.value = '';
    inputCadence.value = '';
    inputElevation.value = '';
  }

  _renderWorkout(workout) {
    let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">‍${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀'
            }️</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
      `;

    if (workout.type === 'running') {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
          `;
    } else {
      html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(2)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
        `;
    }

    // containerWorkouts.insertAdjacentHTML('beforeend', html);
    form.insertAdjacentHTML('afterend', html);
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          autoClose: false,
          maxWidth: 250,
          minWidth: 100,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent('' + workout.distance)
      .openPopup();
  }

  _moveToPopup(event) {
    console.log(event);
    const workoutEl = event.target.closest('.workout');

    if (!workoutEl) return;

    const workoutId = workoutEl.dataset.id;
    //   console.log(`workout id : ${workoutId}`);
    const workout = this.#workouts.find(w => w.id === workoutId);
    console.log(workout);
    this.#map.setView(workout.coords, this.#mapZoomLevel, { animate: true });
  }

  _storeWorkoutInLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getWorkoutsFromLocalStorage() {
    this.#workouts = JSON.parse(localStorage.getItem('workouts'));
    console.log(this.#workouts);
    this.#workouts.forEach(workout => {
      this._renderWorkout(workout);
    });
  }
}

/********************************************************************/

/* creating instance of app */
const app = new App();
