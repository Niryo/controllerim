import * as React from 'react';
import NotesListController from './NotesListController';
import { observer } from 'controllerim';
import AppController from '../App/AppController';
import './NotesList.css';

export const NotesList = observer(class extends React.Component {
  constructor(props) {
    super(props);
    // get own controller:
    this.controller = NotesListController.getCleanController();
    // get access to the app controller, so we could get the userName:
    this.appController = AppController.getController();
  }

  renderListItems() {
    return this.controller.getListItems().map((item) => {
      return (
        <li
          className={`listItem ${this.controller.getSelectedItem().id === item.id ? 'selected' : ''}`}
          onClick={() => this.controller.setSelectedItem(item)}
          key={item.id}
          data-hook="listItem"
        >
          {item.title}
        </li>
      )
    });
  }

  handleOnKeyDown = (e) => {
    const value = e.target.value;
    // add note when user clicks on enter:
    if (e.keyCode === 13 && value !== '') {
      this.controller.addNote();
    }
  }

  render() {
    return (
      <div className={this.props.theme}>
        <div className="container">
          <div className="leftPane">
            <h1>Notes:</h1>
            <ul>
              {this.renderListItems()}
            </ul>
            <div className="inputLabel"> Enter title and press enter:</div>
            <input
              value={this.controller.getInputValue()}
              onChange={(e) => this.controller.setInputValue(e.target.value)}
              onKeyDown={this.handleOnKeyDown}
              data-hook="input"
            />
          </div>
          <div className="rightPane">
            <textarea
              value={this.controller.getSelectedItem().text}
              onChange={(e) => this.controller.editSelectedNote(e.target.value)}
              placeholder={`Hello ${this.appController.getUserName()}, Whats on your mind?`}
            />
            <button onClick={() => this.controller.addRandomJoke()}>Add chuck norris joke</button>
          </div>
        </div>
      </div>
    );
  }
});

