import React, { Component } from 'react';
import './App.css';
import NotesList from '../NotesList/NotesList';
import { observer, ProvideController } from 'react-view-controllers';

import {AppController} from './AppController';

class App extends Component {
  componentWillMount() {
    this.controller = new AppController(this);
  }

  render() {
    return (
      <ProvideController controller={this.controller}>
        <h1>This is an example of multiple instacne of the same component</h1>
        <h2>Total notes count: {this.controller.getTotalNotesCount()}</h2>
        <div className="notesContainer">
          <div className="leftNote">
            <NotesList theme={'theme1'}/>
          </div>
          <div>
            <NotesList theme={'theme2'} />
          </div>
        </div>
      </ProvideController>
    );
  }
}

export default observer(App);
