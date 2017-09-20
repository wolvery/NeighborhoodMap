

var data = {
    infoContent : '<div id="content">' +
    '<div >' +
    '<h3>$TITLE$</h3>' +
    '</div>' +
    '<br>' +
    '<div id="bodyContent">' +
    '$status$' +
    '<br>' +
    '$open_hours$' +
    '<br>' +
    'STARS: $reviews$' +
    '<br>' +    
    'FOURSQUARE:<p style="color:$COLOR$;">$FOURSQUARE_REVIEW$</p>'+    
    '<br>' +
    '$address$' +
    '<br>' +    
    '</div>' +
    '</div>',
    greenIcon : 'https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=snack|008000',
    whiteIcon :'https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=repair|FFFFFF',
    locations: [{
        title: 'Nino Pizzaria',
        location: {
            lat: -19.9185567,
            lng: -43.9756613
        },
        place_id: 'ChIJdSpkyhiXpgAR7gjs9rYB0qo',
        foursquare_id: '4bd0d43fb221c9b6d385d4d0',
        foursquare_rating: '',
        foursquare_color:'red'
        
    }, {
        title: 'La Pizzabella',
        location: {
            lat: -19.9284176,
            lng: -43.9630613
        },
        place_id: 'ChIJg3G4cWyXpgARvFTNfFTSUVA',
        foursquare_id: '4ea4317de3008f7d92cefc90',
        foursquare_rating: '',
        foursquare_color:'red'
    }, {
        title: 'Pizza no Galpão',
        location: {
            lat: -19.9268213,
            lng: -43.9615131
        },
        place_id: 'ChIJ37jOSWqXpgARiWddZYPVU1Q',
        foursquare_id: '51d364a1498e2527fb50233a',
        foursquare_rating: '',
        foursquare_color:'red'
    }, {
        title: 'Pomodori Del Rey',
        location: {
            lat: -19.8903725,
            lng: -43.9681114
        },
        place_id: 'ChIJvfwA0MWQpgAROtXtI1JnRgY',
        foursquare_id: '55145e0d498e9dee8f2f4024',
        foursquare_rating: '',
        foursquare_color:'red'
    }, {
        title: 'Pizzaria Porto',
        location: {
            lat: -19.9224274,
            lng: -43.9471559
        },
        place_id: 'ChIJewiKK1mXpgARg7vmjx55ZMk',
        foursquare_id: '509e77d4e4b03888250492b1',
        foursquare_rating: '',
        foursquare_color:'red'
    }],
    weather:null,
    loadRating : function(result,status){
        var id = 0;
        data.locations.forEach(function (element) {
            if (result.response.venue.id == element.foursquare_id){
                if (status){
                    data.locations[id].foursquare_color ="#" + result.response.venue.ratingColor;
                    data.locations[id].foursquare_rating =  result.response.venue.rating;
                }else{
                    data.locations[i].foursquare_rating = "NO RATING FOUND.";
                    data.locations[i].foursquare_color = "red"; 
                }

            }
            id+=1;
        });
    }
};
var stringStartsWith = function (string, startsWith) {          
    string = string || "";
    if (startsWith.length > string.length)
        return false;
    return string.substring(0, startsWith.length) === startsWith;
};



var viewModel = function() {
    var self = this;
    this.locationFilter= ko.observable();
    this.weatherInfo= ko.observable(data.weather);

    this.items= ko.observableArray(data.locations);

    this.filteredLocations= ko.computed(function () {
        var filter = this.locationFilter();
        if (!filter) {
            return this.items();
        } else {
            return ko.utils.arrayFilter(this.items(), function (item) {
                return stringStartsWith(item.title.toLowerCase(), filter.toLowerCase());
            });
        }
    },this);

    $.ajax({
        url: 'https://api.openweathermap.org/data/2.5/weather?q=belo%20horizonte,br&appid=41ed607378c57096980252995587b30d'
    }).done(function (result) {
        self.weatherInfo(result.weather["0"].description);
    }).fail(function () {
        alert("Could not find out the proper weather to BH. Sorry :/");
        self.weatherInfo  ("No info");
    });
    
};










