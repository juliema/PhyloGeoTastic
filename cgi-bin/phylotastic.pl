#!/usr/bin/perl

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

use constant IS_CGI => exists $ENV{'REQUEST_URI'};

my $http    = LWP::UserAgent->new();
my $species = "Alectoris chukar;Centrocercus minimus;Phasianus colchicus;Anas acuta;Anas americana;Anas clypeata;Anas crecca;Anas cyanoptera;Anas discors;Anas platyrhynchos";
my $group = '';
my $treestore = 'opentree';

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

my $newick_response = fetch_tree($species, $group);
#my $newick_response = make_fake_tree($species);
print $newick_response;

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
  $tips[$_]->set_name( $species[$_] ) for 0 .. $#species;

  return $sample->[0]->to_newick;
}

sub fetch_tree {
  my $species_string = shift;
  my $group = shift;

  # We get semicolon-delimited on the input; convert to commas.
  $species_string =~ s/;/,/g;

  my $url = 'http://opentree-dev.bio.ku.edu/architastic/tree/fullqueryopentree';
  #my $url = 'http://opentree-dev.bio.ku.edu/architastic/auto/tree';

  #print "Calling phylotastic URL $phylotastic_url\n";
  #print "with species string $species_string\n";
  $http->timeout( 60 * 10 );    # Timeout after 10 minutes...!

  my $content_obj = {
    taxa => $species_string
  };

  if ($group ne '') {
      $content_obj->{contextName} = $group;
  }

  if ($treestore ne '') {
      $content_obj->{treestore} = $treestore;
  }

  #print "URL $url\n";
  my $response = $http->post( $url, $content_obj );
  fatal( $response->status_line, IS_CGI, 500 ) unless ( $response->is_success );

  my $newick = $response->content;
  #print "GOT SOMETHING BACK: $newick\n";
  #$newick =~ s/\\\"\\n\\\"//g;

  # Remove crap returned by the fullqueryopentree script
  $newick =~ s/&quot;//g;

  # Remove crap returned by the auto/tree script
  $newick =~ s/"(.*)\\n"/$1/g;

  # Add a semicolon (which both scripts forget to include) to make it a real Newick string.
  $newick .= ';';

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
