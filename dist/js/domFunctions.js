export const setPlaceholderText = () => {
    const input = document.getElementById("searchBar__text");
    window.innerWidth < 400
        ? (input.placeholder = "City, State, Country")
        : (input.placeholder = "City, State, Country, or Zip Code");
};
export const addSpinner = (element) => {
    animateButton(element);
    setTimeout(animateButton, 1000, element);
};

const animateButton = (element) => {
    element.classList.toggle("none");
    element.nextElementSibling.classList.toggle("none");
    element.nextElementSibling.classList.toggle("block");
};

export const displayError = (errMsg, srMsg) => {
    updateWeatherLocationHeader(errMsg);
    updateScreenReaderConfirmation(srMsg);
};

const updateWeatherLocationHeader = (message) => {
    const h1 = document.getElementById("currentForecast__location");
    if (message.includes("Lat")) {
        const msgArray = message.split(" ");
        for (let i = 1; i < msgArray.length; i += 2) {
            msgArray[i] = Number(msgArray[i]).toFixed(2);
        }
        msgArray.splice(2, 0, "•");
        h1.textContent = msgArray.join(" ");
    } else {
        h1.textContent = message;
    }
};

export const updateScreenReaderConfirmation = (message) => {
    document.getElementById("confirmation").textContent = message;
};

