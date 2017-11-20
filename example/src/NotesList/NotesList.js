import * as React from 'react';
import { NotesListController } from './NotesListController';
import { observer } from 'react-view-controllers';
import {AppController} from '../App/AppController';
import './NotesList.css';
class NotesList extends React.Component {
  componentWillMount() {
    this.controller = new NotesListController(this);
    this.appController = this.controller.getParentController(AppController.name);
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
    if (e.keyCode === 13 && value !== '') {
      this.controller.addNote();
      this.appController.increaseCounter();
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
                onKeyDown={this.handleOnKeyDown} />
            </div>
            <div className="rightPane">
              <textarea
                value={this.controller.getSelectedItem().text}
                onChange={(e) => this.controller.editSelectedNote(e.target.value)}
                placeholder="Whats on your mind?"
              />
            </div>
          </div>
        </div>
    );
  }
}

export default observer(NotesList);