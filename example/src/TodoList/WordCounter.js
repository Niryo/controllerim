import * as React from 'react';
import {Controller} from 'react-view-controllers';

export class WordCounter extends React.Component {
  componentWillMount() {
    console.log(this.context);
    this.todoListController = new Controller(this).getParentController('TodoList');
  }

  render(){
    return (
      <div>{this.todoListController.getSelectedItem().title}</div>
    );
  }
}  