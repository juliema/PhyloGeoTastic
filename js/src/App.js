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

  sendApiQuery: function() {
    var me = this;

    var script = 'get_species.pl';
    var source = Phylotastic.DataSources.currentSource;

    // Get the map parameters to send to the server-side script.
    var mapParams = Phylotastic.Maps.currentParams || {};
    var params = {
      service: source.id,
    };
    params = Phylotastic.Utils.extend(params, mapParams);

    $('#speciesWaiting .speciesWaitingSource').text(source.label);
    $('#speciesWaiting').modal({
      show: true
    });

    $.ajax({
      url: this.serverBaseUrl + script,
      data: params,
      success: function(data, status, jqXhr) {
        var tokens = data.split(/\n/);

        var gotText = [
          '<p>Found ' + tokens.length + ' species!</p>',
          '<p>Contacting Phylo<em>tastic</em> to extract their evolutionary relationships...</p>', ].join('');
        $('#speciesWaiting .modal-body').html(gotText);

        me.sendPhyloTasticQuery(tokens);
      }
    });
  },

  sendPhyloTasticQuery: function(species) {
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

  //serverBaseUrl: 'http://phylotastic-wg.nescent.org/~mg229/cgi-bin/'
  serverBaseUrl: 'http://localhost/~greg/pgt/cgi-bin/',
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
