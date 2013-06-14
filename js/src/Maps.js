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
      zoomControl: true,
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

    google.maps.event.addListener(drawingManager, 'overlaycomplete', Phylotastic.Utils.bind(this.onShapeEvent, this));

    drawingManager.setMap(this.map);

    var geocoder = geocoder = new google.maps.Geocoder();
    this.geocoder = geocoder;
  },

  getMarkerParams: function(marker) {
    var me = this;
    var lat = marker.getPosition().lat();
    var lng = marker.getPosition().lng();
    return {
      latitude: lat,
      longitude: lng
    };
  },

  getCircleParams: function(circle) {
    var radius = circle.getRadius();
    var center = circle.getCenter();
    return {
      latitude: center.lat(),
      longitude: center.lng(),
      radius: radius
    };
  },

  getRectParams: function(rect) {
    var bounds = rect.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();
    return {
      latitude: sw.lat(),
      longitude: sw.lng(),
      ne_latitude: ne.lat(),
      ne_longitude: ne.lng()
    };
  },

  setCurrentParams: function(params) {
    this.currentParams = params;
    console.log("Cur params: ", params);
  },

  setPoint: function(params) {
    var me = this;
    this.setPointSelection();
    var pointOptions = {
      position: new google.maps.LatLng(params.latitude, params.longitude),
      map: this.map,
      editable: true
    };
    var marker = new google.maps.Marker(pointOptions);
    this.currentOverlay = marker;

    me.setCurrentParams(me.getMarkerParams(marker));

    this.map.panTo(marker.getPosition());
    this.map.setZoom(params.zoomLevel);
    this.drawingManager.setOptions({
      drawingMode: null
    });
  },

  setCircle: function(params) {
    var me = this;

    this.setCircularSelection();
    var circleOptions = {
      center: new google.maps.LatLng(params.latitude, params.longitude),
      radius: params.radius,
      map: this.map,
      editable: true
    };
    var circle = new google.maps.Circle(circleOptions);
    google.maps.event.addListener(circle, 'radius_changed', function() {
      me.setCurrentParams(me.getCircleParams(circle));
    });
    google.maps.event.addListener(circle, 'center_changed', function() {
      me.setCurrentParams(me.getCircleParams(circle));
    });

    me.setCurrentParams(me.getCircleParams(circle));

    this.currentOverlay = circle;
    if (params.zoomLevel) {
      this.map.panTo(circle.getBounds());
      this.map.setZoom(params.zoomLevel);
    } else {
      this.map.panToBounds(circle.getBounds());
    }
    this.drawingManager.setOptions({
      drawingMode: null
    });
  },

  setRect: function(params) {
    var me = this;
    this.setRectangularSelection();
    var rectOptions = {
      map: this.map,
      bounds: new google.maps.LatLngBounds(
        new google.maps.LatLng(params.latitude, params.longitude),
        new google.maps.LatLng(params.ne_latitude, params.ne_longitude)),
      editable: true
    };
    var rect = new google.maps.Rectangle(rectOptions);
    google.maps.event.addListener(rect, 'bounds_changed', function() {
      me.setCurrentParams(me.getRectParams(rect));
    });

    me.setCurrentParams(me.getRectParams(rect));

    this.currentOverlay = rect;
    if (params.zoomLevel) {
      this.map.fitBounds(rect.getBounds());
      this.map.setZoom(params.zoomLevel);
    } else {
      this.map.fitBounds(rect.getBounds());
    }
    this.drawingManager.setOptions({
      drawingMode: null
    });
  },

  onShapeEvent: function(event) {
    var me = this;
    var drawingManager = me.drawingManager;

    if (me.currentOverlay !== undefined) {
      me.currentOverlay.setMap(null);
      delete me.currentOverlay;
    }
    if (event.type === google.maps.drawing.OverlayType.CIRCLE) {
      var circle = event.overlay;
      me.setCurrentParams(me.getCircleParams(circle));
      google.maps.event.addListener(circle, 'radius_changed', function() {
        me.setCurrentParams(me.getCircleParams(circle));
      });
      google.maps.event.addListener(circle, 'center_changed', function() {
        me.setCurrentParams(me.getCircleParams(circle));
      });
    } else if (event.type === google.maps.drawing.OverlayType.RECTANGLE) {
      var rect = event.overlay;
      me.setCurrentParams(me.getRectParams(rect));
      google.maps.event.addListener(rect, 'bounds_changed', function() {
        me.setCurrentParams(me.getRectParams(rect));
      });
    } else {
      var lat = event.overlay.position.lat();
      var lng = event.overlay.position.lng();
      me.currentParams = {
        latitude: lat,
        longitude: lng
      };
    }

    drawingManager.setOptions({
      drawingMode: null
    });
    me.currentOverlay = event.overlay;
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
  },

  setPointSelection: function() {
    this.clearOverlays();
    this.drawingManager.setOptions({
      drawingMode: google.maps.drawing.OverlayType.MARKER,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [google.maps.drawing.OverlayType.MARKER]
      }
    });
  },

  setCountrySelection: function() {
    this.clearOverlays();
    this.drawingManager.setOptions({
      drawingMode: null,
      drawingControl: false,
    });
  },

  clearOverlays: function() {
    var me = this;
    if (me.currentOverlay !== undefined) {
      me.currentOverlay.setMap(null);
      delete me.currentOverlay;
    }
  },

};
