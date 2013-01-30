Phylotastic.Maps = {

  insertMap: function(el) {
    var me = this;
    var mapOptions = {
      zoom: 3,
      maxZoom: 10,
      minZoom: 1,
      minLat: -85,
      maxLat: 85,
      mapTypeControl: false,
      panControl: false,
      zoomControl: false,
      streetViewControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };
    this.map = new google.maps.Map(el, mapOptions);

    var drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
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

    var geocoder = geocoder = new google.maps.Geocoder();
    this.geocoder = geocoder;
  },

  centerOnCountry: function(country) {
    var me = this;
    me.geocoder.geocode({
      'address': country
    },
    function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        me.map.setCenter(results[0].geometry.location);
      }
    });
  },

  setRectangularSelection: function() {
    this.drawingManager.setOptions({
      drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [google.maps.drawing.OverlayType.RECTANGLE]
      }
    });
  },

  setCircularSelection: function() {
    this.drawingManager.setOptions({
      drawingMode: google.maps.drawing.OverlayType.CIRCLE,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [google.maps.drawing.OverlayType.CIRCLE]
      }
    });
  }

};
