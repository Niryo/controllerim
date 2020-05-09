import * as React from 'react';
import {NotesListController} from './NotesListController';
import { observer } from 'controllerim';
import {appStore} from '../App/AppStore';
import './NotesList.css';
import {NotificationListItem} from './NotificationListItem';
export const NotesList = observer(class extends React.Component {
  constructor(props) {
    super(props);
    // get own controller:
    this.controller = NotesListController.create(this.props.id);
  }
  
  renderListItems() {
    return this.controller.getListItems().map((item) => <NotificationListItem item={item} controllerId={this.props.id}/>);
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
              placeholder={`Hello ${appStore.getUserName()}, Whats on your mind?`}
            />
            <button onClick={() => this.controller.addRandomJoke()}>Add chuck norris joke</button>
            <button onClick={() => this.controller.copyNoteToOther(this.props.id)}>Copy to other note list instance</button>
          </div>
        </div>
      </div>
    );
  }
});

