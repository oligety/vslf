<?php
ini_set('memory_limit', '-1');

// upload directory
$uploaddir = '/is/htdocs/wp12216874_W6RAH7GOLN/www/vslf/uploads/';
$uploadfile_path = $uploaddir . basename($_FILES['inputFile']['name']);

// Datei im Format VSLF_YYYYMM wir erstellt
$year_month = $_POST["form_year"] . $_POST["form_month"];
$datei = "VSLF_" . $year_month . ".txt";

header("Cache-Control: cache, must-revalidate");
header("Pragma: public");
header("Content-type: text/plain");
header("Content-Disposition: attachment; filename=$datei");

if (move_uploaded_file($_FILES['inputFile']['tmp_name'], $uploadfile_path)) {
    // echo "Datei ist valide und wurde erfolgreich hochgeladen.n";
    include 'lib/simplexlsx.php';

    $xlsx = new SimpleXLSX($uploadfile_path);

    $timestamp = date("YmdHis");
    $anzahl_records = 0;
    $betrag = 30.00;
    $total = 0.00;

    echo "TOP" . $timestamp;
    echo "n";

    list($cols,) = $xlsx->dimension();

    $titles = array();

    foreach ($xlsx->rows() as $k => $r) {
        global $titles;

        // Bei erster Zeile alle Spalten Titel in Array auslesen
        if ($k == 0) {
            for ($i = 0; $i < $cols; $i++) {
                $titles[$i] = $r[$i];
            }
            continue;
        } else {
            for ($j = 0; $j < $cols; $j++) {
                if (strcmp($titles[$j], "Personal Nr.SBB") == 0) {
                    $sbb_personalnummer = str_pad($r[$j], 8, "0", STR_PAD_LEFT);
                    $total = $total + $betrag;
                    $anzahl_records++;
                    echo $sbb_personalnummer . $year_month . "01" . "8030" . sprintf('%010d', $betrag) . ".00";
                    echo "n";
                }
            }
        }
    }

    echo "END" . $timestamp . "_" . $anzahl_records . "_" . sprintf('%010d', $total) . ".00";

} else {
    // echo "Problem mit Dateiupload!n";
}

?>