/*global document, require, console */
/* jshint node: true */
'use strict';


var React = require('react');
var ReactDOM = require('react-dom');
var superagent = require('superagent');
var csvToJson = require('csvtojson');

var KaraokeApp = React.createClass({
	getInitialState: function() {
		return {songs:[], searchTerm:"", sortBy:""};
	},

	componentDidMount: function() {
		console.log("bkaraoke initialised");

		var self=this;
		var saveCsvToState = function( err,response) {
				if (response.ok) {
					// console.log ('yay got stuff',  response);

					var converter = new csvToJson.Converter({});

					//record_parsed will be emitted each time a row has been parsed. 
					converter.on("record_parsed",function(resultRow,rawRow,rowIndex){
					   // console.log(resultRow); //here is your result json object 

					   if (rowIndex % 1000 === 0) {
					   		console.log(rowIndex, " thousand");
					   }
					});

					converter.fromString(response.text, function(err, result) {
						self.setState({songs: result});
						console.log("updated song data");
					})

					
				} else {
					console.log ('Oh no! error ' + response.text);
				}
		}

		superagent
			.get("./data/songlist.csv")
			.end(saveCsvToState);
	},

	handleSearchTermChange: function(event) {
		this.setState({searchTerm: event.target.value});
	},

	getSongs: function() {
		if (this.state.searchTerm.length >= 3) {
			var searchRegExp = new RegExp(this.state.searchTerm, "i");
			var filterByTerm = function(song) {
				if (song.ARTIST.toString().match(searchRegExp)) {
					return true;
				} else if (song.SONG.toString().match(searchRegExp)) {
					return true;
				} else {
					return false;
				}
			};

			return this.state.songs.filter( filterByTerm );
		} else {
			return [];
		}
	},

	render: function() {
		return (
			<div>
				<Search
					searchTerm={this.state.searchTerm}
					handleSearchTermChange = {this.handleSearchTermChange} />

				<Spinner
					songCount={this.state.songs.length} />

				<SongList
					songs={this.getSongs()} />
			</div>
		);
	}
});






var Search = React.createClass({
	render: function() {
		return(
			<input
				name="search"
				placeholder="song or artist, at least 3 letters"
				size="32"
				onChange={this.props.handleSearchTermChange}
				value={this.props.searchTerm} />
		);
	}
});


var SongList = React.createClass({
	render: function() {


		if (this.props.songs.length>0) {

			var songRows = this.props.songs.map(function(song) {
				var key = song.SONG + song.ARTIST + song["MF CODE"] + song.TRACK;
				return (
					<SongRow key={key}
							song={song.SONG}
							artist={song.ARTIST}
							cd={song["MF CODE"]}
							track={song.TRACK} />
				);

			 });

			return (
				<table><tbody>
					<tr><th>Song</th><th>Artist</th><th>Code</th><th>Track</th></tr>
					{songRows}
				</tbody></table>
			);
		} else {
			return null;
		}
	}
});


var SongRow = React.createClass({
	render:function() {
		return (
			<tr>
				<td>{this.props.song}</td>
				<td>{this.props.artist}</td>
				<td>{this.props.cd}</td>
				<td>{this.props.track}</td>
			</tr>
		);
	}
});


var Spinner = React.createClass({
	render:function() {
		if (this.props.songCount === 0) {
			return (
				<div style={{textAlign:"center"}}>
					<div>
						Getting song list...
					</div>
					<div className="circles-loader">
						Loading…
					</div>
				</div>
			);
		} else {
			return (
				<div style={{textAlign:"center"}}>
					Number of songs = {this.props.songCount}
				</div>
			);
		}
	}
});










ReactDOM.render(
	<KaraokeApp />,
	document.getElementById('content')
);