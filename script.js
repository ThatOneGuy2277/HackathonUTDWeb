let map;
let service;
let infowindow;

document.addEventListener('DOMContentLoaded', function() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const symptomSelect = document.getElementById('symptoms');
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = key.charAt(0).toUpperCase() + key.slice(1);
                    symptomSelect.appendChild(option);
                }
            }
            // Add animation to the dropdown
            symptomSelect.classList.add('animated-dropdown');
        });
});

document.getElementById('apply-button').addEventListener('click', function() {
    const symptom = document.getElementById('symptoms').value;
    if (symptom) {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                const condition = data[symptom];
                if (condition) {
                    document.getElementById('info').textContent = condition.info;
                    document.getElementById('cause').textContent = condition.cause;
                    document.getElementById('cases').textContent = condition.cases;
                    document.getElementById('treatment').textContent = condition.treatment;
                    document.getElementById('hospitals').textContent = condition.hospitals;
                    
                    document.getElementById('results').style.display = 'block';
                    document.getElementById('map').style.display = 'block';
                    initMap(symptom);
                }
            });
    }
});

function initMap(symptom) {
    const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // Default location (New York City)

    map = new google.maps.Map(document.getElementById("map"), {
        center: defaultLocation,
        zoom: 12,
    });

    infowindow = new google.maps.InfoWindow();

    // Ask for user's permission to use their location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                infowindow.setPosition(pos);
                infowindow.setContent("Location found.");
                infowindow.open(map);
                map.setCenter(pos);
                findNearbyHospitals(pos, map, infowindow, symptom);
            },
            () => {
                handleLocationError(true, infowindow, map.getCenter());
            }
        );
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infowindow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infowindow, pos) {
    infowindow.setPosition(pos);
    infowindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );
    infowindow.open(map);
}

function findNearbyHospitals(location, map, infowindow, symptom) {
    const request = {
        location: location,
        radius: 5000, // Search within 5 km
        keyword: symptom + " hospital",
        type: ["hospital"],
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            const topResults = results.slice(0, 3); // Get the top 3 results
            const hospitalsList = document.getElementById('hospitals');
            hospitalsList.innerHTML = ''; // Clear previous results

            topResults.forEach((place) => {
                const marker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                });

                google.maps.event.addListener(marker, "click", () => {
                    infowindow.setContent(place.name);
                    infowindow.open(map, marker);
                });

                // Add hospital to the list
                const listItem = document.createElement('li');
                listItem.textContent = place.name;
                hospitalsList.appendChild(listItem);
            });
        }
    });
}