let controllers = {};
let mockedParentsOfControllers = {};
let counter = 0;
let _isTestMod = false;

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
  controllers = {};
  mockedParentsOfControllers = {};
  counter = 0;
  _isTestMod = false;
};

const mockParentOf = (controllerName, ParentControllerClass, state) => {
  const parent = new ParentControllerClass({ context: { controllers: [] } });
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