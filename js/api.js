function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}

function getClimateAtBH() {
    $.ajax({
        url: 'https://api.openweathermap.org/data/2.5/weather?q=belo%20horizonte,br&appid=41ed607378c57096980252995587b30d'
    }).done(function (result) {
        document.getElementById("climate").append("BH's weather has " + result.weather["0"].description);
    }).fail(function () {
        alert("Could not find out the proper weather to BH. Sorry :/");
    });
}


var infoContent = '<div id="content">' +
    '<div >' +
    '<h3>$TITLE$</h3>' +
    '</div>' +
    '<br>' +
    '<div id="bodyContent">' +
    '$status$' +
    '<br>' +
    '$open_hours$' +
    '<br>' +
    '$reviews$' +
    '<br>' +
    '$address$' +
    '</div>' +
    '</div>';
var greenIcon = 'https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=snack|008000';
var whiteIcon = 'https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=repair|FFFFFF';


var initMap = function() {
    getClimateAtBH();
    //https://review.udacity.com/#!/rubrics/17/view
    var viewModel = {

        locations: [{
            title: 'Nino Pizzaria',
            location: {
                lat: -19.9185567,
                lng: -43.9756613
            },
            place_id: 'ChIJdSpkyhiXpgAR7gjs9rYB0qo'
        }, {
            title: 'La Pizzabella',
            location: {
                lat: -19.9284176,
                lng: -43.9630613
            },
            place_id: 'ChIJg3G4cWyXpgARvFTNfFTSUVA'
        }, {
            title: 'Pizza no Galpão',
            location: {
                lat: -19.9268213,
                lng: -43.9615131
            },
            place_id: 'ChIJ37jOSWqXpgARiWddZYPVU1Q'
        }, {
            title: 'Pomodori Del Rey',
            location: {
                lat: -19.8903725,
                lng: -43.9681114
            },
            place_id: 'ChIJvfwA0MWQpgAROtXtI1JnRgY'
        }, {
            title: 'Pizzaria Porto',
            location: {
                lat: -19.9224274,
                lng: -43.9471559
            },
            place_id: 'ChIJewiKK1mXpgARg7vmjx55ZMk'
        }]
    };

    ko.applyBindings(viewModel);

    //list maker as ko.binding
    var markerList = [];

    // -> dropdown menu that filters the map markers
    // https://github.com/udacity/ud864/blob/master/Project_Code_3_WindowShoppingPart1.html
    // -> Clicking a location on the list displays unique information about the location, and animates its associated map marke

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 20,
        center: {
            lat: -19.9132519,
            lng: -43.9734332
        }
    });
    var service = new google.maps.places.PlacesService(map);
    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    var populateInfoWindow = function (marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;

            var request = {
                placeId: marker.place_id
            };
            service.getDetails(request, function callback(result, status) {
                var tempInfoContent = infoContent.replace("$TITLE$", marker.title);
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    if (result.opening_hours.open_now) {
                        tempInfoContent = tempInfoContent.replace("$status$", "It is open, now! :)");
                        marker.setIcon(greenIcon);
                    } else {
                        tempInfoContent = tempInfoContent.replace("$status$", "It is closed, now! :/");
                        marker.setIcon(whiteIcon);
                    }

                    if (result.rating) {
                        tempInfoContent = tempInfoContent.replace("$reviews$", "Stars:" + result.rating);
                    } else {
                        tempInfoContent = tempInfoContent.replace("$reviews$", "");
                    }

                    if (result.formatted_address) {
                        tempInfoContent = tempInfoContent.replace("$address$", result.formatted_address);
                    } else {
                        tempInfoContent = tempInfoContent.replace("$address$", "");

                    }

                    if (result.opening_hours.weekday_text) {
                        var today = new Date().getDay() - 1;
                        today = (today < 0) ? 6 : today;

                        tempInfoContent = tempInfoContent.replace("$open_hours$", result.opening_hours.weekday_text[today]);
                    } else {
                        tempInfoContent = tempInfoContent.replace("$open_hours$", "");
                    }
                } else {
                    tempInfoContent = tempInfoContent.replace("$status$", "We do not have more info about this place. :/");
                    tempInfoContent = tempInfoContent.replace("$address$", "But, it is good. Trust me.");
                    tempInfoContent = tempInfoContent.replace("$open_hours$", "");
                    tempInfoContent = tempInfoContent.replace("$reviews$", "");

                }
                infowindow.setContent(tempInfoContent);
                infowindow.open(map, marker);
                document.getElementById("pizzaElement").value = marker.title;
            });


            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function () {
                infowindow.setMarker = null;
            });        

        }
    };



    var i = 0;
    viewModel.locations.forEach(function (element) {
        var marker = new google.maps.Marker({
            map: map,
            position: element.location,
            title: element.title,
            animation: google.maps.Animation.DROP,
            place_id: element.place_id
        });
        i += 1;

        markerList.push(marker);
        marker.addListener('click', function () {
            populateInfoWindow(this, largeInfowindow);
        });
        bounds.extend(marker.position);

    });
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);

    var selector = document.getElementById("pizzaElement");
    selector.addEventListener("change", function focusOnMarker() {
        var x = document.getElementById("pizzaElement").value;
        var boundsFocus = new google.maps.LatLngBounds();

        //hide all markers besides the selected
        for (var i = 0; i < markerList.length; i++) {
            if (x === "All pizzeria" || x === "Select here...") {
                largeInfowindow.close();
                if (markerList[i].map === null) {
                    markerList[i].setMap(map);
                }
                markerList[i].setAnimation(null);
                // reload the bound
                boundsFocus.extend(markerList[i].position);
            }
            else {
                if (x === (markerList[i].title)) {
                    if (markerList[i].map === null) {
                        markerList[i].setMap(map);
                    }

                    // reload the bound
                    boundsFocus.extend(markerList[i].position);
                    //animate it
                    toggleBounce(markerList[i]);
                    //show the info
                    populateInfoWindow(markerList[i], largeInfowindow);
                } else {
                    markerList[i].setMap(null);
                }
            }
        }



        // if none has been selected, reloads the bound and show them all
        map.fitBounds(boundsFocus);
    });



    
}





