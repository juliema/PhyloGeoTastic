#!usr/bin/perl

use warnings;
use strict;
use CGI;
use LWP::UserAgent;
use Text::CSV;
use Parse::CSV;
use JSON;
use Log::Log4perl qw(:easy);
use File::Spec::Functions qw(catfile);
use Data::DPath qw(dpath);
use File::Slurp;
use Getopt::Long;

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
my $http = LWP::UserAgent->new();
my $latitude = 40;
my $longitude = -109;
my $radius = 1000;
my $ne_latitude = 50;
my $ne_longitude = -100;
#my $service = 'inaturalist';
my $service = 'mapoflife';
my $help_opt = 0;
my $each;
my $cgi = CGI->new();
my @array_ref;
my @namearray;
my %specieshash;
my $species;

open OUT , ">Unclean_Names.txt";
use constant IS_CGI => exists $ENV{'GATEWAY_INTERFACE'};

if (IS_CGI) {
    $latitude = $cgi->param('latitude') if $cgi->param('latitude');
    $longitude = $cgi->param('longitude') if $cgi->param('longitude');
    $ne_latitude = $cgi->param('ne_latitude') if $cgi->param('ne_latitude');
    $ne_longitude = $cgi->param('ne_longitude') if $cgi->param('ne_longitude');
    $service = $cgi->param('service') if $cgi->param('service');
} 

else {
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

# Prints the given list of species, separated by newlines.
sub output_species {
    my @species = @_;
    foreach my $s (@species) {
    print $s."\n";
  }
}


sub search_inaturalist {
#    my ($latitude, $longitude, $ne_longitude, $ne_latitude) = @_;
    my $tnrs_url ="http://www.inaturalist.org/observations.csv?taxon_name=Aves&swlat=$latitude\&swlng=$longitude\&nelat=$ne_latitude\&nelng=$ne_longitude";
    my $request_url = URI->new($tnrs_url);
    # submit request
    INFO("HTTP GET: $request_url");
    my $response = $http->get($request_url);
    print "$response\n";
    fatal($response->status_line, IS_CGI, 500) unless ($response->is_success);
    my $text = $response->decoded_content();
    open my $text_handle, '<', \$text;
    my $csv = Text::CSV -> new( {binary => 1});
    while (my $row = $csv ->getline($text_handle)) {
	my @array = @{$row};
	my $name = $array[0];
	print "$name\n";
	if (! exists $specieshash{$name})
	{
	    push @namearray, $name;
	    $specieshash{$name}=1;
	}
    }
}


sub search_map_of_life {
    my ($latitude, $longitude, $radius) = @_;
    my $tnrs_url = "http://mol.cartodb.com/api/v2/sql?q=SELECT%20*%20FROM%20get_species_list_csv('jetz_maps',$longitude,$latitude,$radius,'')&_=1359475900848&format=csv";
    my $request_url = URI->new($tnrs_url);
    #submit request                                                                                                                                                                
    INFO("HTTP GET: $request_url");
    my $response = $http->get($request_url);
    fatal($response->status_line, IS_CGI, 500) unless ($response->is_success);
    my $text = $response->decoded_content();
    open my $text_handle, '<', \$text;
    my $csv = Text::CSV->new({binary=>1});
    while (my $row = $csv ->getline($text_handle)) {
        my @array = @{$row};
        my $name = $array[0];
	if (! exists $specieshash{$name})
	{
	    push @namearray, $name;
	    $specieshash{$name}=1;
	}
    }
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

for my $species (@namearray)
{
    if ($species =~ m/Scientific/g) {}
    else 
    {
	print OUT "$species\n";
    }
}



