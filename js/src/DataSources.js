Phylotastic.DataSources = {

  currentSource: undefined,
  currentSpecies: undefined,

  createExamplesUI: function(el) {
    var me = this;

    var learnMore = ' <a target="_blank" href="https://docs.google.com/document/d/1vQ1sNOkwUPtJsiN7TSV0EIxPQ0PhinPM_flvs_RNHtU/edit">Click here to learn more</a>';

    var examples = [{
      db: 'inaturalist',
      species: 'birds',
      type: 'rectangle',
      latitude: 39.9518,
      longitude: -111.3354,
      ne_latitude: 40.96330,
      ne_longitude: -109.22607,
      zoomLevel: 6,
      label: 'Mountain Adaptations',
      description_short: 'Explore the relationships between birds living at high elevations in the mountains of northern Utah.',
      description_long: '<b>Mountain Adaptations</b>: Life at higher elevations is likely to be more stressful for birds due to colder temperatures and lack of oxygen.' + learnMore,
    },
    {
      db: 'inaturalist',
      species: 'mammals',
      type: 'rectangle',
      latitude: -25.7998,
      longitude: 34.4091796875,
      ne_latitude: -15.792253,
      ne_longitude: 50.0537109,
      zoomLevel: 4,
      label: 'Island Radiations',
      description_short: 'Explore the biodiversity within Madagascar and the nearby continental shores of mainland Africa.',
      description_long: '<b>Island Radiations</b>: Animals that get isolated on islands sometime radiate on that island where one or just a few lineages will form the majority of the diversity on that island.' + learnMore,
    },
    {
      db: 'inaturalist',
      species: 'plants',
      type: 'rectangle',
      latitude: 24.8066,
      longitude: -82.496,
      ne_latitude: 26.9416,
      ne_longitude: -79.4860,
      zoomLevel: 5,
      label: 'Evolution of Communities',
      description_short: 'Compare the tree of life in two very different habitats.',
      description_long: '<b>Evolution of Communities</b>: Phylogenetic trees can give us a different perspective of communities. Use PhyloGeoTastic to compare the phylogenetic structure of plants identified in Florida and New Mexico.' + learnMore,
    }];

    var buffer = [];
    examples.forEach(function(example) {
      var link = $('<a class="pgt-demo-link">' + example.label + '</a>');
      link.on('click', function(event) {
        me.onExampleClick(event, example);
      });
      link.hover(function(event) {
        $(link).popover({
          html: true,
          content: example.description_short,
          title: example.label
        });
        $(link).popover('show');
      },
      function(event) {
        $(link).popover('destroy');
      });
      buffer.push(link);
    });

    for (var i = 0; i < buffer.length; i++) {
      $(el).append(buffer[i]);
      if (i < buffer.length - 1) {
        $(el).append('<span>, </span>');
      }
    }
  },

  onExampleClick: function(event, example) {
    // Get the right source.
    this.currentSource = this.getSourceById(example.db);
    this.currentSpecies = this.getSpeciesById(example.species);

    Phylotastic.DataSources.onDataSourceClick(null, this.currentSource);
    Phylotastic.DataSources.onSpeciesClick(null, this.currentSpecies);

    $('#infopanel').html(example.description_long);

    //Phylotastic.App.updateMapToSource();
    var bounds;
    if (example.type === 'circle') {
      Phylotastic.Maps.setCircle(example);
    } else if (example.type === 'point') {
      Phylotastic.Maps.setPoint(example);
    } else {
      Phylotastic.Maps.setRect(example);
    }
  },

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
        'The Global Biodiversity Information Facility (<a href="http://www.gbif.org/">GBIF</a>) database contains ',
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

  getSourceById: function(id) {
    var source;
    this.sources.forEach(function(x) {
      if (x.id === id) {
        source = x;
      }
    });
    return source;
  },

  getSpeciesById: function(id) {
    var species;
    this.species.forEach(function(x) {
      if (x.id === id) {
        species = x;
      }
    });
    return species;
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
