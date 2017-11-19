import * as React from 'react';
import { TodoListController } from './TodoListController';
import { observer, ProvideController } from 'react-view-controllers';
import './TodoList.css';
import { WordCounter } from './WordCounter';
class _TodoList extends React.Component {
  componentWillMount() {
    this.controller = new TodoListController(this);
  }

  renderListItems() {
    return this.controller.getListItems().map((item) => <li className="listItem" onClick={() => this.controller.setSelectedItem(item)}>{item.title}</li>);
  }

  handleOnKeyDown = (e) => {
    const value = e.target.value;
    if (e.keyCode === 13 && value !== '') {
      this.controller.addTodo();
    }
  }

  render() {
    return (
      <ProvideController controller={this.controller}>
        <div className="theme1">
          <div className="container">
            <div className="leftPane">
              <h1>Todo:</h1>
              <ul>
                {this.renderListItems()}
              </ul>
              <div>Enter title and press enter:</div>
              <input
                value={this.controller.getInputValue()}
                onChange={(e) => this.controller.setInputValue(e.target.value)}
                onKeyDown={this.handleOnKeyDown} />
              <WordCounter />
            </div>
            <div className="rightPane">
              <div className="selectedItemTitle">{this.controller.getSelectedItem().title}</div>
              <textarea
                value={this.controller.getSelectedItem().text}
                onChange={(e) => this.controller.editSelectedTodo(e.target.value)}
                placeholder="Whats on your mind?"
              />
            </div>
          </div>
        </div>
      </ProvideController>
    );
  }
}

export const TodoList = observer(_TodoList);