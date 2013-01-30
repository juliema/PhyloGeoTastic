#!/usr/bin/perl

use strict;
use warnings;

#----------------------------------------------------------------------
# imports
#----------------------------------------------------------------------

use CGI;
use LWP::UserAgent;
use JSON;
use Log::Log4perl qw(:easy);
use File::Spec::Functions qw(catfile);
use Data::DPath qw(dpath);
use File::Slurp;
use Getopt::Long;

#----------------------------------------------------------------------
# constants
#----------------------------------------------------------------------

use constant USAGE => <<HEREDOC;
Usage 1: $0 # run script with default input (shown below)
Usage 2: $0 <species_name_1> [<species_name_2>] ...
    Example: $0 'Rattus rattus' 'Mus musculus' 'Homo sapiens' 'Pan paniscus'

Gets a list of species given a range-based query, using a variety of
external APIs.

    OPTIONS:

    --latitude <Number>       Latitude of the center point to search (or, when using iNaturalist, the latitude of the SW corner)
    --longitude <Number>      Longitude of the center point to search (or, when using iNaturalist, the longitude of the SW corner)
    --radius <Number>         Radius around which to search (only applicable if using map of life)
    --ne_latitude <Number>    Latitude of the NE corner (only applicable if using iNaturalist)
    --ne_longitude <Number>   Longitude of the NE corner (only applicable if using iNaturalist)
    --service <String>        Which service to use (options: "inaturalist", "mapoflife")
    --help                    Show this help message

INVOKING THROUGH CGI:

When invoking this script through CGI, provide the options as
key-value parameters. Either HTTP GET or HTTP POST may be used for the
invocation.

HEREDOC

use constant IS_CGI => exists $ENV{'GATEWAY_INTERFACE'};
use constant URL_PREFIX => 'http://phylotastic-wg.nescent.org/~mg229/cgi-bin/';

#----------------------------------------------------------------------
# global vars
#----------------------------------------------------------------------

my $json_parser = JSON->new();
my $http = LWP::UserAgent->new();

#----------------------------------------------------------------------
# logging
#----------------------------------------------------------------------

# For debugging when owner of this script does not have read access to apache log.
#close STDERR or HelperMethods::fatal($!, IS_CGI, 500);         
#open STDERR, '>>/home/ben/temp/cgi.log' or HelperMethods::fatal($!, IS_CGI, 500);

Log::Log4perl::easy_init(IS_CGI ? $WARN : $INFO);

#----------------------------------------------------------------------
# argument processing
#----------------------------------------------------------------------

my $latitude = 40;
my $longitude = -109;
my $radius = 10;
my $ne_latitude = 50;
my $ne_longitude = -100;
my $service = 'inaturalist';
my $help_opt = 0;

my $cgi = CGI->new();

if (IS_CGI) {
    $latitude = $cgi->param('latitude') if $cgi->param('latitude');
    $longitude = $cgi->param('longitude') if $cgi->param('longitude');
    $ne_latitude = $cgi->param('ne_latitude') if $cgi->param('ne_latitude');
    $ne_longitude = $cgi->param('ne_longitude') if $cgi->param('ne_longitude');
    $service = $cgi->param('service') if $cgi->param('service');
} else {
    my $getopt_success = GetOptions(
        'latitude=s' => \$latitude,
        'longitude=s' => \$longitude,
        'ne_latitude=s' => \$ne_latitude,
        'ne_longitude=s' => \$ne_longitude,
        'radius=s' => \$radius,
        'service=s' => \$service,
        'help' => \$help_opt,
        );
    die USAGE unless $getopt_success;
    if ($help_opt) {
        warn USAGE; 
        exit 0;
    }
}

#----------------------------------------------------------------------
# main
#----------------------------------------------------------------------

my @species;

if ($service eq 'inaturalist') {
   INFO(sprintf('Fetching species list from iNaturalist...'));

   @species = search_inaturalist($latitude, $longitude, $ne_latitude, $ne_longitude);

} elsif ($service eq 'mapoflife') {
   INFO(sprintf('Fetching species list from map of life...'));

   @species = search_map_of_life($latitude, $longitude, $radius);
}

print $cgi->header(-status => 200, -type => 'text/plain') if IS_CGI;

#@species = ('Mus musculus', 'Homo sapiens');

output_species(@species);


#----------------------------------------------------------------------
# helper routines
#----------------------------------------------------------------------


# Prints the given list of species, separated by newlines.
sub output_species {
  my @species = @_;
  foreach my $s (@species) {
    print $s."\n";
  }
}

sub search_inaturalist {
    my ($latitude, $longitude, $ne_longitude, $ne_longitude) = @_;

    # CODE TO FETCH SPECIES FROM INATURALIST GOES HERE

}

sub search_map_of_life {
  my ($latitude, $longitude, $radius) = @_;

  # CODE TO FETCH SPECIES FROM MAP OF LIFE GOES HERE

}

# a 'die' method that works in both CGI and commandline context
sub fatal {
    my ($msg, $is_cgi, $http_status) = @_; 
    if ($is_cgi) {
        $http_status ||= 500;
        print CGI->header(-status => $http_status, -type => 'text/plain');
        print $msg;
        exit 0;
    } else {
        die "$msg\n";
    }
}
