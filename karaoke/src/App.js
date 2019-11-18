import React from 'react';
import './App.css';
import request from "superagent"
import csv from "csvtojson"
import * as firebase from "firebase/app";
import {firebaseConfig} from "./secrets";


import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import KeyboardVoiceIcon from '@material-ui/icons/KeyboardVoice';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';


import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


require("firebase/firestore");



firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();



// simple hashing to give a string representation, useful for comparisons/filtering
function makeKey(song) {
  const concatenation = song.SONG + song.ARTIST + song["MF CODE"] + song.TRACK
  return concatenation.replace(/\s/g,'');
}



class Header extends React.Component {



  render() {
    // only show title chrome if the user hasn't done anything
    const showTitle = (this.props.songListCount === 0) ? true : false;
    const showInstructions = ((this.props.songListCount === 0) && (this.props.mode==="search")) ? true : false;

    const MAX_QUEUE = 99
    const oversizedQueue = (this.props.queueCount > MAX_QUEUE) ? "+" : "";
    const limitedQueueCount = (this.props.queueCount > MAX_QUEUE) ? MAX_QUEUE : this.props.queueCount;
    const queueLength = (limitedQueueCount > 0) ? "\u00A0(" + limitedQueueCount + oversizedQueue +")" : null;



    return (

      <header>
        <AppBar position="static">
          <Toolbar>
            <Search 
              handleChangeSearchTerm={this.props.handleChangeSearchTerm}
              searchTerm={this.props.searchTerm}
              mode={this.props.mode} />
            <Button color="primary" variant="contained" value="browseByArtist" onClick={this.props.handleSetMode}>Artists</Button>
            <Button color="primary" variant="contained" value="browseBySong" onClick={this.props.handleSetMode}>Songs</Button>
            <Button  color="primary" variant="contained" value="queue" onClick={this.props.handleSetMode}>Queue{queueLength}</Button>
          </Toolbar>
        </AppBar>
        <Title display={showTitle} />
        <Instructions display={showInstructions} />
      </header>
    );
  }
}



class Search extends React.Component {
  render() {
      return(
          <Input
            name="search"
            className="search"
            role="search"
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
            placeholder="Search..."
            value={this.props.searchTerm}
            onChange={this.props.handleChangeSearchTerm} />
      );

  }
}

class Title extends React.Component {
  render() {
    if (this.props.display) {
      return (
        <h1 className={this.props.showTitle}>
          Karaoke <img width="32px" height="32px" src="logo.png" alt="" /> Songbook
        </h1>
      );
    } else return null;
  }
};

class Instructions extends React.Component {
  render() {
    if (this.props.display) {
      return (
        <p className="status">
          You can find songs either by searching, browsing by the first letter of an artist's name or by the first letter of a song title.
        </p>
      );
    } else return null;
  }
};




class Spinner extends React.Component {
  render() {
      if (this.props.songsTotalCount === 0) {
        return (
          <div className="status">
            <div>Getting song list...</div>
            <div className="circles-loader">Loading…</div>
          </div>
        );
      } else return null;
  }
};



class Queue extends React.Component {

  render() {
    const showInstructions = (this.props.queue.length > 0) ? "" : "hidden"
    if (this.props.mode === "queue") {
      return (
        <div className="queue status">
          <h2>Queued {this.props.queue.length} songs.</h2>
          <p className={showInstructions}>Click on a song to remove it from the queue</p>
        </div>
      );
    } else return null;
  }
}


class Letter extends React.Component {
  render() {
    return (
      <Button
        color="primary" 
        variant="contained"
        onClick={this.props.handleBrowse}
        value={this.props.letter}>
          {this.props.letter}
      </Button>
    );
  }
}

