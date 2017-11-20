import * as React from 'react';
let controllers = {};
let counter = 0;
let _isTestMod = false;

//Fake class for initializing the mock parent
class FakeComponent extends React.Component {
  render() {
    return null;
  }
}

const TEST_ID = '__reactViewControllersIdForTesting';
const isTestMod = () => {
  return _isTestMod;
};
const registerControllerForTest = (controller, component) => {
  component[TEST_ID] = counter;
  controllers[counter] = controller;
  counter++;

  attachMockState(controller);
  attachMockParent(controller);
};

const attachMockState = (controller) => {
  controller.mockState = (state) => {
    Object.assign(controller.state, state);
  };
};

const attachMockParent = (controller) => {
  controller.mockParent = (ParentController, state) => {
    const parentInstace = new ParentController(new FakeComponent);
    Object.assign(parentInstace.state, state);
    controller.component.context = controller.component.context || {};
    controller.component.context.controllers = controller.component.context.controllers || {};
    controller.component.context.controllers[ParentController.name] = parentInstace;
  };
};

const getControllerOf = (component) => {
  if (!isTestMod()) {
    throw new Error('You must call TestUtils.init() before using getControllerOf');
  }
  return controllers[component[TEST_ID]];
};

const init = () => _isTestMod = true;


const clean = () => {
  _isTestMod = false;
  controllers = {};
  counter = 0;
};

export const TestUtils = {
  isTestMod,
  registerControllerForTest,
  getControllerOf,
  init,
  clean
};