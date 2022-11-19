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

    include 'auth.php'; // contains $username and $password for the database
    $server = '127.0.0.1';
    $database = 'fridge';
    $table = 'fridge';
    $connection = new mysqli($server, $user, $password, $database);
    if ($connection->connect_error) {
        die("Connection failed: " . $connection->connect_error);
    }

    $query = "SELECT * FROM ". $table. ";";
    $answer = $connection->query($query);
    if($answer->num_rows > 0){
        echo $answer;
        // output data of each row
        // while($row = $answer->fetch_assoc()){
        //     echo "id: " . $row["id"]. " - defPos: " . $row["defaultNotePosition"]. " - defSize: " . $row["defaultNoteSize"]. " - count: ". $row["allCount"]. " - notes: " . $row["notes"]. "<br>";
        // }
    }
    else{
        echo "0 results";
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