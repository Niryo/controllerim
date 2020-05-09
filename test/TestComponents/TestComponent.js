import * as React from 'react';
import {observer} from '../../src';
import {TestComponentController} from './TestComponentController';
import {InnerComponent} from './InnerComponent';
export const TestComponentClass = observer(class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {flag: true};
    this.controller = TestComponentController.create();
  }
  render() {
    this.props.renderCallback && this.props.renderCallback();
    return (
      <div>
        <div data-hook="blamos">{this.controller.getBlamos()}</div>
        <div data-hook="boundBlamos">{this.controller.getBoundBlamos()}</div>
        <div data-hook="randomNumberPreview">{this.controller.tetMemoized(this.state.flag)}</div>
        <div data-hook="getterWithArgsPreview">{this.controller.getterWithArg(this.state.flag, 'blamos')}</div>
        <div data-hook="cyclicPreview">{this.controller.getCyclic()}</div>
        <div data-hook="previewNonExistProp">{this.controller.getNonExist()}</div>
        <div data-hook="counterPreview">{this.controller.getCounter()}</div>
        <div data-hook="dynamicObjectPreview">{this.controller.getDynamicObject()}</div>
        <div data-hook="increaseCounter" onClick={() => this.controller.increaseCounter()} />
        <div data-hook="setObjFromProps" onClick={() => this.controller.setObj(this.props.obj)} />
        <div data-hook="testAsync" onClick={() => this.controller.setAsync()} />
        <div data-hook="setCyclic" onClick={() => this.controller.setCyclic()} />
        <div data-hook="toggleFlag" onClick={() => this.setState({flag: !this.state.flag})} />
        <div data-hook="setDynamicArray" onClick={() => this.controller.addArrayToDynamicObject()} />
        <div data-hook="setDynamicName" onClick={() => this.controller.addNameToDynamicObjectArray()} />
        <div data-hook="changeMultiPropsButton" onClick={() => this.controller.changeMultipleProps()} />
        <div data-hook="changeUnrelevantProp" onClick={() => this.controller.changeUnrelevantProp()} />
        <div data-hook="setSetterWithArgs" onClick={() => this.controller.setterWithArg('this is a given arg')} />
        <div data-hook="resetState" onClick={() => this.controller.resetState()} />
        <div data-hook="setNonExist" onClick={() => this.controller.setNonExistProp()} />
        {this.state.flag && <InnerComponent/>}
      </div>
    );
  }
});

