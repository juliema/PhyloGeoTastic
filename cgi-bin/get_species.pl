#!/usr/bin/perl

use warnings;
use strict;
use CGI;

use constant IS_CGI => exists $ENV{'REQUEST_URI'};
if (IS_CGI) {
    use lib '/home/gjuggler/perl5/lib/perl5';
}

use CGI::Carp qw(warningsToBrowser fatalsToBrowser);
use LWP::UserAgent;
use JSON;
use Getopt::Long;
use Data::Dumper;
use HTML::TreeBuilder::XPath;

my $http = LWP::UserAgent->new();
my $cgi  = CGI->new();

my $latitude      = 40;
my $longitude     = -109;
my $radius        = 1000;
my $ne_latitude   = 50;
my $ne_longitude  = -100;
my $service       = 'mapoflife';
my $species_group = 'birds';


if (IS_CGI) {
  $latitude      = $cgi->param('latitude')      if $cgi->param('latitude');
  $longitude     = $cgi->param('longitude')     if $cgi->param('longitude');
  $ne_latitude   = $cgi->param('ne_latitude')   if $cgi->param('ne_latitude');
  $ne_longitude  = $cgi->param('ne_longitude')  if $cgi->param('ne_longitude');
  $service       = $cgi->param('service')       if $cgi->param('service');
  $species_group = $cgi->param('species_group') if $cgi->param('species_group');

} else {
  my $getopt_success = GetOptions(
    'latitude=s'      => \$latitude,
    'longitude=s'     => \$longitude,
    'ne_latitude=s'   => \$ne_latitude,
    'ne_longitude=s'  => \$ne_longitude,
    'radius=s'        => \$radius,
    'service=s'       => \$service,
    'species_group=s' => \$species_group
  );
  die "Bad options" unless $getopt_success;
}

my @species;

if ( $service eq 'inaturalist' ) {
  search_inaturalist( $latitude, $longitude, $ne_latitude, $ne_longitude );

} elsif ( $service eq 'mapoflife' ) {
  search_map_of_life( $latitude, $longitude, $radius );

} elsif ( $service eq 'iucn' ) {

} elsif ( $service eq 'lampyr' ) {
  search_lampyr( $latitude, $longitude )

}

sub search_inaturalist {
  my @namearray = ();
  my %specieshash;

  print $cgi->header( -status => 200, -type => 'application/json' ) if IS_CGI;

  # Massage the species group into something good.
  my $taxon_name;
  if ( $species_group eq 'birds' ) {
    $taxon_name = 'Aves';
  } elsif ( $species_group eq 'fishes' ) {
    $taxon_name = 'Actinopterygii';
  } elsif ( $species_group eq 'mammals' ) {
    $taxon_name = 'Mammalia';
  } elsif ($species_group eq 'plants') {
      $taxon_name = 'Plantae';
  }

  my %params = (
    swlat         => $latitude,
    swlng         => $longitude,
    nelat         => $ne_latitude,
    nelng         => $ne_longitude,
    per_page      => 200
  );

  if ( $taxon_name ne '' ) {
    $params{taxon_name} = $taxon_name;
  }

  my @all_results;
  my $page = 1;
  my $n    = 999;
  my $max_results = 400;

  do {
    #print "FETCHING PAGE $page\n";
    $params{page} = $page;
    my $url = URI->new("http://www.inaturalist.org/observations.json");
    $url->query_form(%params);
    my $response = $http->get($url);
    fatal( $response->status_line, IS_CGI, 500 ) unless ( $response->is_success );
    my $text     = $response->decoded_content();
    my $arrayref = decode_json($text);
    push @all_results, @$arrayref;

    $n = scalar(@$arrayref);
    $page++;
  } while ( $n > 0 && scalar(@all_results) < $max_results );

  my @species;
  foreach my $row (@all_results) {

    #print Dumper($row);

    if ( $row->{taxon} && $row->{taxon}->{rank} eq 'species' ) {
      my $data = {
        taxon_name  => $row->{taxon}->{name},
        common_name => $row->{species_guess},
      };
      if ( $row->{photos} && $row->{photos}->[0] ) {
        $data->{thumbnail} = $row->{photos}->[0]->{thumb_url};
      }
      push @species, $data;
    }
  }
  print encode_json( \@species ) . "\n";
}

