import {
    addSpinner,
    displayError,
    updateScreenReaderConfirmation,
    toProperCase,
    setPlaceholderText,
    updateDisplay,
} from "./domFunctions.js";

import {
    setLocationObj,
    getHomeLocation,
    cleanText,
    getCoordsFromAPI,
    getWeatherFromCoords,
} from "./dataFunctions.js";

import CurrentLocation from "./CurrentLocation.js";

const currentLoc = new CurrentLocation();

document.addEventListener("readystatechange", (event) => {
    if (event.target.readyState === "complete") {
        initApp();
    }
});

const initApp = () => {
    const geoButton = document.getElementById("getLocation");
    geoButton.addEventListener("click", getGeoWeather);

    const homeButton = document.getElementById("home");
    homeButton.addEventListener("click", loadHomeWeather);

    const saveButton = document.getElementById("saveLocation");
    saveButton.addEventListener("click", saveLocation);

    const unitButton = document.getElementById("unit");
    unitButton.addEventListener("click", setUnitPref);

    const refreshButton = document.getElementById("refresh");
    refreshButton.addEventListener("click", refreshWeather);

    const locationEntry = document.getElementById("searchBar__form");
    locationEntry.addEventListener("submit", submitNewLocation);

    setPlaceholderText();

    loadHomeWeather();
};

const getGeoWeather = (event) => {
    if (event) {
        if (event.type === "click") {
            const mapIcon = document.querySelector(".fa-map-marker-alt");
            addSpinner(mapIcon);
        }
    }

    if (!navigator.geolocation) return geoError();
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
};

const geoError = (errObj) => {
    const errMsg = errObj ? errObj.message : "Geolocation not supported";
    displayError(errMsg, errMsg);
};

const geoSuccess = (position) => {
    const coordsObj = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        name: `Lat: ${position.coords.latitude} Lon: ${position.coords.longitude}`,
    };

    setLocationObj(currentLoc, coordsObj);
    updateDataAndDisplay(currentLoc);
};

const loadHomeWeather = (event) => {
    const savedLocation = getHomeLocation();
    if (!savedLocation && !event) return getGeoWeather();
    if (!savedLocation && event.type === "click") {
        displayError(
            "No Home Location Saved.",
            "Sorry. Please save your home location first."
        );
    } else if (savedLocation && !event)
        displayHomeLocationWeather(savedLocation);
    else {
        const homeIcon = document.querySelector(".fa-home");
        addSpinner(homeIcon);
        displayHomeLocationWeather(savedLocation);
    }
};

const displayHomeLocationWeather = (homeLocation) => {
    if (typeof homeLocation === "string") {
        const locationJson = JSON.parse(homeLocation);
        const coordsObj = {
            lat: locationJson.lat,
            lon: locationJson.lon,
            name: locationJson.name,
            unit: locationJson.unit,
        };
        setLocationObj(currentLoc, coordsObj);
        updateDataAndDisplay(currentLoc);
    }
};

const saveLocation = () => {
    if (currentLoc.getLat() && currentLoc.getLon()) {
        const saveIcon = document.querySelector(".fa-save");
        addSpinner(saveIcon);
        const location = {
            lat: currentLoc.getLat(),
            lon: currentLoc.getLon(),
            name: currentLoc.getName(),
            unit: currentLoc.getUnit(),
        };
        localStorage.setItem(
            "defaultWeatherLocation",
            JSON.stringify(location)
        );
        updateScreenReaderConfirmation(
            `Saved ${currentLoc.getName()} as home location.`
        );
    }
};

const setUnitPref = () => {
    const unitIcon = document.querySelector(".fa-chart-bar");
    addSpinner(unitIcon);
    currentLoc.toggleUnit();
    updateDataAndDisplay(currentLoc);
};

const refreshWeather = () => {
    const refreshIcon = document.querySelector(".fa-sync-alt");
    addSpinner(refreshIcon);
    updateDataAndDisplay(currentLoc);
};

const submitNewLocation = async (event) => {
    event.preventDefault();
    const rawText = document.getElementById("searchBar__text").value;
    const entryText = cleanText(rawText);
    if (!entryText.length) return;
    const locationIcon = document.querySelector(".fa-search");
    addSpinner(locationIcon);
    const coordsData = await getCoordsFromAPI(entryText, currentLoc.getUnit());

    if (coordsData) {
        if (coordsData.cod === 200) {
            const coordsObj = {
                lat: coordsData.coord.lat,
                lon: coordsData.coord.lon,
                name: coordsData.sys.country
                    ? `${coordsData.name}, ${coordsData.sys.country}`
                    : coordsData.name,
            };
            setLocationObj(currentLoc, coordsObj);
            updateDataAndDisplay(currentLoc);
        } else {
            const properMsg = toProperCase(coordsData);
            displayError(properMsg, `${properMsg}. Please try again.`);
        }
    } else {
        displayError("Connection Error", "Connection Error");
    }
};

const updateDataAndDisplay = async (locationObj) => {
    const weatherJson = await getWeatherFromCoords(locationObj);
    console.log(weatherJson);
    if (weatherJson) updateDisplay(weatherJson, locationObj);
};