export const toProperCase = (text) => {
    return text
        .split(" ")
        .map((word) => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
};

export const updateDisplay = (weatherJson, locationObj) => {
    fadeDisplay();
    clearDisplay();
    const weatherClass = getWeatherClass(weatherJson.current.weather[0].icon);
    setBGImage(weatherClass);
    const screenReaderWeather = buildScreenReaderWeather(
        weatherJson,
        locationObj
    );
    updateScreenReaderConfirmation(screenReaderWeather);
    updateWeatherLocationHeader(locationObj.getName());
    const currentConditionsArray = createCurrentConditionElements(
        weatherJson,
        locationObj.getUnit()
    );
    displayCurrentConditions(currentConditionsArray);
    displaySixDayForecast(weatherJson);

    setFocusOnSearch();
    fadeDisplay();
};

const fadeDisplay = () => {
    const currentForecast = document.getElementById("currentForecast");
    currentForecast.classList.toggle("zero-vis");
    currentForecast.classList.toggle("fade-in");
    const dailyForecast = document.getElementById("dailyForecast");
    dailyForecast.classList.toggle("zero-vis");
    dailyForecast.classList.toggle("fade-in");
};

const clearDisplay = () => {
    const currentConditions = document.getElementById(
        "currentForecast__conditions"
    );
    deleteContents(currentConditions);
    const sixDayForecast = document.getElementById("dailyForecast__contents");
    deleteContents(sixDayForecast);
};

const deleteContents = (parentElement) => {
    while (parentElement.lastElementChild) {
        parentElement.removeChild(parentElement.lastElementChild);
    }
};

const getWeatherClass = (icon) => {
    const firstTwoChars = icon.slice(0, 2);
    const lastChar = icon.slice(2);
    const weatherLookup = {
        "09": "snow",
        10: "rain",
        11: "rain",
        13: "snow",
        50: "fog",
    };
    return weatherLookup[firstTwoChars]
        ? weatherLookup[firstTwoChars]
        : lastChar === "d"
        ? "clouds"
        : "night";
};

const setBGImage = (weatherClass) => {
    document.documentElement.classList.add(weatherClass);
    document.documentElement.classList.forEach((img) => {
        if (img !== weatherClass)
            document.documentElement.classList.remove(img);
    });
};

const buildScreenReaderWeather = (weatherJson, locationObj) => {
    const location = locationObj.getName();
    const unit = locationObj.getUnit();
    const tempUnit = unit === "imperial" ? "Fahrenheit" : "Celsius";
    return `${weatherJson.current.weather[0].description} and ${Math.round(
        Number(weatherJson.current.temp)
    )}°${tempUnit} in ${location}`;
};

const setFocusOnSearch = () => {
    document.getElementById("searchBar__text").focus();
};

const createCurrentConditionElements = (weatherJson, unit) => {
    const tempUnit = unit === "imperial" ? "F" : "C";
    const windUnit = unit === "imperial" ? "mph" : "m/s";

    const icon = creatMainImg(
        weatherJson.current.weather[0].icon,
        weatherJson.current.weather[0].description
    );

    const temp = createElement(
        "div",
        "temp",
        `${Math.round(Number(weatherJson.current.temp))}°`,
        tempUnit
    );

    const properDescription = toProperCase(
        weatherJson.current.weather[0].description
    );

    const desc = createElement("div", "desc", properDescription);

    const feels = createElement(
        "div",
        "feels",
        `Feels Like ${Math.round(Number(weatherJson.current.feels_like))}°`
    );

    const maxTemp = createElement(
        "div",
        "maxtemp",
        `High ${Math.round(Number(weatherJson.daily[0].temp.max))}°`
    );

    const minTemp = createElement(
        "div",
        "mintemp",
        `Low ${Math.round(Number(weatherJson.daily[0].temp.min))}°`
    );

    const humidity = createElement(
        "div",
        "humidity",
        `Humidity ${weatherJson.current.humidity}%`
    );

    const wind = createElement(
        "div",
        "wind",
        `Wind ${Math.round(Number(weatherJson.current.wind_speed))} ${windUnit}`
    );

    return [icon, temp, desc, feels, maxTemp, minTemp, humidity, wind];
};

const creatMainImg = (icon, description) => {
    const iconElement = createElement("div", "icon");
    iconElement.id = "icon";
    const faIcon = translateIconToFontAwesome(icon);
    faIcon.ariaHidden = true;
    faIcon.title = description;
    iconElement.appendChild(faIcon);
    return iconElement;
};

const createElement = (elementType = "div", className, text, unit) => {
    const element = document.createElement(elementType);
    element.className = className;
    if (text) element.textContent = text;
    if (className === "temp") {
        const unitDiv = document.createElement("div");
        unitDiv.className = "unit";
        unitDiv.textContent = unit;
        element.appendChild(unitDiv);
    }
    return element;
};

const translateIconToFontAwesome = (icon) => {
    const i = document.createElement("i");
    const firstTwoChars = icon.slice(0, 2);
    const lastChar = icon.slice(2);

    switch (firstTwoChars) {
        case "01":
            lastChar === "d"
                ? i.classList.add("far", "fa-sun")
                : i.classList.add("far", "fa-moon");
            break;

        case "02":
            lastChar === "d"
                ? i.classList.add("fas", "fa-cloud-sun")
                : i.classList.add("fas", "fa-cloud-moon");
            break;

        case "03":
            i.classList.add("fas", "fa-cloud");

        case "04":
            i.classList.add("fas", "fa-cloud-meatball");
            break;

        case "09":
            i.classList.add("fas", "fa-cloud-rain");
            break;

        case "10":
            lastChar === "d"
                ? i.classList.add("fas", "fa-cloud-sun-rain")
                : i.classList.add("fas", "fa-cloud-moon-rain");
            break;

        case "11":
            i.classList.add("fas", "fa-poo-storm");
            break;

        case "13":
            i.classList.add("far", "fa-snowflake");
            break;

        case "50":
            i.classList.add("fas", "fa-smog");
            break;
        default:
            i.classList.add("far", "fa-question-circle");
    }
    return i;
};

const displayCurrentConditions = (currentConditionsArray) => {
    currentConditionsArray.forEach((currentConditions) => {
        document
            .getElementById("currentForecast__conditions")
            .appendChild(currentConditions);
    });
};

const displaySixDayForecast = (weatherJson) => {
    for (let i = 1; i <= 6; i++) {
        const dailyForecastArray = createDailyForecastDivs(
            weatherJson.daily[i]
        );
        displayDailyForecast(dailyForecastArray);
    }
};

const createDailyForecastDivs = (dayWeather) => {
    const dayAbbrText = getDayAbbr(dayWeather.dt);
    const dayAbbr = createElement("div", "dayAbbreviation", dayAbbrText);
    const dayIcon = createDailyForecastIcon(
        dayWeather.weather[0].icon,
        dayWeather.weather[0].description
    );
    const dayHigh = createElement(
        "p",
        "dayHigh",
        `${Math.round(Number(dayWeather.temp.max))}°`
    );
    const dayLow = createElement(
        "p",
        "dayLow",
        `${Math.round(Number(dayWeather.temp.min))}°`
    );
    return [dayAbbr, dayIcon, dayHigh, dayLow];
};

const getDayAbbr = (data) => {
    const dateObj = new Date(data * 1000);
    return dateObj.toUTCString().slice(0, 3).toUpperCase();
};

const createDailyForecastIcon = (icon, description) => {
    const img = document.createElement("img");
    if (window.innerWidth < 768 || window.innerHeight < 1025) {
        img.src = `https://openweathermap.org/img/wn/${icon}.png`;
    } else {
        img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    }
    img.alt = description;

    return img;
};

const displayDailyForecast = (dailyForecastArray) => {
    const dayDiv = createElement("div", "forecastDay");
    dailyForecastArray.forEach((element) => {
        dayDiv.appendChild(element);
    });
    document.getElementById("dailyForecast__contents").appendChild(dayDiv);
};
