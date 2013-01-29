Phylotastic.Maps = {

  insertMap: function(el) {
    console.log("Loading a map...");
    var mapOptions = {
      center: new google.maps.LatLng(-34.397, 150.644),
      zoom: 2,
      maxZoom: 10,
      minZoom: 1,
      minLat: -85,
      maxLat: 85,
      mapTypeControl: false,
      panControl: false,
      zoomControl: true,
      streetViewControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      /*
      styles: [{
        "stylers": [{
          "saturation": -65
        },
        {
          "gamma": 1.52
        }]
      },
      {
        "featureType": "administrative",
        "stylers": [{
          "saturation": -95
        },
        {
          "gamma": 2.26
        }]
      },
      {
        "featureType": "water",
        "elementType": "labels",
        "stylers": [{
          "visibility": "off"
        }]
      },
      {
        "featureType": "administrative.locality",
        "stylers": [{
          "visibility": "off"
        }]
      },
      {
        "featureType": "road",
        "stylers": [{
          "visibility": "simplified"
        },
        {
          "saturation": -99
        },
        {
          "gamma": 2.22
        }]
      },
      {
        "featureType": "poi",
        "elementType": "labels",
        "stylers": [{
          "visibility": "off"
        }]
      },
      {
        "featureType": "road.arterial",
        "stylers": [{
          "visibility": "off"
        }]
      },
      {
        "featureType": "road.local",
        "elementType": "labels",
        "stylers": [{
          "visibility": "off"
        }]
      },
      {
        "featureType": "transit",
        "stylers": [{
          "visibility": "off"
        }]
      },
      {
        "featureType": "road",
        "elementType": "labels",
        "stylers": [{
          "visibility": "off"
        }]
      },
      {
        "featureType": "poi",
        "stylers": [{
          "saturation": -55
        }]
      }]
*/
    };

    this.map = new google.maps.Map(el, mapOptions);

    var me = this;

    var drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.CIRCLE,
          google.maps.drawing.OverlayType.RECTANGLE]
      },
      circleOptions: {
        fillColor: '#ffff00',
        fillOpacity: 0.3,
        strokeWeight: 5,
        clickable: true,
        zIndex: 1,
        editable: true
      },
      rectangleOptions: {
        fillColor: '#ffff00',
        fillOpacity: 0.3,
        strokeWeight: 5,
        clickable: true,
        zIndex: 1,
        editable: true
      }
    });
    this.drawingManager = drawingManager;

    google.maps.event.addListener(this.map, 'dragstart', function(event) {
      console.log("Drag start!");
    });

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
      if (me.currentOverlay !== undefined) {
        me.currentOverlay.setMap(null);
        delete me.currentOverlay;
      }
      if (event.type === google.maps.drawing.OverlayType.CIRCLE) {
        var radius = event.overlay.getRadius();
        var center = event.overlay.getCenter();
      } else {
        var bounds = event.overlay.getBounds();
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
      }

      drawingManager.setOptions({
        drawingMode: null
      });
      me.currentOverlay = event.overlay;
    });

    drawingManager.setMap(this.map);
  },

  setRectangularSelection: function() {
    this.drawingManager.setOptions({
      drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,      
        drawingModes: [google.maps.drawing.OverlayType.RECTANGLE]
      }
    });
  },

  setCircularSelection: function() {
    this.drawingManager.setOptions({
      drawingMode: google.maps.drawing.OverlayType.CIRCLE,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,      
        drawingModes: [google.maps.drawing.OverlayType.CIRCLE]
      }
    });
  }

};
