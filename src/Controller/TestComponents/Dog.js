import * as React from 'react';
import {Controller, observer} from '../../index';

export const Dog = observer(class extends React.Component {
  componentWillMount() {
    this.parentController = new Controller.getParentController(this, 'ParentController');
  }
  render() {
    return <div data-hook="dogBlamos">{this.parentController.getBasicProp()}</div>;
  }
});