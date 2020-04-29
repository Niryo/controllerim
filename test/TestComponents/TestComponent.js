import * as React from 'react';
import {observer} from '../../src';
import {getInstance} from './TestComponentController';
import {InnerComponent} from './InnerComponent';
const controller = getInstance();
export const TestComponentClass = observer(class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {flag: true};
  }
  render() {
    this.props.renderCallback && this.props.renderCallback();
    return (
      <div>
        <div data-hook="blamos">{controller.getBlamos()}</div>
        <div data-hook="boundBlamos">{controller.getBoundBlamos()}</div>
        <div data-hook="randomNumberPreview">{controller.tetMemoized(this.state.flag)}</div>
        <div data-hook="getterWithArgsPreview">{controller.getterWithArg(this.state.flag, 'blamos')}</div>
        <div data-hook="cyclicPreview">{controller.getCyclic()}</div>
        <div data-hook="previewNonExistProp">{controller.getNonExist()}</div>
        <div data-hook="counterPreview">{controller.getCounter()}</div>
        <div data-hook="dynamicObjectPreview">{controller.getDynamicObject()}</div>
        <div data-hook="increaseCounter" onClick={() => controller.increaseCounter()} />
        <div data-hook="setObjFromProps" onClick={() => controller.setObj(this.props.obj)} />
        <div data-hook="testAsync" onClick={() => controller.setAsync()} />
        <div data-hook="setCyclic" onClick={() => controller.setCyclic()} />
        <div data-hook="toggleFlag" onClick={() => this.setState({flag: !this.state.flag})} />
        <div data-hook="setDynamicArray" onClick={() => controller.addArrayToDynamicObject()} />
        <div data-hook="setDynamicName" onClick={() => controller.addNameToDynamicObjectArray()} />
        <div data-hook="changeMultiPropsButton" onClick={() => controller.changeMultipleProps()} />
        <div data-hook="changeUnrelevantProp" onClick={() => controller.changeUnrelevantProp()} />
        <div data-hook="setSetterWithArgs" onClick={() => controller.setterWithArg('this is a given arg')} />
        <div data-hook="resetState" onClick={() => controller.resetState()} />
        <div data-hook="setNonExist" onClick={() => controller.setNonExistProp()} />
        {this.state.flag && <InnerComponent/>}
      </div>
    );
  }
});

