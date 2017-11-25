import React, { Component } from 'react';
import './App.css';
import NotesList from '../NotesList/NotesList';
import { observer, ProvideController } from 'controllerim';

import { AppController } from './AppController';

class App extends Component {
  componentWillMount() {
    this.controller = new AppController(this);
  }

  render() {
    return (
      <ProvideController controller={this.controller}>
        <div className="appContainer">
          <h1>This is an example of multiple instacne of the same component (with different themes)</h1>
          <h2 data-hook="counter">Total notes count: {this.controller.getTotalNotesCount()}</h2>
          <label className="userNameInputLabel">Enter Your Name:</label>
          <input
            className="userNameInput"
            value={this.controller.getUserName()}
            onChange={(e) => this.controller.setUserName(e.target.value)} />
          <div className="notesContainer">
            <div className="leftNote">
              <NotesList theme={'theme1'} />
            </div>
            <div>
              <NotesList theme={'theme2'} />
            </div>
          </div>
        </div>
      </ProvideController>
    );
  }
}

export default observer(App);
