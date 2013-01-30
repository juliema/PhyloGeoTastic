Phylotastic.App = {};

$().ready(function() {
  var el = $('#map');
  Phylotastic.Maps.insertMap(el[0]);
  //Phylotastic.Maps.setCircularSelection();

  Phylotastic.Maps.centerOnCountry('United States');
});
