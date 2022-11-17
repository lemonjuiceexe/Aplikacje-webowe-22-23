<?php 
    $rawInput = fopen('php://input', 'r');
    $tempStream = fopen('php://temp', 'r+');
    stream_copy_to_stream($rawInput, $tempStream);
    rewind($tempStream);

    $result = stream_get_contents($tempStream);
    // convert to a dictionary
    $result = json_decode($result, true);

    print_r($result["notes"]);
?>