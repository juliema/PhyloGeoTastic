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
use HelperMethods;
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

    --latitude <Number>           Latitude of the center point to search
    --longitude <Number>      Longitude of the center point to search
    --radius <Number>         Radius around which to search
    --service <String>         Which service to use (options: "inaturalist", "mapoflife")
    --help                 show this help message

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
my $service = 'inaturalist';
my $help_opt = 0;

my $cgi = CGI->new();

if (IS_CGI) {
    $latitude = $cgi->param('latitude') if $cgi->param('latitude');
    $longitude = $cgi->param('longitude') if $cgi->param('longitude');
    $service = $cgi->param('service') if $cgi->param('service');
} else {
    my $getopt_success = GetOptions(
        'latitude=s' => \$latitude,
        'longitude=s' => \$longitude,
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

if ($service eq 'inaturalist') {
    INFO(sprintf('Fetching species list from iNaturalist...'));
}

print $cgi->header(-status => 200, -type => 'text/plain') if IS_CGI;
print "DONE!";

#----------------------------------------------------------------------
# helper routines
#----------------------------------------------------------------------

sub search_inaturalist {
  my $query = shift;

}

sub search_map_of_life {
  my $query = shift;
}
