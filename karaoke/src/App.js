import React from 'react';
import './App.css';
import request from "superagent"
import csv from "csvtojson"
import * as firebase from "firebase/app";
import {firebaseConfig} from "./secrets";

require("firebase/firestore");



firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();



// simple hashing to give a string representation, useful for comparisons/filtering
function makeKey(song) {
  const concatenation = song.SONG + song.ARTIST + song["MF CODE"] + song.TRACK
  return concatenation.replace(/\s/g,'');
}


class Spinner extends React.Component {
  render() {
    if (this.props.songsTotalCount === 0) {
      return (
        <div className="status">
          <div>Getting song list...</div>
          <div className="circles-loader">Loading…</div>
        </div>
      );
    } else {
      return (
        <div className="status">{this.props.songsTotalCount} songs to choose from</div>
      );
    }
  }
};




class SongList extends React.Component{


  handleSetSortBy = (event) => {
    const sortBy = event.target.id;
    this.props.handleSetSortBy(sortBy)
  }


  render() {
    const showAllFields = (this.props.mode==="queue") ? true : false
    if (this.props.songs.length>0) {
      const songRows = this.props.songs.map((song) => {
        const key = makeKey(song);
        const inQueue = (this.props.queue.some(queueEntry => makeKey(queueEntry) === key)) ? true : false
        return (
          <SongRow
              handleRowClick ={ this.props.handleRowClick }
              song={song}
              inQueue={inQueue}
              showAllFields={showAllFields}
              key={key} />
        );
      });

      const extraHeaderCells = showAllFields ? <><th>Code</th><th>Track</th></> : null; // Nota Bene odd react tag container!
// eslint-disable-next-line
      const lintFix=<></> // fix for sublimetext syntax highlighting!  This does nothing.

      let sortedBySong, sortedByArtist;

      if (this.props.mode !== "queue") {
        sortedBySong =  (this.props.sortBy === "SONG") ? " ▾" : " ▿";
        sortedByArtist =  (this.props.sortBy === "ARTIST") ? " ▾" : " ▿";
      }


      return (
        <table className="songList"><tbody>
          <tr>
            <th colSpan="2" id="SONG" onClick={this.handleSetSortBy}>Song{sortedBySong}</th>
            <th id="ARTIST" onClick={this.handleSetSortBy}>Artist{sortedByArtist}</th>
            {extraHeaderCells}
          </tr>
          {songRows}
        </tbody></table>
      );
    } else {
      return null;
    }
  }
};


class SongRow extends React.Component{
  handleClick = () => { this.props.handleRowClick(this.props.song); }

  render() {
    const inQueue = this.props.inQueue ? "🎤" : "💿";
    if (this.props.showAllFields) {
      return (
        <tr className={inQueue} onClick={this.handleClick} >
          <td>{inQueue}</td>
          <td>{this.props.song.SONG}</td>
          <td>{this.props.song.ARTIST}</td>
          <td>{this.props.song["MF CODE"]}</td>
          <td>{this.props.song.TRACK}</td>
        </tr>
      )
    } else {
      return (
        <tr className={inQueue} onClick={this.handleClick} >
          <td>{inQueue}</td>
          <td>{this.props.song.SONG}</td>
          <td>{this.props.song.ARTIST}</td>
        </tr>
      )
    }

  }
};

class Queue extends React.Component {

  render() {
    const showQueueLength = (this.props.mode === "queue") ? "queue" : "queue hidden";
    const showInstructions = (this.props.queue.length > 0) ? "" : "hidden"
    return (
      <div
        className={showQueueLength}>
        <p>Queued {this.props.queue.length} songs.</p>
        <p className={showInstructions}>Click on a song to remove it from the queue</p>
      </div>
    );
  }
}


class Search extends React.Component {
  render() {
    if (this.props.mode==="search") {
      return(
        <div className="search">
          <input
            name="search"
            role="search"
            placeholder="Search song or artist, at least 3 letters"
            size="32"
            value={this.props.searchTerm}
            onChange={this.props.handleSearchTermChange} />
        </div>
      );
    } else {
      return null;
    }
  }
}

class Letter extends React.Component {
  render() {
    const highlight = (this.props.browseLetter === this.props.letter) ? "highlight" : "";
    return (
      <button
        className={highlight}
        onClick={this.props.handleBrowse}
        value={this.props.letter}>
          {this.props.letter}
      </button>
    );
  }
}

class Letters extends React.Component {
  render() {

    if (this.props.mode.substring(0,6)==="browse") {
      if (this.props.songListCount > 0) {
        return (
            <div className="letters">
              <button  letter="" onClick={this.props.handleBrowse} >← Back</button>
            </div>
          )
      } else {

      const letters =  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const numbers =  '1234567890'.split('');
      const letterArray = letters.map((letter) => {
        return (
          <Letter key={letter} browseLetter={this.props.browseLetter} letter={letter} handleBrowse={this.props.handleBrowse} />
        )
      })
      const numberArray = numbers.map((letter) => {
        return (
          <Letter key={letter} browseLetter={this.props.browseLetter} letter={letter} handleBrowse={this.props.handleBrowse} />
        )
      })

        return (
          <div>
            <div className="letters">
              {letterArray}
            </div>
            <div className="letters">
              {numberArray}
            </div>
          </div>
        );
      }
    } else {
      return null;
    }
  }
}


class Header extends React.Component {

  setHighlight = (mode) => {
        const o = {};
        o[mode] = "highlight"
        return o;
  }

