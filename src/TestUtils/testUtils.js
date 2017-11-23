import * as React from 'react';
let controllers = {};
let mockedParentsOfControllers = {};
let counter = 0;
let _isTestMod = false;

//Fake class for initializing the mock parent
class FakeComponent extends React.Component {
  render() {
    return null;
  }
}

const TEST_ID = '__reactViewControllersIdForTesting';
export const isTestMod = () => {
  return _isTestMod;
};
export const registerControllerForTest = (controller, component) => {
  component[TEST_ID] = counter;
  controllers[counter] = controller;
  counter++;
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
  mockedParentsOfControllers = {};
};

const mockParentOf = (controllerName, ParentClass, state) => {
  const parent = new ParentClass(FakeComponent);
  mockedParentsOfControllers[controllerName] = parent;
  if (state) {
    parent.mockState(state);
  }
};

export const getMockedParent = (name) => {
  return mockedParentsOfControllers[name];
};
export const TestUtils = {
  getControllerOf,
  init,
  clean,
  mockParentOf
};