class Letters extends React.Component {
  render() {

    if (this.props.mode.substring(0,6)==="browse") {
      if (this.props.songListCount > 0) {
        return (
            <div className="letters">
              <Button
               variant="contained"
                color="primary"
                letter=""
                onClick={this.props.handleBrowse} >← Back</Button>
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
          <h2>Browse By {this.props.mode.substring(8,88)} Name</h2>
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





class SingerName extends React.Component {

  state={
    error:""
  }

  handleClose = () => {
    const newName=document.getElementById("singerName").value
    if (newName.length === 0) {
      this.setState({error:"We need a name"})
    } else {
      this.props.handleSetSingerName(newName)
      this.setState({error:""}, window.scrollTo(0, 0)); // scroll fixes iOS/MUI bug! Don't remove!
    }
  }



  render() {
    if (!this.props.singerName) {
      return(
        <Dialog open={true} className="singerName" onClose={this.handleClose} >
          <DialogTitle>What's your name?</DialogTitle>
          <DialogContent>
            <DialogContentText>We need to know who to call when your song is next up</DialogContentText>
              <TextField
                id="singerName"
                label="Name"
                fullWidth
                name="singerName"
                helperText={this.state.error}
                required
                placeholder="" />

          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleClose}
              startIcon={<KeyboardVoiceIcon />}> Lets Get Singing!</Button>
          </DialogActions>
        </Dialog>
      );
    } else return null
  }
}



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
        const inQueue = (this.props.queue.some(queueEntry => makeKey(queueEntry) === key)) ? true : false;

        // If this song is in the queue, set the song name to have the same SINGERNAME
        // as the queue entry, so if a user clicks on a row we can know whether the
        // song was theirs or not.
        const queueEntry = (inQueue === true) ? this.props.queue.filter(queueEntry => makeKey(queueEntry) === key)[0] : {}
        song.SINGERNAME = queueEntry.SINGERNAME
      
        return (
          <SongRow
              handleRowClick = {this.props.handleRowClick}
              handleMoveSong = {this.props.handleMoveSong}
              song={song}
              inQueue={inQueue}
              showAllFields={showAllFields}
              key={key} />
        );
      });

      //const lintFix=<></> // fix for sublimetext syntax highlighting!  This does nothing.

      let tableHeader;

      if (showAllFields) {
        tableHeader = <tr>
                        <th colSpan="2" >Singer</th>
                        <th id="SONG" onClick={this.handleSetSortBy}>Song</th>
                        <th id="ARTIST" onClick={this.handleSetSortBy}>Artist</th>
                        <th>Code [Track]</th>
                        <th>Reorder</th>
                      </tr>
      } else {
        const sortedBySong = (this.props.sortBy === "SONG") ? " ▼" : " ▿";
        const sortedByArtist =  (this.props.sortBy === "ARTIST") ? " ▼" : " ▿";

        tableHeader = <tr>
                        <th colSpan="2" id="SONG" onClick={this.handleSetSortBy}>Song{sortedBySong}</th>
                        <th id="ARTIST" onClick={this.handleSetSortBy}>Artist{sortedByArtist}</th>
                      </tr>
      }




      return (
        <table className="songList">
        <thead>
          {tableHeader}
      </thead>
        <tbody>
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
    this.props.handleRowClick(this.props.song);
  }

  handleMoveSong = (event) => {
    this.props.handleMoveSong(this.props.song, event.target.getAttribute("name"))
  }

  render() {
    const inQueue = this.props.inQueue ? "🎤" : "💿";
    if (this.props.showAllFields) {
      return (
        <tr className={inQueue}>
          <td onClick={this.handleClick}>{inQueue}</td>
          <td onClick={this.handleClick}>{this.props.song.SINGERNAME}</td>
          <td onClick={this.handleClick}>{this.props.song.SONG}</td>
          <td onClick={this.handleClick}>{this.props.song.ARTIST}</td>
          <td onClick={this.handleClick} >{this.props.song["MF CODE"]} [{this.props.song.TRACK}]</td>
          <td className="move-song-buttons">
              <span 
                role="img"
                aria-label="Promote {this.props.song.SONG}" 
                name="up"
                onClick={this.handleMoveSong}>🔼</span>&nbsp;<span 
                role="img"
                aria-label="Demote {this.props.song.SONG}"
                name="down"
                onClick={this.handleMoveSong}>🔽</span>
          </td>
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


class App extends React.Component {
  state = {
    songs:[],
    searchTerm:"",
    browseLetter:"",
    queue:[],
    queueName:"default-queue",
    mode:"search",
    sortBy:"SONG",
    singerName:""
  };



  componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("singerName")) {
      this.setState({singerName: params.get("singerName")})
    };

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
      const fbQueue = db.collection(this.state.queueName).orderBy("POSITION", "asc") ;
      let that=this;
      fbQueue.get().then(function(querySnapshot) {
        const currentQueue = querySnapshot.docs.map((row) => {
          return(row.data())
        })
        that.setState({queue: currentQueue})
      })
  }

  handleChangeSearchTerm = (event) => {
    this.setState({mode: "search", searchTerm: event.target.value, browseLetter: ""});
  }

  handleSetSingerName = (newName) => {
    console.log("Setting name to " + newName)
    this.setState({singerName: newName});
  }


  handleSetSortBy = (sortBy) => {
    this.setState({sortBy: sortBy})
  }

  handleSetMode = (event) => {
    const mode = event.currentTarget.value;
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
      const question = ((undefined === song.SINGERNAME) || (this.state.singerName === song.SINGERNAME))
        ? "Delete '" + song.SONG + "' from the queue?"
        : "Delete '" + song.SONG + "' from the queue?\n\n⚠️ You did not add this song, this was added by " + song.SINGERNAME


      if (window.confirm(question)) {
        // firebase remove this song
        db.collection(this.state.queueName).doc(key).delete().then(this.getQueue)
      }
    } else {
      // assume that the last song in the queue has the highest number.
      const nextPosition = this.state.queue.slice(-1)[0]["POSITION"] + 1;

      song.POSITION = nextPosition;
      song.TS = timestamp;
      song.SINGERNAME = this.state.singerName;
      // firebase add this song
      db.collection(this.state.queueName).doc(key).set(song).then(this.getQueue)
    }
  };


  handleMoveSong = (song, direction) => {
    const songPosition = song.POSITION;
    const songIndex = this.state.queue.findIndex(song => song.POSITION === songPosition);

    const otherSongIndex = (direction === "up") ? songIndex - 1 : songIndex + 1;
    const otherSong = this.state.queue[otherSongIndex];

    if (undefined !== otherSong) {
      // console.log ("swapping " + song.SONG + " with " + otherSong.SONG)
      const otherSongPosition = otherSong.POSITION

      song.POSITION = otherSongPosition;
      otherSong.POSITION = songPosition;

      db.collection(this.state.queueName).doc(makeKey(song)).set(song).then(this.getQueue)
      db.collection(this.state.queueName).doc(makeKey(otherSong)).set(otherSong).then(this.getQueue)
    } 
  }

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
            queueCount={this.state.queue.length}
            searchTerm = {this.state.searchTerm}
            handleChangeSearchTerm = {this.handleChangeSearchTerm} />
        <Spinner
            songsTotalCount={this.props.songsTotalCount} />
          <Queue
            mode = {this.state.mode}
            queue={this.state.queue} />
          <Letters
            mode = {this.state.mode}
            browseLetter = {this.state.browseLetter}
            songListCount={songsToList.length}
            handleBrowse={this.handleBrowse} />
          <SongList
            mode={this.state.mode}
            sortBy={this.state.sortBy}
            handleRowClick = {this.handleRowClick}
            handleMoveSong = {this.handleMoveSong}
            handleSetSortBy = {this.handleSetSortBy}
            queue={this.state.queue}
            songs={songsToList} />
          <SingerName
            singerName={this.state.singerName}
            handleSetSingerName={this.handleSetSingerName} />

        </div>
      );
    }
  
}

export default App;
