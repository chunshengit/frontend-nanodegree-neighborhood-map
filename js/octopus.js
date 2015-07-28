/* Heads up for user if internet connection is lost */
window.addEventListener('load', function(){
    new Heyoffline();
    }, false);

var mapOptions = {
    zoom: 16,
    center: new google.maps.LatLng(37.806389, -122.423611)
}   ;

window.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

/* Collection of points of interests */
var pointsOfInterest = [
  {
    name: 'San Francisco Maritime National Historical Park',
    lat: 37.806389,
    lng: -122.423611,
    url: ''
    },
    {
    name: 'Palace of Fine Arts',
    lat: 37.802778,
    lng: -122.448333,
    url: ''
    },
    {
    name: 'Aquarium of the Bay',
    lat: 37.808755,
    lng: -122.409296,
    url: ''
    },
    {
    name: 'Fort Mason',
    lat: 37.807778,
    lng: -122.429722,
    url: ''
    },
    {
    name: 'Ghirardelli Square',
    lat: 37.805703,
    lng: -122.421794,
    url: ''
    },
    {
    name: 'Fisherman\'s Wharf, San Francisco',
    lat: 37.808333,
    lng: -122.415556,
    url: ''
    },
    {
    name: 'Alcatraz Island',
    lat: 37.82667,
    lng:  -122.423333,
    url: ''
    }
];

/* Create InfoBox Singleton for clicking funciton */
var infoBox = new InfoBox({
    content: "",
    disableAutoPan: false,
    maxWidth: 150,
    pixelOffset: new google.maps.Size(-140, 0),
    zIndex: null,
    boxStyle: {
    background: "url('images/tipbox.gif') no-repeat",
    opacity: 1,
    width: "300px"
    },
    closeBoxMargin: "12px 4px 2px 2px",
    closeBoxURL: "images/close.gif",
    infoBoxClearance: new google.maps.Size(1, 1)
});

/* Data model holding all the info for specific attraction */
var Pin = function Pin(map, name, lat, lng, infobox) {
    var self = this;

    self.name = ko.observable(name);
    self.lat = ko.observable(lat);
    self.lng = ko.observable(lng);
    self.url =  "";
    self.wikipediaContent =ko.observable('<div id="infobox">' +
                                        "Loading Wikipedia...Working hard!" +
                                        '</div>');

    self.marker = new google.maps.Marker({
                        position: new google.maps.LatLng(lat, lng),
                        title: name,
                        map:map
    });

    self.clickOnListItem = function () {
        infoBox.close();
        infoBox.setContent(self.wikipediaContent());
        infoBox.open(map, self.marker);
    };

    google.maps.event.addListener(self.marker, 'click', function() {
        infoBox.close();
        infoBox.setContent(self.wikipediaContent());
        infoBox.open(map, self.marker);
        });
};

/* viewModel tying together all the actions and data */
var viewModel = function (attractions) {
    var self = this;
    self.pins = ko.observableArray([]);

    /* Display markers for each attraction and bound the markers on map */
    var bounds = new google.maps.LatLngBounds();

    attractions.forEach(function(point) {
        self.pins.push(new Pin(window.map, point.name, point.lat, point.lng));
        bounds.extend(new google.maps.LatLng(point.lat, point.lng));
    });

    map.fitBounds(bounds);

    /* Binding function for search */
    self.searchStr = ko.observable("");
    self.searchStr.subscribe(function(newVal) {
        if (newVal || newVal ==="") {
        self.pins().forEach(function(p) {
                p.marker.setVisible(true);
            });
        return "";
        }
        return searchStr;
    });

    self.searchFun = function () {
        self.pins().forEach(function(p) {
            if (p.name().toLowerCase().indexOf(self.searchStr().toLowerCase()) >= 0) {
            p.marker.setVisible(true);
        } else {
            p.marker.setVisible(false);
        }
        });
    };

    /* Loading wikipedia infomation for attraction */
    self.loadWikipedia = (function () {
        self.pins().forEach(function(p) {
            var wikipediaUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + p.name() + '&format=json&callback=wikiCallback';
            var wikiRequestTimeout = setTimeout(function () {
            }, 8000);

            $.ajax({
                url: wikipediaUrl,
                dataType: "jsonp",
                success: function(response) {
                    p.wikipediaContent('<div id="infobox">' +
                                        response[2][0] +
                                        '</div>');
                    p.url = response[3][0];
                    clearTimeout(wikiRequestTimeout);
                },
                /* Error loading the content, set the error message per pin/marker */
                error: function(jqXHR, textStatus, errorThrown ) {
                    p.wikipediaContent('<div id="infobox">' +
                                        "Error Loading Wikipedia, reload the page when network is available" +
                                        '</div>');
                    clearTimeout(wikiRequestTimeout);
                }
            });
        });
    }());
};

ko.applyBindings(new viewModel(pointsOfInterest));


