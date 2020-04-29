import React from 'react';
import {observer, Controller} from '../../src';

export const InnerComponentController = Controller(class {
  constructor() {
    this.state = {bla: 'bla'};
  }
  getBla() {
    return this.state.bla;
  }
  setBla() {
    this.state.bla = 'changed';
  }
});
export const InnerComponent = observer(class extends React.Component {
  constructor() {
    super();
    this.controller = InnerComponentController.create();
  }

  render() {
    return (
      <div>
        <div>inner component {this.controller.getBla()}</div>
        <div data-hook="setInnerComponentBla" onClick={() => this.controller.setBla()} />
      </div>
    
    );
  }
});