var gmapsHandler = {
    map: null,
    service: null,
    largeInfowindow: null,
    bounds: null,
    //list of makers
    markerList: [],
    toggleBounce: function (marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    },
    mouseEffect: function (pizzeria) {
        
        for (var i = 0; i < gmapsHandler.markerList.length; i++) {
            if (pizzeria.title === (gmapsHandler.markerList[i].title)) {
                //animate it
                gmapsHandler.toggleBounce(gmapsHandler.markerList[i]);
            }
        }
    },
    getWeather: function () {
        
        
    },   

    //load information to some marker.
    loadInfo: function (result, status, marker, infowindow) {

        var tempInfoContent = data.infoContent.replace("$TITLE$", marker.title);
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            if (result.opening_hours.open_now) {
                tempInfoContent = tempInfoContent.replace("$status$", "It is open, now! :)");
                marker.setIcon(data.greenIcon);
            } else {
                tempInfoContent = tempInfoContent.replace("$status$", "It is closed, now! :/");
                marker.setIcon(data.whiteIcon);
            }

            if (result.rating) {
                tempInfoContent = tempInfoContent.replace("$reviews$", result.rating);
            } else {
                tempInfoContent = tempInfoContent.replace("$reviews$", "NONE");
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
        data.locations.forEach(function (element) {
            if (marker.title == element.title){
                //replace  $COLOR$  $FOURSQUARE_REVIEW$ to those returned from foursquare
                tempInfoContent = tempInfoContent.replace("$COLOR$",element.foursquare_color);
                tempInfoContent = tempInfoContent.replace("$FOURSQUARE_REVIEW$",element.foursquare_rating);                
            }
        });
        infowindow.setContent(tempInfoContent);
        infowindow.open(self.map, marker);
    },


    focusOnMarker: function (pizzeria) {

        var reference = gmapsHandler;
        if (reference.map !== null) {
            var boundsFocus = new google.maps.LatLngBounds();

            //hide all markers besides the selected
            for (var i = 0; i < reference.markerList.length; i++) {
                if (pizzeria === "All pizzeria") {
                    reference.largeInfowindow.close();
                    reference.markerList[i].setVisible(true);
                    reference.markerList[i].setAnimation(null);
                    // reload the bound
                    boundsFocus.extend(reference.markerList[i].position);
                }
                else {
                    if (pizzeria.title === (reference.markerList[i].title)) {
                        reference.markerList[i].setVisible(true);
                        // reload the bound
                        boundsFocus.extend(reference.markerList[i].position);
                        //animate it
                        gmapsHandler.toggleBounce(reference.markerList[i]);
                        //show the info
                        reference.populateInfoWindow(reference.markerList[i], reference.largeInfowindow);
                    } else {
                        reference.markerList[i].setVisible(false);
                    }
                }
            }


            // if none has been selected, reloads the bound and show them all
            reference.map.fitBounds(boundsFocus);
        }
    },


    populateInfoWindow: function (marker, infowindow) {
        var self = this;

        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {

            infowindow.marker = marker;
            var boundsFocus = new google.maps.LatLngBounds();
            // reload the bound
            boundsFocus.extend(marker.position);

            var request = {
                placeId: marker.place_id
            };
            self.service.getDetails(request, ((result, status) => self.loadInfo(result, status, marker, infowindow)));
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function () {
                infowindow.setMarker = null;
                marker.setIcon(null);
                self.focusOnMarker("All pizzeria");

            });
            self.map.fitBounds(boundsFocus);


        }
    },
    init: function () {
        var self = this;
        //we need to handle async data to knockout
        ko.options.deferUpdates = true;
        
        //ViewModel Initiation
        ko.applyBindings(new viewModel());

        //obtain weather data!
        this.getWeather();
        //https://review.udacity.com/#!/rubrics/17/view


        // -> dropdown menu that filters the map markers
        // https://github.com/udacity/ud864/blob/master/Project_Code_3_WindowShoppingPart1.html
        // -> Clicking a location on the list displays unique information about the location, and animates its associated map marke

        self.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 20,
            center: {
                lat: -19.9132519,
                lng: -43.9734332
            }
        });
        self.service = new google.maps.places.PlacesService(self.map);
        self.largeInfowindow = new google.maps.InfoWindow();
        self.bounds = new google.maps.LatLngBounds();




        var i = 0;
        data.locations.forEach(function (element) {
            var marker = new google.maps.Marker({
                map: self.map,
                position: element.location,
                title: element.title,
                animation: google.maps.Animation.DROP,
                place_id: element.place_id
            });
            $.ajax({
                url: "https://api.foursquare.com/v2/venues/"+ element.foursquare_id +"?client_id=TUZV0ET1ASDYJDXTMAI1OFECNFGGTSTU3201V1X05MNP0RIR&client_secret=IRVOT1LJ3EUWB14UMIN4KKZQRXQS2SKD0NLP5DVX254B5CEU&v=20500909"
            }).done(function (result) {
                console.log(result.response);
               data.loadRating(result,true);
            }).fail(function () {
                data.loadRating(result,false);  
            });
            self.markerList.push(marker);
            marker.addListener('click', function () {
                self.populateInfoWindow(this, self.largeInfowindow);
            i += 1;
            
            });
            self.bounds.extend(marker.position);

        });
        // Extend the boundaries of the map for each marker
        self.map.fitBounds(self.bounds);

    }

};





