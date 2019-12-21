let controllers = {};
let mockedParentsOfControllers = {};
let _isTestMod = false;

export const isTestMod = () => {
  return _isTestMod;
};
export const registerControllerForTest = (controller, component) => {
  controllers[component.props.testModeID] = controller;
};

const getControllerOf = (component) => {
  if (!isTestMod()) {
    throw new Error('You must call TestUtils.init() before using getControllerOf');
  }
  return controllers[component.testModeID];
};

const init = () => _isTestMod = true;


const clean = () => {
  controllers = {};
  mockedParentsOfControllers = {};
  _isTestMod = false;
};

const mockParentOf = (controllerName, ParentControllerClass, state) => {
  const parent = new ParentControllerClass({context: { controllers: [] }, props: {controllerimContext: { controllers: [] },controllerimStateTreeNode: {state: {}, children: []},testModeID: Math.random()} });
  mockedParentsOfControllers[controllerName] = parent;
  if (state) {
    parent.mockState(state);
  }
};

const mockStateOf = (controllerInstance, state) => {
  controllerInstance.mockState(state);
};

export const getMockedParent = (name) => {
  return mockedParentsOfControllers[name];
};
export const TestUtils = {
  getControllerOf,
  init,
  clean,
  mockParentOf,
  mockStateOf
};