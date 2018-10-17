# Controllerim

A simple, clean and well structured state management library for react

[![npm version](https://img.shields.io/npm/v/controllerim.svg)](https://www.npmjs.com/package/controllerim)

## Installation

`npm install controllerim --save`

 #### For React Native:
 
`npm install controllerim@reactNative --save`

## Posts

* [The Ugly Side Of Redux (blog post)](https://medium.com/@niryo/the-ugly-side-of-redux-6591fde68200)

* [A step by step tutorial](https://medium.com/@niryo/getting-started-with-controllerim-9d9b29923713)

* [Using the State Tree (tutorial)](https://medium.com/@niryo/lets-build-a-time-machine-51256d20679d)

## React Native Support

Controllerim mostly supports React Native, but `setStateTree` and `addOnStateTreeChangeListener` will not work. 
Those are advanced functions and are rarely used, so you are probably not going to feel their absence.
Use `reactNative` tag when installing:
`npm install controllerim@reactNative --save`

## Basic usage example

*Note: This is a usage example of sharing data between parent and a direct child, but keep in mind that the child could have been a nested child and everything would have stayed the same*.

Inside `ParentController.js`:

```javascript
import { Controller } from 'controllerim';

export class ParentController extends Controller {
  static controllerName = 'ParentController';
  constructor(compInstance) {
    super(compInstance);
    this.state = {
      message: 'hello' 
    };
  }
  getMessage() {
    return this.state.message;
  }
  setMessage(value) {
    this.state.message = value;
  }
}
```

Inside `Parent.jsx`:

```javascript
import React, { Component } from 'react';
import { observer } from 'controllerim';
import { ParentController } from './ParentController';

class Parent extends Component {
  componentWillMount() {
    this.controller = new ParentController(this);
  }

  render() {
    return (
      <div>
        <h1>{this.controller.getMessage()}</h1>
        <Child/>
        <button onClick={() => this.controller.setMessage('hello world!')}>Click me to change message</button>
      </div>
    );
  }
};

export default observer(Parent);
/** 
note: If you don't want to use default export, you could export the class directly:
export const Parent = observer( class extends Component {
  ...
  }
);

*/
```

Inside `Child.jsx`:

```javascript
import React, { Component } from 'react';
import { observer} from 'controllerim';
import { ChildController } from './ChildController';

class Child extends Component {
  componentWillMount() {
    this.controller = new ChildController(this);
    this.parentController = this.controller.getParentController('ParentController');
  }

  render() {
    return (
      <div>
        <span>This is a message from parent: {this.parentController.getMessage()}</span>
      </div>
    );
  }
};

export default observer(Child);
```
### Example project

Here is a [Simple example project](https://niryo.github.io/controllerim/)
You can see the source code under the example folder: [example/src](example/src)
If you want to run it locally:
After cloning the repository, nevigate to the example folder and type in your terminal:

```
npm install
npm start
```

## Agenda

* Data flow is unidirectional- from parent down to the children. A parent cannot fetch data from child controllers.
* Every 'smart component' should have a controller.
* A controller is a plain Javascript class and is not tightly coupled to any view.
* The controller holds a state and methods for manipulating the state. 
* The controller's lifecycle should be bound to the component's lifecycle. when a component enters the screen, A new fresh controller will be created, and when the component is destroyed the controller will be destroyed.
* A component can get and set data from parents' controllers (not necessarily direct parents), but it cannot use data from the controllers of sibling components.
* Any changes to the controller state will be automatically reflected by the view.


## How

The basic (and naive) idea works very similar to React's local components' state, by forcing the component to update on every call to a setter function on the controller. But this is expensive, because we want to render things only if they are trully effected by the change. So Controllerim utilizes [Mobx](https://github.com/mobxjs/mobx) behind the scenes for all the performance boosts (Memoizes values, calculates dependencies and renders only when trully needed).
Controllerim uses es6 Proxies to proxy Mobx out of the way and keep the state nice and clean, so it's not tightly coupled to Mobx. If you are using an old browser that doesn't support Proxies, Controllerim will fallback to the naive solution, but don't worry - es6 Proxy support is very wide, and for most of the web apps the naive solution works fast enough.

## Api

### `Controller(componentInstance)`

Every view should have a controller that extends `Controller`. A controller is a plain javascript class that holds an observable state. a controller should contain only a **state** and methods that manipulate the state.
Make sure to call `super(componentInstance)` from your controller constructor, and that you add a `controllerName` prop as a static member of your controller class.
Every controller exposes `getParentController()` (See bellow for more details).

* #### state:

Every controller has a state prop. You should initiate the state inside the controller's constructor.
The observers (React Components that you wrapped within `observer`) will react to any change in the state, even changes of deep nested properties. for example:

```javascript
changeName(){
  this.state.listOfItems[0].name = 'foo';
}
```

*Importent:* Every interaction with the state should be done through getters and setters. Do not ever interact with the state directly like this:

```javascript
<button onClick={() => this.controller.state.name = 'bob' }>Change name</button> //WRONG USAGE OF STATE
```

Controllerim makes some assertions based on the fact that every interaction with the state is done through getters and setters on the controller, and interacting with the state directly can lead to unexpected behavior.

* #### `getParentController(controllerName: string)`:

Use this Controller method when you need to fetch data from a parent controller (not necessarily a direct parent).
The name of the parent controller is the name of the class, as returned from Class.name.
If for example your code looks like this: 

```javascript
class SomeParentController extends Controller{}
````

then the name will be 'SomeParentController' (`SomeParentController.name`).
You cannot get the controller of a sibling component. If you need to use some data from a sibling component, put this data in the first common parent of the two components.

If you need to interact with a parent controller from your React component, you can do something like this:

```javascript
  componentWillMount() {
    this.controller = new SomeChild(this);
    this.parentController = this.controller.getParentController(SomeParentController.name);
  }
```

Or anonymously with the the static method of Controller:

```javascript
  componentWillMount() {
    this.parentController =  Controller.getParentController(this, SomeParentController.name);
  }
```

Or within your controller:

```javascript
class SomeChild extends Controller{
  static controllerName = 'SomeChild';
  constructor(comp){
    super(comp);
  }
  getPropFromParentController() {
    return this.getParentController(SomeParentController.name).getSomeProp();
  }
}
```
* #### `static controllerName`:

Every controller should have a static member with it's name.

```javascript
class DogController extends Controller{
  static controllerName = 'DogController';
  constructor(comp){
    super(comp);
  }
}

* #### `getStateTree()`:

Returns a state tree object with the current controller as the root of the tree. The state tree Object is an observable and it is always up to date, just like the controller's state. 

* #### `setStateTree(stateTree: Object)`:

Sets the state tree to the given state tree object. If you are using `setStateTree`, you have to make sure that all the controlled components in your app receive a unique `serialID` via props.

* #### `addOnStateTreeChangeListener(listener: function)`:

Adds a listener for changes in the state tree. On every change to the state tree, the listener will be called with a string json object representing the current state tree, with the current controller as the root.

#### Controller Usage example:

```javascript
import {Controller} from 'controllerim';
import {SomeParentController} from './SomeParentController';

export class AppController extends Controller {
  constructor(comp) {
    super(comp);
    this.state = {totalNotesCount: 2}; //the state should be the only property of the controller, 
                                       //and should be initialized in the constructor.
  }

  getTotalNotesCount() {
    return this.state.totalNotesCount;
  }

  increaseCounter() {
    this.state.totalNotesCount ++;
  }

  getSomePropFromParentController() {
    const someProp = this.getParentController(SomeParentController.name); //you can use the name of the controller as string,                                                                          //but this way is safer.
    //do something with someProp...
  }
}
```

Your React component will create an instance of the Controller inside **`componentWillMount`** like this: 

```javascript
import {AppController} from 'controllerim';

class App extends React.Component {
  componentWillMount() {
    this.controller = new AppController(this);
  }
}
```

**UPDATE: React17 will depreacte componentWillMount. As soon as Facebook release React17, We will need to do some adaptions in Controllerim so it will support initialization in the constructor or in componentDidMount.**

* #### `clearState()`:

Clears the state back to its initial value.

```javascript
class someController extends Controller {
  constructor(comp) {
    super(comp);
    this.state = {someValue: 'bla', someArray: []};
  }
  //...

  doSomething() {
    //...
    this.clearState(); //state now equals {someValue: 'bla', someArray: []}
  }
}
```

### `observer(ReactComponent)`

To become reactive, every React component that uses a controller should be wrapped within `observer`. 
**Importent**: The root component of your app *must* be wrapped within `observer`.

```javascript
import {observer} from 'controllerim';

export const SomeSmartComponent = observer(class extends React.Component {
...
})
```

## Testing Api

#### `TestUtils.init()`:

You must call this method before using any other test utils.

#### `TestUtils.clean()`:

You must call this method after each test (if you used TestUtils.init());

```javascript
import {TestUtils} from 'controllerim';

beforeEach(() => {
  TestUtils.init();
});

afterEach(() => {
  TestUtils.clean();
});
```

#### `getControllerOf(componentInstance)`:

use this method to extract component's controller for testing.

#### `mockStateOf(controllerInstance: controller, state: object)`:

use this method when you need to mock a state of a controller.

```javascript
it('some Test', () => {
  TestUtils.init();
  const component = mount(<Test />);
  const controller = TestUtils.getControllerOf(component.instance());
  TestUtils.mockStateOf(controller,{ name: 'mockedName' });
  expect(component.find('[data-hook="name"]').text()).toEqual('mockedName');
});
```

#### `mockParentOf(controllerName: string, ParentController: Controller, parentState?: object)`:

Use this method if you need to mock parent controllers of component.

* **controllerName**: The name of the controller which his parent needs to be mocked
* **ParentController** The parent controller class that will be mocked.
* **parentState** The state of the mocekd parent.

```javascript
beforeEach(() => {
  TestUtils.init();
  TestUtils.mockParentOf(NotesListController.name, AppController);
});
```
