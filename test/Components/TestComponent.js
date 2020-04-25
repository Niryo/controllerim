import * as React from 'react';
import {observer} from '../../src/observer';
import {getController} from './TestComponentController';

const controller = getController();
export const TestComponentClass = observer(class extends React.Component {
  render() {
    return (
      <div>
        <div data-hook="blamos">{controller.getBlamos()}</div>
        <div data-hook="counterPreview">{controller.getCounter()}</div>
        <div data-hook="increaseCounter" onClick={() => controller.increaseCounter()} />
        <div data-hook="setObjFromProps" onClick={() => controller.setObj(this.props.obj)} />
        <div data-hook="testAsync" onClick={() => controller.setAsync()} />
      </div>
    );
  }
});

