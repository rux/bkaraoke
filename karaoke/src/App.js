import React from 'react';
import './App.css';

import request from "superagent"
import csv from "csvtojson"




class Spinner extends React.Component {
  render() {
    if (this.props.songCount === 0) {
      return (
        <div className="status">
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
        <div className="status">
          Number of songs = {this.props.songCount}
        </div>
      );
    }
  }
};




class SongList extends React.Component{
  render() {


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
};


class SongRow extends React.Component{
  render() {
    return (
      <tr>
        <td>{this.props.song}</td>
        <td>{this.props.artist}</td>
        <td>{this.props.cd}</td>
        <td>{this.props.track}</td>
      </tr>
    );
  }
};




class Search extends React.Component {
  render() {
    return(
      <input
        name="search"
        placeholder="song or artist, at least 3 letters"
        size="32"
        onChange={this.props.handleSearchTermChange} />
    );
  }
}



class App extends React.Component {
  state = {songs:[], searchTerm:"", sortBy:""};

  componentDidMount() {
    console.log("bkaraoke initialised");

    request
      .get("./songlist.csv")
      .end((error, response) => {
              if (error || !response.ok) {
                console.log("bad request")
              } else {
                console.log(response)
                    const converter = new csv.Converter({});

                    //record_parsed will be emitted each time a row has been parsed. 
                    converter.on("record_parsed",function(resultRow,rawRow,rowIndex){
                       // console.log(resultRow); //here is your result json object 

                       if (rowIndex % 1000 === 0) {
                          console.log(rowIndex, " thousand");
                       }
                    });

                    converter
                      .fromString(response.text)
                      .then( (jsonObject) => {this.setState({songs: jsonObject})});
                }
        });
  };

  handleSearchTermChange = (event) => {
    this.setState({searchTerm: event.target.value});
  };

  getSongs() {
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
  };



  render() {
    return (
      <div>
        <Search
          handleSearchTermChange = {this.handleSearchTermChange} />

        <Spinner
          songCount={this.state.songs.length} />

        <SongList
          songs={this.getSongs()} />
      </div>
    );
  }
}

export default App;
