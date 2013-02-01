Phylotastic.DataSources = {

  currentSource: undefined,
  currentSpecies: undefined,

  createDataSourceUI: function(el) {
    var me = this;
    var sources = [{
      id: 'inaturalist',
      label: 'iNaturalist',
      resourceLabel: 'iNaturalist',
      selectionType: 'rectangle',
      description: ['Find observations reported by citizen scientists from ',
                    'iNaturalist'].join(''),
      infoPanel: 'Select a rectangular area to search observations submitted to iNaturalist.org',
      allowedSpeciesFilters: [
        'birds', 'fishes', 'mammals', 'plants'
      ]
    },
    {
      id: 'mapoflife',
      label: 'Map of Life',
      resourceLabel: 'Map of Life',
      selectionType: 'circle',
      description: 'Find species recorded in the Map of Life project',
      infoPanel: '',
      allowedSpeciesFilters: [
        'birds', 'mammals', 'amphibians', 'fishes'
      ]
    },
    {
      id: 'lampyr',
      label: 'Museum Records',
      resourceLabel: 'GBIF',
      selectionType: 'point',
      description: 'Find species locations collected from museum records around the world',
      infoPanel: 'Place a marker to search for recorded museum records.',
      allowedSpeciesFilters: [
      ]
    }];

    sources.forEach(function(source) {
      var button = me.createButton(source.label, 'source-btn');
      source.button = button;
      button.on('click', function(event) {
        me.onDataSourceClick(event, source);
      });
      button.hover(function(event) {
        console.log("Button hover");
        $(button).popover({
          html: true,
          content: source.description,
          title: source.resourceLabel  
        });
        $(button).popover('show');
      }, function(event) {
        $(button).popover('destroy')
      });
      $(el).append(button);
    });

    this.onDataSourceClick(null, sources[0]);
  },
  onDataSourceClick: function(event, source) {
    var button = source.button;
    $('.source-btn.active').button('toggle');
    button.button('toggle');

    //console.log(source.infoPanel);
    //$('#infopanel').html('<div>'+source.infoPanel+'</div>'
      //);

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
    {
      id: 'bacteria',
      label: 'Bacteria',
      img: 'img/Bacterium_Icon.png'
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
