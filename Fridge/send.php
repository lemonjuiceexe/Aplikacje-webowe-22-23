<?php
    //TODO: use bind_param for security

    // get the data sent by the client
    $rawInput = fopen('php://input', 'r');
    $tempStream = fopen('php://temp', 'r+');
    stream_copy_to_stream($rawInput, $tempStream);
    rewind($tempStream);
    $result = stream_get_contents($tempStream);
    // convert to a dictionary
    $result = json_decode($result, true);
    
    // now data is accessible like that: $result["notes"] is a dictionary of notes
	//print_r($result);
	
    include 'auth.php'; // contains $username and $password for the database
    $server = '127.0.0.1';
    $database = 'fridge';
    $table = 'fridge';
    $connection = new mysqli($server, $user, $password, $database);
    if ($connection->connect_error) {
        die("Connection failed: " . $connection->connect_error);
    }

    $query = "INSERT IGNORE INTO ". $table. " (boardId, defaultNotePosition, defaultNoteSize, allCount, notes) VALUES("
    ."'". $result["boardId"]. "', "
    ."'". json_encode($result["defaultNotePosition"]). "', "
    ."'". json_encode($result["defaultNoteSize"]). "', "
    ."". $result["allCount"]. ", "
    ."'". json_encode($result["notes"]). "') "
    ."ON DUPLICATE KEY UPDATE "
    ."defaultNotePosition='"
    . json_encode($result["defaultNotePosition"]). "', ".
    "defaultNoteSize='"
    . json_encode($result["defaultNoteSize"]). "', ".
    "allCount="
    . $result["allCount"]. ", ".
    "notes='"
    . json_encode($result["notes"]). "'";

	print($query);

    $answer = $connection->query($query);
    if(str_starts_with($answer, 'ERROR')){
        echo $answer;
    }
    else{
        echo "200 \n";
        echo $answer;
    }

    $connection->close();

    
    // INSERT INTO fridge (boardId, defaultNotePosition, defaultNoteSize, allCount, notes) VALUES(
    //     -> "testboard1",
    //     -> '{"width": 1, "height": 1}',
    //     -> '{"x": 1, "y": 12}',
    //     -> 12,
    //     -> '[{"a" : 1}]'
    //     -> );

?>
