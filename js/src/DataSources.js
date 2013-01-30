Phylotastic.DataSources = {

  currentSource: undefined,

  createDataSourceUI: function(el) {
    var me = this;
    var sources = [{
      id: 'inaturalist',
      label: 'Observations',
      selectionType: 'rectangle',
      description: 'Find observations reported by citizen scientists from iNaturalist.org',
    },
    {
      id: 'iucn',
      label: 'Threatened Species',
      selectionType: 'country-species',
      description: 'Find species that are threatened or endangered on the IUCN Red List',
    },
    {
      id: 'lampyr',
      label: 'Museum Records',
      selectionType: 'point',
      description: 'Find species collected from museum records around the world',
    }];

    sources.forEach(function(source) {
      var button = me.createButton(source.label, 'source-btn');
      source.button = button;
      button.on('click', function(event) {
        me.onDataSourceClick(event, source);
      });
      $(el).append(button);
    });

    this.onDataSourceClick(null, sources[0]);
  },
  onDataSourceClick: function(event, source) {
    var button = source.button;
    $('.source-btn.active').button('toggle');
    button.button('toggle');

    this.currentSource = source;
    Phylotastic.App.updateMapToSource();
  },

  onSpeciesClick: function(event, species) {
    this.currentSpecies = species;
    Phylotastic.App.updateMapToSpecies();
  },

  createSpeciesSourceUI: function(el) {
    var me = this;
    var sources = [{
      id: 'mammals',
      label: 'Mammals',
    },
    {
      id: 'fishes',
      label: 'Fishes'
    },
    {
      id: 'birds',
      label: 'Birds'
    }];

    sources.forEach(function(source) {
      var button = me.createButton(source.label, 'species-btn');

      button.on('click', function(event) {
        me.onSpeciesClick(event, source.id);
      });

      $(el).append(button);
    });
  },

  createButton: function(text, cls) {
    var classes = ['btn'];
    if (cls) {
      classes.push(cls);
    }
    var btn = $('<button type="button" class="' + classes.join(' ') + '">' + text + '</button>');
    $(btn).button();
    return btn;
  }

};