sub search_map_of_life {
  my ( $lat, $lng, $r ) = @_;

  # Massage the species group into something good.
  my $taxon_name;
  if ( $species_group eq 'birds' ) {
    $taxon_name = 'jetz_maps';
  } elsif ( $species_group eq 'mammals' ) {
    $taxon_name = 'iucn_mammals';
  } elsif ( $species_group eq 'amphibians' ) {
    $taxon_name = 'iucn_amphibians';
  } elsif ( $species_group eq 'fishes' ) {
    $taxon_name = 'na_fish';
  }

  my @namearray = ();
  my %specieshash;

  my $tnrs_url =
    "http://mol.cartodb.com/api/v2/sql?q=SELECT%20*%20FROM%20get_species_list('$taxon_name',$lng,$lat,$r,'')&_=1359475900848&format=json";
  my $request_url = URI->new($tnrs_url);
  my $response    = $http->get($request_url);

  fatal( $response->status_line, IS_CGI, 500 ) unless ( $response->is_success );

  my $text     = $response->decoded_content();
  my $hashref = decode_json($text);
  my $arrayref = $hashref->{rows};
  my @species;
  foreach my $result (@$arrayref) {
      my $common_name = $result->{english};
      if ($common_name) {
          my @toks = split(', ', $common_name);
          $common_name = $toks[0];
      }
    push @species, {
      taxon_name  => $result->{scientificname},
      common_name => $common_name,
      thumbnail   => $result->{thumbsrc}
      };
  }

  print $cgi->header( -status => 200, -type => 'application/json' ) if IS_CGI;
  print encode_json( \@species ) . "\n";
}

sub search_lampyr {
  my ( $latitude, $longitude ) = @_;

  print $cgi->header( -status => 200, -type => 'application/json' ) if IS_CGI;

  #print $cgi->header( -status => 200, -type => 'text/plain' ) if IS_CGI;

  my %params = (
    lat    => $latitude,
    lon    => $longitude,
    common => 'yes',
    N      => 100,
    submit => 'submit-value'
  );
  my $url = URI->new("http://www.lampyr.org/app/getNClosestTaxonIDSpeciesCommon.php");
  $url->query_form(%params);
  my $response = $http->get($url);

  fatal( $response->status_line, IS_CGI, 500 ) unless ( $response->is_success );

  my $text = $response->content;

  #print "CONTENT: $text\n";
  my $tree = HTML::TreeBuilder::XPath->new;
  $tree->parse_content($text);
  my @nodes = $tree->findnodes(q{//li/a});

  my @species;
  foreach my $node (@nodes) {
    my $object           = {};
    my @content          = $node->content_list();
    my $seen_common_name = 0;
    foreach my $el (@content) {
      if ( ref($el) ) {
        if ( $el->tag eq 'i' ) {
          $object->{taxon_name} = $el->as_text;
        }
      } else {
        if ( !$seen_common_name ) {
          my $str = $el;
          $str =~ s/^\s+//g;
          $object->{common_name} = $str;
          $seen_common_name = 1;
        }
      }
    }
    push @species, $object;
  }

  print encode_json( \@species ) . "\n";
}

# a 'die' method that works in both CGI and commandline context
sub fatal {
  my ( $msg, $is_cgi, $http_status ) = @_;
  if ($is_cgi) {
    $http_status ||= 500;
    print CGI->header( -status => $http_status, -type => 'text/plain' );
    print $msg;
    exit 0;
  } else {
    die "$msg\n";
  }
}
