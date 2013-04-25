<?php

//Create and load the HTML
include('simple_html_dom.php');

//function to extract species names from a lampyr page and put them in an array.
function getSpecies($page){

  global $speciesList;

	$html = new simple_html_dom();
	$html -> load_file($page);
	$items = $html -> find("i");

	foreach($items as $species){
	$speciesList[] = $species ->innertext;
	}

}

$lat = 32.222150;
$lon = -110.926445;
$commonOnly = False;
$nSpecies = 50;
// Sample Data, the lat/lon represent Tucson

if($commonOnly) $comstr = "yes"; else $comstr = "no";

//Convert strings to URL friendly form
$lat = urlencode ($lat);
$lon = urlencode ($lon);
$nSpecies = urlencode ($nSpecies);

//Form the URL with GET arguments from which to extract data.
$url = "http://www.lampyr.org/app/getNClosestTaxonIDSpeciesCommon.php?lat=".$lat."&lon=".$lon."&submit=submit-value&common=".$comstr."&N=".
$nSpecies;

//Declares an empty array to store the species.
$speciesList = array();
getSpecies($url);

//Calls the function which lists the species.
?>
