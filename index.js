const userTab=document.querySelector("[data-userWeather]");
const searchTab=document.querySelector("[data-searchWeather]");
const userContainer=document.querySelector(".weather-container");

const grantAccessContainer=document.querySelector(".grant-location-container");
const searchForm=document.querySelector("[data-searchForm]");
const loadingScreen=document.querySelector(".loading-container");
const userInfoContainer=document.querySelector(".user-info-container");
const errorControl=document.querySelector(".error-control");

let currentTab=userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
currentTab.classList.add("current-tab");
// ek kam pending hai -> below
getfromSessionStorage();

function switchTab(clickedTab){
    if(clickedTab!=currentTab){
        currentTab.classList.remove("current-tab");
        currentTab=clickedTab;
        currentTab.classList.add("current-tab");
        errorControl.classList.remove("active");

        if(!searchForm.classList.contains("active")){
            // kya search form wala container invisible tha, to visible krana pdega
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
            searchInput.value="";  // search input ko clear krne ke liye
        }
        else{
            // mai phle search tab wale tab pr tha, ab your weather tab visible krna hai
            searchForm.classList.remove("active");
            userInfoContainer.classList.add("active");
            // now, we are in weather tab, so let's check coordinates in local storage whether it is saved or not
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click",()=>{
    // pass clicked tab as parameter
    switchTab(userTab);
});
searchTab.addEventListener("click",()=>{
    // pass clicked tab as parameter
    switchTab(searchTab);
});

function getfromSessionStorage(){
    const localCoordinates=sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        // agr local coordinates nhi mila
        grantAccessContainer.classList.add("active");
    }
    else{
        const coordinates=JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates){
    const {lat,lon}=coordinates;
    // make grant access container invisible
    grantAccessContainer.classList.remove("active");
    // male loader visible
    loadingScreen.classList.add("active");
    // API call
    try{
        const response=await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data=await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
        // hw
    }
}
function renderWeatherInfo(weatherInfo){
    // first, we have to fetch the elements
    const cityName=document.querySelector("[data-cityName]");
    const countryIcon=document.querySelector("[data-countryIcon]");
    const desc=document.querySelector("[data-weatherDesc]");
    const weatherIcon=document.querySelector("[data-weatherIcon]");
    const temp=document.querySelector("[data-temp]");
    const windspeed=document.querySelector("[data-windspeed]");
    const humidity=document.querySelector("[data-humidity]");
    const cloudiness=document.querySelector("[data-cloudiness]");

    // fetch values from weatherInfo object and put it UI elements
    cityName.innerText=weatherInfo?.name;
    if(cityName.innerText=='undefined'){
        // alert('Enter correct city name.');
        userInfoContainer.classList.remove("active");
        errorControl.classList.add("active");
        return;
    }
    else{
        errorControl.classList.remove("active");
        countryIcon.src=`https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
        desc.innerText=weatherInfo?.weather?.[0]?.description;
        weatherIcon.src=`http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
        temp.innerText=`${weatherInfo?.main?.temp} °C`;
        windspeed.innerText=`${weatherInfo?.wind?.speed.toFixed(2)} m/s`;   // toFixed is used to convert no. into decimal upto 2 places
        humidity.innerText=`${weatherInfo?.main?.humidity}%`;
        cloudiness.innerText=`${weatherInfo?.clouds?.all}%`;
    }
}

const grantAccessButton=document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener('click',getLocation);

function getLocation(){
    if(navigator.geolocation){      // to check whether the browser supports geoLocation or not
        navigator.geolocation.getCurrentPosition(showPosition);
    }else{
        //show alert or  console.log("No geoLocation support");
    }
}

function showPosition(position){
    const userCoordinates={
        lat:position.coords.latitude,
        lon:position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const searchInput=document.querySelector("[data-searchInput]");

searchForm.addEventListener("click",(e)=>{
    e.preventDefault();
    let cityName=searchInput.value;
    if(cityName===""){
        return;
    }
    else{
        fetchSearchWeatherInfo(cityName);
    }
})

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try{
        const response=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data=await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
        // hw
        alert('Enter correct city name.');
    }
}