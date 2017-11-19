import React, { Component } from 'react';
import './App.css';
import { TodoList } from '../TodoList/TodoList';

class App extends Component {
  render() {
    return (
      <div>
        <h1>Multiple instances of the same component:</h1>
        <div class="todoContainer">
          <div class="leftTodo">
            <TodoList />
          </div>
          <div>
            <TodoList />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
