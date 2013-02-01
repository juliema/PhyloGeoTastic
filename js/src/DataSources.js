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
        'iNaturalist.org'].join(''),
      infoPanel: ['<p>',
        'The database <a href="http://inaturalist.org">iNaturalist</a> ',
        'contains observations recorded by naturalists around the world.',
        '</p>',
        'Use the map tools to draw a box around any area. Optionally select a species group to filter your results.',
        '</p>'].join(''),
      allowedSpeciesFilters: [
        'birds', 'fishes', 'mammals', 'plants']
    },
/*    {
      id: 'mapoflife',
      label: 'Map of Life',
      resourceLabel: 'Map of Life',
      selectionType: 'circle',
      description: 'Find species recorded in the Map of Life project',
      infoPanel: '',
      allowedSpeciesFilters: [
        'birds', 'mammals', 'amphibians', 'fishes']
    },
*/
    {
      id: 'lampyr',
      label: 'GBIF',
      resourceLabel: 'Global Biodiversity Information Facility (GBIF)',
      selectionType: 'point',
      description: 'Find species locations collected from museum records and other sources around the world',
      infoPanel: ['<p>',
        'The Global Biodiversity Information Facility (<a href="http://www.gbif.org/">GBIF</a>) database contains',
        'species that scientists have been found in a given area.',
        '</p>',
        '<p>Use the map tools to drop a marker in your area of interest. We will get a list of the 100 nearest organisms.</p>'].join(''),
      allowedSpeciesFilters: []
    }];
    this.sources = sources;

    sources.forEach(function(source) {
      var button = me.createButton(source.label, 'source-btn');
      source.button = button;
      button.on('click', function(event) {
        me.onDataSourceClick(event, source);
      });
      button.hover(function(event) {
        //console.log("Button hover");
        $(button).popover({
          html: true,
          content: source.description,
          title: source.resourceLabel
        });
        $(button).popover('show');
      },
      function(event) {
        $(button).popover('destroy')
      });
      $(el).append(button);
    });

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
      img: 'img/Wolf_Icon.png'
    },
    //    {
    //      id: 'fishes',
    //      label: 'Fishes',
    //      img: 'img/Fish_Icon.png'
    //    },
    {
      id: 'birds',
      label: 'Birds',
      img: 'img/BlackHawkEagle_Icon.png'
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
    this.species = species;

    species.forEach(function(spec) {
      var button = me.createButton('', 'species-btn', spec.img);
      spec.button = button;

      button.hover(function(event) {
        var msg = 'Search for ' + spec.label;
        var title = spec.label;
        if (button.hasClass('disabled')) {
          var curSource = Phylotastic.DataSources.currentSource;
          msg = 'This filter does not work with ' + curSource.label;
          title = 'Not Available';
        }
        $(button).popover({
          html: true,
          placement: 'left',
          content: msg,
          title: title
        });
        $(button).popover('show');
      },
      function(event) {
        $(button).popover('destroy')
      });

      button.on('click', function(event) {
        if (!button.hasClass('disabled')) {
          me.onSpeciesClick(event, spec);
        }
      });

      $(el).append(button);
    });

  },

  createButton: function(text, cls, img) {
    var classes = ['btn'];
    if (cls) {
      classes.push(cls);
    }
    var btn = $('<button type="button" class="' + classes.join(' ') + '">' + text + '</button>');
    $(btn).button();

    if (img) {
      var imgEl = $('<img class="btn-img" src="' + img + '">');
      $(imgEl).appendTo(btn);
    }

    return btn;
  }

};
