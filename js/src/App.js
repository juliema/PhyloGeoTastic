Phylotastic.App = {

  updateMapToSource: function() {
    var curSource = Phylotastic.DataSources.currentSource;
    var selectionType = curSource.selectionType;

    switch (selectionType) {
    case 'point':
      Phylotastic.Maps.setPointSelection();
      break;
    case 'circle':
      Phylotastic.Maps.setCircularSelection();
      break;
    case 'rectangle':
      Phylotastic.Maps.setRectangularSelection();
      break;
    case 'country-species':
      Phylotastic.Maps.setCountrySelection();
      break;
    }
  },

  updateMapToSpecies: function() {},

  getWaitingHtml: function() {
    var source = Phylotastic.DataSources.currentSource;
    return[
    '<div class="modal-header">',
    '  <h3>Contacting ' + source.resourceLabel + '</h3>',
    '</div>',
    '<div class="modal-body">',
    '  <p>',
    'Communicating with ' + source.resourceLabel + ' to find species within',
    ' the map area you selected.',
    '  </p>',
    '  <p>This may take a while, please be patient.</p>',
    '</div>'].join('');
  },

  sendApiQuery: function() {
    var me = this;

    var script = 'get_species.pl';
    var source = Phylotastic.DataSources.currentSource;
    var species = Phylotastic.DataSources.currentSpecies;

    // Get the map parameters to send to the server-side script.
    var mapParams = Phylotastic.Maps.currentParams || {};
    var params = {
      service: source.id,
      species_group: species.id
    };
    params = Phylotastic.Utils.extend(params, mapParams);
    //console.log("CURRENT PARAMS", params);
    $('#speciesWaiting').html(this.getWaitingHtml());
    $('#speciesWaiting').modal({
      show: true
    });

    $.ajax({
      url: this.serverBaseUrl + script,
      data: params,
      failure: function(jqXhr, error, exception) {

      },
      success: function(data, status, jqXhr) {
        // Get some of the first common names to show the user.
        var species = $(data);

        //console.log("Species", species.length);
        var msg;

        if (species.length > 0) {
          var exampleImages = [];
          var allSpecies = [];
          for (var i = 0; i < species.length; i++) {
            var spec = species[i];
            allSpecies.push(spec.taxon_name);

            if (i < 5) {
              if (spec.thumbnail) {
                exampleImages.push([
                  '<div class="example-image-wrap">',
                  '  <img class="example-image" src="' + spec.thumbnail + '"></img>',
                  '</div>'].join(''));
              } else if (spec.common_name) {
                exampleImages.push([
                  '<div class="example-common-name">',
                  spec.common_name,
                  '</div>'].join(''));
              }
            }
          }

          var exampleText = '';
          if (exampleImages.length > 0) {
            exampleText = [
              '<div class="examples">',
              exampleImages.join(''),
              '</div>'].join('');
          }

          msg = [
            'Found ' + allSpecies.length + ' species!',
            exampleText,
            '<div>To explore their evolutionary relationships, <a href="#" id="send-ptastic-query">click here</a>.</div>'].join('');
        } else {
          msg = '<p>No results found. Try a broader search.</p>';
        }

        $('#speciesWaiting .modal-header').html('Results');
        $('#speciesWaiting .modal-body').html(msg);

        $('#send-ptastic-query').on('click', function() {
          me.sendPhyloTasticQuery(allSpecies);
        });
      }
    });
  },

  sendPhyloTasticQuery: function(species) {
    var contactingNext = [
      '<p>Contacting Phylo<em>tastic</em> to find evolutionary relationships...</p>',
      '<p>This may take a while, please be patient.</p>'
      ].join('');

    $('#speciesWaiting .modal-header').html("<h3>Contacting PhyloTastic</h3>");
    $('#speciesWaiting .modal-body').html(contactingNext);

    var params = {
      species: species.join(';')
    };
    var script = "phylotastic.pl";

    $.ajax({
      url: this.serverBaseUrl + script,
      data: params,
      type: 'POST',
      success: function(data, status, jqXhr) {
        var tree = data;

        var gotText = [
          '<p>GOT YOUR TREE:',
          tree,
          '</p>'].join('');
        $('#speciesWaiting .modal-body').html(gotText);

      }
    });
  },

  serverBaseUrl: 'http://phylotastic-wg.nescent.org/~gjuggler/PhyloGeoTastic/cgi-bin/'
  //serverBaseUrl: 'http://localhost/~greg/pgt/cgi-bin/',
};

$().ready(function() {
  var el = $('#map')[0];
  Phylotastic.Maps.insertMap(el);
  Phylotastic.Maps.centerOnCountry('United States');

  var sourcesEl = $('.sources')[0];
  Phylotastic.DataSources.createDataSourceUI(sourcesEl);

  var speciesEl = $('.species')[0];
  Phylotastic.DataSources.createSpeciesSourceUI(speciesEl);

  var buttonEl = $('.go-button-wrap')[0];
  var goButton = $('<button type="button" class="btn go-btn"></button>').appendTo(buttonEl);
  $(goButton).button();
  $(goButton).on('click', function() {

    Phylotastic.App.sendApiQuery();
  });

});
