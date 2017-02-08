var express = require('express');
var app = express();
var SpotifyWebApi = require('spotify-web-api-node');
output = [];
var spotifyApi = new SpotifyWebApi();
var bodyParser = require('body-parser')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
// Serve index.html
app.use(express.static('public'));
app.get('/', function(req, res) {
    res.sendFile(__dirname + "/" + "index.html");
})
// Create JSON for search output
app.get('/search', function(req, res) {
    response = {
        search_text: req.query.q,
    };
    console.log(response.search_text);
    spotifyApi.searchTracks(response.search_text)
        .then(function(data) {
            console.log("Querying: " + response.search_text);
            for (var i = 0; i < data.body.tracks.items.length; i++) {
                global.output[i] = {
                    track: data.body.tracks.items[i].name,
                    album: data.body.tracks.items[i].album.name,
                    artist: data.body.tracks.items[i].artists[0].name
                };
            }
            showTable(req, res);
        }, function(err) {
            console.error(err);
        });
})
// Render HTML table
function showTable(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.write('<table border=2 cellspacing=2 cellpadding=2><tr><th>Track</th><th>Album</th><th>Artist</th></tr>');
    res.write('<tr><td><a href="/sort_track_asc">A</a>&nbsp;&nbsp;<a href="/sort_track_desc">D</a></td><td><a href="/sort_album_asc">A</a>&nbsp;&nbsp;<a href="/sort_album_desc">D</a></td><td><a href="/sort_artist_asc">A</a>&nbsp;&nbsp;<a href="/sort_artist_desc">D</a></td></tr>');
    for (var i = 0; i < output.length; i++) {
        res.write('<tr><td>');
        res.write(output[i].track);
        res.write('</td>');
        res.write('<td>');
        res.write(output[i].album);
        res.write('</td>');
        res.write('<td>');
        res.write(output[i].artist);
        res.write('</td></tr>');
    }
    res.write('</table>')
    res.end();
}
//Sort
function sortDataTable(arrayColNames, asc) { // if not asc, desc
    debugger;
    var columnName = arrayColNames;
    output = output.sort(function(a, b) {
        if (asc) {
            return (a[columnName] > b[columnName]) ? 1 : -1;
        } else {
            return (a[columnName] < b[columnName]) ? 1 : -1;
        }
    });
}
app.get('/sort_track_asc', function(req, res) {
    sortDataTable('track', true);
    showTable(req, res);
})
app.get('/sort_track_desc', function(req, res) {
    sortDataTable('track', false);
    showTable(req, res);
})
app.get('/sort_album_asc', function(req, res) {
    sortDataTable('album', true);
    showTable(req, res);
})
app.get('/sort_album_desc', function(req, res) {
    sortDataTable('album', false);
    showTable(req, res);
})
app.get('/sort_artist_asc', function(req, res) {
    sortDataTable('artist', true);
    showTable(req, res);
})
app.get('/sort_artist_desc', function(req, res) {
    sortDataTable('artist', false);
    showTable(req, res);
})

// Start Express.js
var server = app.listen(3000, function() {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://localhost:%s", port)
})
