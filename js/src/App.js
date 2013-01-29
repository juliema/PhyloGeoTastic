Phylotastic.App = {};

$().ready(function() {

  console.log("Phylotastic!");


  var el = $('#map');
  Phylotastic.Maps.insertMap(el[0]);

  Phylotastic.Maps.setCircularSelection();
});
