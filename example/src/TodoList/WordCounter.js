import * as React from 'react';
import {Controller} from 'react-view-controllers';
import PropTypes from 'react';
export class WordCounter extends React.Component {
  componentWillMount() {
    console.log(this.props.context);
    this.todoListController = new Controller(this).getParentController('TodoListController');
  }

  render(){
    return (
      <div>{this.todoListController.getSelectedItem().title}</div>
    );
  }
}  
