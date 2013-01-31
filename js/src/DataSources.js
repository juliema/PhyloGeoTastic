Phylotastic.DataSources = {

  currentSource: undefined,
  currentSpecies: undefined,

  createDataSourceUI: function(el) {
    var me = this;
    var sources = [{
      id: 'inaturalist',
      label: 'Citizen Observations',
      resourceLabel: 'iNaturalist',
      selectionType: 'rectangle',
      description: 'Find observations reported by citizen scientists from iNaturalist.org',
    },
    {
      id: 'mapoflife',
      label: 'Map of Life',
      resourceLabel: 'Map of Life',
      selectionType: 'circle',
      description: 'Find species that are threatened or endangered on the IUCN Red List',
    },
    {
      id: 'lampyr',
      label: 'Geolocated Museum Records',
      resourceLabel: 'GBIF',
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
    var button = species.button;
    $('.species-btn.active').button('toggle');
    button.button('toggle');

    this.currentSpecies = species;
    Phylotastic.App.updateMapToSpecies();
  },

  createSpeciesSourceUI: function(el) {
    var me = this;
    var species = [{
      id: 'mammals',
      label: 'Mammals',
      img: 'img/wolf_icon.png'
    },
    {
      id: 'fishes',
      label: 'Fishes',
      img: 'img/fish_icon.png'
    },
    {
      id: 'birds',
      label: 'Birds',
      img: 'img/BlackHawkEagle_icon.png'
    },
    {
      id: 'plants',
      label: 'Plants',
      img: 'img/Plant_Icon.png'
    },
    ];

    species.forEach(function(spec) {
      var button = me.createButton('', 'species-btn', spec.img);
      spec.button = button;

      button.on('click', function(event) {
        me.onSpeciesClick(event, spec);
      });

      $(el).append(button);
    });

    this.onSpeciesClick(null, species[0]);
  },

  createButton: function(text, cls, img) {
    var classes = ['btn'];
    if (cls) {
      classes.push(cls);
    }
    var btn = $('<button type="button" class="' + classes.join(' ') + '">' + text + '</button>');
    $(btn).button();

    if (img) {
      var imgEl = $('<img class="btn-img" src="'+img+'">');
      $(imgEl).appendTo(btn);
    }

    return btn;
  }

};
