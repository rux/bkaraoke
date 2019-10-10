import React from 'react';
import './App.css';

import request from "superagent"
import csv from "csvtojson"



function makeKey(song) {
  // simple hashing to give a textual representation of the
  return song.SONG + song.ARTIST + song["MF CODE"] + song.TRACK;
}


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
          {this.props.songCount} to choose from
        </div>
      );
    }
  }
};




class SongList extends React.Component{

  render() {
    if (this.props.songs.length>0) {
      const songRows = this.props.songs.map((song) => {
        const key = makeKey(song);
        const inQueue = (this.props.queue.some(queueEntry => makeKey(queueEntry) === key)) ? true : false
        return (
          <SongRow
              handleRowClick ={ this.props.handleRowClick }
              song={song}
              inQueue={inQueue}
              key={key} />
        );

      });

      return (
        <table><tbody>
          <tr><th>Song</th><th>Artist</th><th>Code</th><th>Track</th><th></th></tr>
          {songRows}
        </tbody></table>
      );
    } else {
      return null;
    }
  }
};


class SongRow extends React.Component{

  handleClick = () => {
    this.props.handleRowClick(this.props.song)
  }

  render() {
    const inQueue = this.props.inQueue ? "🎤" : ""
    return (
      <tr onClick={this.handleClick} >
        <td>{this.props.song.SONG}</td>
        <td>{this.props.song.ARTIST}</td>
        <td>{this.props.song["MF CODE"]}</td>
        <td>{this.props.song.TRACK}</td>
        <td>{inQueue}</td>
      </tr>
    );
  }
};

class Queue extends React.Component {
  render() {
    return (
      <div
        className="queue"
        onClick={this.props.handleShowQueue}>
        Queued {this.props.queue.length} songs
      </div>
    );
  }
}


class Search extends React.Component {
  render() {
    return(
      <input
        name="search"
        placeholder="song or artist, at least 3 letters"
        size="32"
        value={this.props.searchTerm}
        onChange={this.props.handleSearchTermChange} />
    );
  }
}



class App extends React.Component {
  state = {
    songs:[],
    searchTerm:"",
    sortBy:"",
    queue:[],
    mode:"search"
  };

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
    this.setState({mode: "search", searchTerm: event.target.value});
  };

  handleShowQueue = () => {
    this.setState({mode: "queue", searchTerm: ""})
  }

  handleRowClick = (song) => {
     const thisKey = makeKey(song)
     // search the queue - if it's there, kill it and if it's not, add it
     if (this.state.queue.some(queueEntry => makeKey(queueEntry) === thisKey)) {
        let filteredQueue = this.state.queue.filter(queueEntry => makeKey(queueEntry) !== thisKey)
        this.setState({queue: filteredQueue});
     } else {
       // add it in to queue
       console.log("adding")
       this.setState({queue:[...this.state.queue, song]})
     }
  };

  getSongs() {
    if (this.state.mode === "search") {
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
    } else if (this.state.mode === "queue") {
      return this.state.queue;
    }
  };



  render() {
    return (
      <div>
        <Queue
          handleShowQueue = {this.handleShowQueue}
          queue={this.state.queue} />

        <Search
          searchTerm = {this.state.searchTerm}
          handleSearchTermChange = {this.handleSearchTermChange} />

        <Spinner
          songCount={this.state.songs.length} />

        <SongList
          handleRowClick = {this.handleRowClick}
          queue={this.state.queue}
          songs={this.getSongs()} />
      </div>
    );
  }
}

export default App;
