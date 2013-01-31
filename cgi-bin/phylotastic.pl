#!/opt/local/bin/perl

use strict;
use warnings;

#----------------------------------------------------------------------
# imports
#----------------------------------------------------------------------

use CGI;
use LWP::UserAgent;
use Getopt::Long;
use Bio::Phylo;
use Bio::Phylo::EvolutionaryModels qw (sample);

#----------------------------------------------------------------------
# constants
#----------------------------------------------------------------------

use constant IS_CGI     => exists $ENV{'REQUEST_URI'};
use constant URL_PREFIX => 'http://phylotastic-wg.nescent.org/~benv/cgi-bin/';

my $http            = LWP::UserAgent->new();
my $species         = "Homo sapiens;Rattus norvegicus;Mus musculus;Pan troglodytes";
my $phylotastic_url = URL_PREFIX . 'phylotastic.pl';

my $cgi = CGI->new();

if (IS_CGI) {
  print $cgi->header( -status => 200, -type => 'text/plain' );
}

if (IS_CGI) {
  $species = $cgi->param('species') if $cgi->param('species');
} else {
  my $getopt_success = GetOptions( 'species=s' => \$species, );
  die "Fail!" unless $getopt_success;
}

#my $newick_response = fetch_tree($species);
my $newick_response = make_fake_tree($species);

print $newick_response."\n";

sub make_fake_tree {
  my $species_string = shift;

  my @species = split( ';', $species_string );
  my $n = scalar(@species);

  my ( $sample, $stats ) = sample(
    sample_size       => 1,
    tree_size         => $n,
    algorithm         => 'b',
    algorithm_options => { rate => 1 },
    model             => \&Bio::Phylo::EvolutionaryModels::constant_rate_birth,
    model_options     => { birth_rate => .5 }
  );

  my $tree = $sample->[0];
  my @tips = @{ $tree->get_terminals };
  $tips[$_]->set_name($species[$_]) for 0 .. $#species;
  

  return $sample->[0]->to_newick;
}

sub fetch_tree {
  my $species_string = shift;

  my $response = $http->post( $phylotastic_url, Content => $species );
  fatal( $response->status_line, IS_CGI, 500 ) unless ( $response->is_success );
  my $newick = $response->decoded_content();
  return $newick;
}

# a 'die' method that works in both CGI and commandline context
sub fatal {
  my ( $msg, $is_cgi, $http_status ) = @_;
  if ($is_cgi) {
    $http_status ||= 500;
    print CGI->header( -status => $http_status, -type => 'text/plain' );
    print "ERROR: " . $msg;
    exit 0;
  } else {
    die "ERROR: $msg\n";
  }
}
