<?PHP

/* Get the parameters, both GET and POST, from the request */
$q = $_GET["q"];

$pick = $_POST["pick"];
$person = $_POST["person"];
$track = $_POST["track"];


/* Load the csv */
$file = file("songlist.csv", FILE_IGNORE_NEW_LINES );

/* knock off the first line, which is the CSV header */
array_shift($file);



/* Loop through the CSV, and populate $output with either results or a message that no results were found */
$i = 0;
$output = "";

if ($q != "") {
  $output .=  "<table><tr><th>Artist</th><th>Song</th></tr>";
  foreach ($file as $row) { 
    if (strpos(strtoupper($row), strtoupper($q)) !== FALSE) {
      $i++;
      $row = explode( ",", $row);
      $output .=  <<<TROGDOR
        <tr id="row$i" onClick="javascript:choose($i)">
          <td>$row[0]</td>
          <td>$row[1]</td>
        </tr>
        <tr id="details$i" class="highlight" style="display:none" onClick="javascript:choose($i)">
          <td>Disc: $row[2]</td>
          <td>Track: $row[3]</td>
        </tr>
        <tr class="highlight" style="display:none" id="form$i">
          <td colspan="2">
            <form method="POST" action="?" style="text-align:center">
              <input type="text" name="person" placeholder="Your Name" required />
              <input type="hidden" name="pick" value="$row[1] - $row[0]" />
              <input type="hidden" name="track" value="$row[2] - $row[3]" />
              <input type="submit" style="background-color:#ddd" value="Add my name to the queue"/>
            </form>
          </td>
        </tr>
TROGDOR;
    }
  }
  
  if ($i == 0) {
    $output .=   "<tr><td colspan='2'>No results</td></tr>";
  } else {
    $output .=   "<tr><th colspan='2'>$i results in total</th></tr>";
  }
    
  $output .=   "</table>";  
} 



/* if a request was made successfully, put up a message then send an email. */

$request_success = "";

if (($person != "") && ($pick != "") && ($track != "")) {
  $request_success = "<h1>Congratulations $person</h1>
    <p>Your request for <strong>$pick</strong> is now in the queue!  Get that voice warmed up, you'll be singing in no time!</p>
    <br/><br/><br/><br/><br/><br/><br/>";

  $subject = "🎅 $person 💿 $track 🎤 $pick";
  $body = <<<HOMSAR

<h1>Song Request</h1>

<table>
  <tr><th>Singer</th><td>$person</td></tr>
  <tr><th>Song</th>  <td>$pick</td></tr>
  <tr><th>Track</th> <td>$track</td></tr>
</table


<h2>HAPPY SINGING!</h2>

HOMSAR;
  $headers = 'From: <karaoke@benkelly.com>' . "\r\n";
  $headers .= 'Content-Type: text/html; charset=UTF-8'. "\r\n";

  
  $to = "monchavo+karaoke@gmail.com";
  mail($to,$subject,$body,$headers);

}





?>
<!DOCTYPE html>
<html lang="en">
<head>

  <!-- Basic Page Needs
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <meta charset="utf-8">
  <title>benski karaoke finder</title>
  <meta name="description" content="">
  <meta name="author" content="El Rux0rino">

  <!-- Mobile Specific Metas
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- FONT
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <link href="//fonts.googleapis.com/css?family=Raleway:400,300,600" rel="stylesheet" type="text/css">

  <!-- JS to toggle the blue request form when someone clicks on a song name
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <script type="text/javascript">
    var choose = function(i) {
              var r = document.getElementById("row" + i);
              var d = document.getElementById("details" + i);
              var f = document.getElementById("form" + i);

              if (r.className!="highlight") {
                r.className="highlight"
                d.style.display = "table-row";
                f.style.display = "table-row";
              } else {
                r.className=""
                d.style.display = "none"
                f.style.display = "none"
              }
              
            }
  </script>

  <!-- CSS
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <link rel="stylesheet" href="css/normalize.css">
  <link rel="stylesheet" href="css/skeleton.css">
  <style>
    td:first-child { /* fix a skeleton.css thing I don't like */
      padding: 12px;
    }

    /* define what a clicked-on result looks like */
    .highlight { 
      background-color:#33C3F0;
      color:white;
      font-weight:bold;
      transition: all 0.2s ease;
    }
    .highlight td { /* combine all highlighted cells */
      border-bottom:none;
    }
    .highlight input {
      color:#333;
    }
  </style>

  <!-- Favicon
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <link rel="icon" type="image/png" href="images/favicon.png">
</head>
<body>

  <!-- Primary Page Layout
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <div class="container">
    <div class="row">
      <div class="twelve columns" style="margin-top: 5%">
        <header><h4>Karaoke Finder</h4></header>
        <?PHP echo $request_success; ?>
        <form method="GET">
          <label for="search">What Do You Want To Sing? Enter an artist or song title.</label>
          <input class="u-full-width" type="text" id="search" placeholder="e.g Katy Perry or Firework" name="q" required value="<?PHP echo $q; ?>" />
          <input class="button-primary" type="submit" value="GO!">
        </form>
      </div>
      <p><?PHP echo $output; ?></p>
      <p>&nbsp;</p>
      <h4>TIPS</h4>
      <ul>
          <li>For best results enter as little text in the search box as possible</li>
          <li>Use keywords - rather than full titles of songs or artist names - If there's a really unusual word in the song title then you can probably just search for that</li>
          <li>If you're stuck for something to sing, just search for a single letter, eg, "A", and it'll bring back every song that starts with an A and every artist whose name begins with an A.  Proceed down the alphabet as far as you need...</li>
      </ul>
      <footer style="color:#ddd">Search Function ©2008 Russ Anderson - with many thanks.</footer>
    </div>
  </div>


<!-- End Document
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
</body>
</html>