  render() {
    // only show title chrome if the user hasn't done anything
    const showTitle = (this.props.songListCount === 0) ? "" : "hidden";

    const MAX_QUEUE = 99
    const oversizedQueue = (this.props.queueCount > MAX_QUEUE) ? "+" : "";
    const limitedQueueCount = (this.props.queueCount > MAX_QUEUE) ? MAX_QUEUE : this.props.queueCount;
    const queueLength = (limitedQueueCount > 0) ? "\u00A0(" + limitedQueueCount + oversizedQueue +")" : null;


    const highlight=this.setHighlight(this.props.mode);

    return (
      <header>
        <button className={highlight.search} value="search" onClick={this.props.handleSetMode}>Search</button>
        <button className={highlight.browseByArtist} value="browseByArtist" onClick={this.props.handleSetMode}>Artists</button>
        <button className={highlight.browseBySong} value="browseBySong" onClick={this.props.handleSetMode}>Songs</button>
        <button className={highlight.queue} value="queue" onClick={this.props.handleSetMode}>Queue{queueLength}</button>
        <h1 className={showTitle}>
          Karaoke <img width="32px" height="32px" src="logo.png" alt="" /> Finder
        </h1>
        <div className={showTitle}>
          <Spinner
            songsTotalCount={this.props.songsTotalCount} />
        </div>
      </header>
    );
  }
}



class App extends React.Component {
  state = {
    songs:[],
    searchTerm:"",
    browseLetter:"",
    queue:[],
    queueName:"default-queue",
    mode:"search",
    sortBy:"SONG"
  };



  componentDidMount() {
    request
      .get("./songlist.csv")
      .end((error, response) => {
        if (error || !response.ok) {
          console.error("Bad request for songlist.csv")
        } else {
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

    this.getQueue();

    let that=this;
    db.collection(this.state.queueName).onSnapshot(function(querySnapshot) {
      that.getQueue();
    })
  }

  getQueue = () => {
      const fbQueue = db.collection(this.state.queueName).orderBy("TS", "asc") ;
      let that=this;
      fbQueue.get().then(function(querySnapshot) {
        const currentQueue = querySnapshot.docs.map((row) => {
          return(row.data())
        })
        that.setState({queue: currentQueue})
      })
  }

  handleSearchTermChange = (event) => {
    this.setState({mode: "search", searchTerm: event.target.value, browseLetter: ""});
  }


  handleSetSortBy = (sortBy) => {
    this.setState({sortBy: sortBy})
  }

  handleSetMode = (event) => {
    const mode = event.target.value;
    if (mode === "browseByArtist") {this.handleSetSortBy("ARTIST")}
    if (mode === "browseBySong") {this.handleSetSortBy("SONG")}
    this.setState({mode: mode, searchTerm: "", browseLetter: ""})
  }

  handleBrowse = (event) => {
    this.setState({browseLetter: event.currentTarget.value})
  }

  handleRowClick = (song) => {
    const key = makeKey(song)
    // search the queue - if it's there, kill it and if it's not, add it
    const timestamp = Date.now();

    if (this.state.queue.some(queueEntry => makeKey(queueEntry) === key)) {
      if (window.confirm("Delete '" + song.SONG + "' from the queue?")) {
        // firebase remove this song
        db.collection(this.state.queueName).doc(key).delete().then(this.getQueue)
      }
    } else {
      song.TS = timestamp;
      // firebase add this song
      db.collection(this.state.queueName).doc(key).set(song).then(this.getQueue)
    }
  };

  getSongs() {
    if (this.state.mode === "search") {
      if (this.state.searchTerm.length >= 3) {
        const searchRegExp = new RegExp("\\b" + this.state.searchTerm, "i");
        const filterByTerm = function(song) {
          if (song.ARTIST.toString().match(searchRegExp)) {
            return true;
          } else if (song.SONG.toString().match(searchRegExp)) {
            return true;
          } else {
            return false;
          }
        };
        const songs = this.state.songs.filter( filterByTerm );
        return [...songs].sort((a,b) => a[this.state.sortBy].localeCompare(b[this.state.sortBy]));

      } else {
        return [];
      }
    } else if (this.state.mode === "browseBySong") {
      const songs = this.state.songs.filter(song => song.SONG.substring(0,1).toUpperCase() === this.state.browseLetter.toUpperCase())
      return [...songs].sort((a,b) => a[this.state.sortBy].localeCompare(b[this.state.sortBy]));
    } else if (this.state.mode === "browseByArtist") {
      // csv is sorted by song title, we need to make a copy to sort by artist so we
      // do not interfere with the react state object
      const songs = this.state.songs.filter(song => song.ARTIST.substring(0,1).toUpperCase() === this.state.browseLetter.toUpperCase())
      return [...songs].sort((a,b) => a[this.state.sortBy].localeCompare(b[this.state.sortBy]));
    } else if (this.state.mode === "queue") {
      return this.state.queue;
    }
  };



  render() {

    const songsToList = this.getSongs();

    return (
      <div>
        <Header
          mode={this.state.mode}
          handleSetMode={this.handleSetMode}
          songsTotalCount={this.state.songs.length}
          songListCount={songsToList.length}
          queueCount={this.state.queue.length} />
        <Queue
          mode = {this.state.mode}
          queue={this.state.queue} />
        <Search
          mode = {this.state.mode}
          searchTerm = {this.state.searchTerm}
          handleSearchTermChange = {this.handleSearchTermChange} />
        <Letters
          mode = {this.state.mode}
          browseLetter = {this.state.browseLetter}
          songListCount={songsToList.length}
          handleBrowse={this.handleBrowse} />
        <SongList
          mode={this.state.mode}
          sortBy={this.state.sortBy}
          handleRowClick = {this.handleRowClick}
          handleSetSortBy = {this.handleSetSortBy}
          queue={this.state.queue}
          songs={songsToList} />

      </div>
    );
  }
}

export default App;
