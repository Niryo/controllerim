# Controllerim

A simple, clean and well structured state management library for react

[![npm version](https://img.shields.io/npm/v/controllerim.svg)](https://www.npmjs.com/package/controllerim)

## Installation

`npm install controllerim --save`

## Migrating from Controllerim v2 to v3
The migration process should be very easy. Follow the docs and the example project for understanding the new API.

## Basic usage example



Inside `ParentController.js`:

```javascript
import { controller } from 'controllerim';

class _ParentController {
  constructor() {
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

export const ParentController = controller(_ParentController);
```

Inside `Parent.jsx`:

```javascript
import React, { Component } from 'react';
import { observer } from 'controllerim';
import { ParentController } from './ParentController';

class Parent extends Component {
  constructor(props) {
    super(props);
    this.controller = ComponentController.create(); //returns a fresh controller instance
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
```

Inside `Child.jsx`:

```javascript
import React, { Component } from 'react';
import { observer} from 'controllerim';
import {ParentController} from './ParentController'

class Child extends Component {
  constructor(props){
    super(props);
    this.parentController = ParentController.getInstance(); //returns an existing instance of the parentController. You could supply an id if you you have more than one instances of the parent controller.
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
You can see the source code under the example folder: [demo-app/src](demo-app/src)
If you want to run it locally:
After cloning the repository, navigate to the demo-app folder and type in your terminal:

```
npm install
npm start
```

## How

Controllerim utilizes [Mobx](https://github.com/mobxjs/mobx) behind the scenes. You don't need to learn Mobx in order to use Controllerim, but a basic understanding of Mobx is recommended.

## Api

### `controller(controllerClass)`
##### Arguments:
* **controllerClass**: any es6 class with a state member.
##### Returns:
* **Object: { create(), getInstance() }**: an object with two factory methods for getting a new controller instance 

A controller is a plain Javascript class that holds a  **state** and methods for manipulating the state.
All the methods of the controller are smartly memoized and computed, thus if you do some heavy calculation, it will be re-calculated when really needed.

The observers (React Components that you wrapped within `observer`) will react to any change in the state, even changes of deep nested properties.

#### `create(id?: string (default: 'globalInstance') )`:

Returns a new instance of the given controller. You should use this method when you know for sure that you need a fresh instance and not an existing one (most of the time you should prefer `create` over `getInstance`). You can pass an `id`, for being used later by getInstance.

#### `getInstance(id?: string (default: 'globalInstance'))`:
Returns an existing instance of the given controller, or a new one if there isn't any existing instance yet. If you don't supply an `id`, the return value will be the default global instance.


#### controller Usage example:

```javascript
import {controller} from 'controllerim';

class _AppController {
  constructor() {
    this.state = {totalNotesCount: 2};                                 
  }

  getTotalNotesCount() {
    return this.state.totalNotesCount;
  }

  increaseCounter() {
    this.state.totalNotesCount++;
  }
}

export const AppController = controller(_AppController);
```

Your React component will create an instance of the controller like this: 

```javascript
import {AppController} from 'controllerim';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.controller = AppController.create();
  }

  render(){
    <div>
      <div>{this.controller.getTotalNotesCount()}</div>
      <div onPress={() => this.controller.increaseCounter()}>click me</div>
    </div>
  }
}
```

### `useController(controllerInstance)`

Allows you to use controller inside a functional component. Note that you still have to wrap your functional component within `observer`.

```javascript
import React from 'react';
import {observer, useController} from 'controllerim';
import {FunctionalComponentController} from './TestComponentController';

export const FunctionalComponent = observer(() => {
  const controller = useController(FunctionalComponentController.create());
  return (
    <div>
      <div>{controller.getUserName()}</div>
      <div onClick={() => controller.changeUserName()}>click me</div>
    </div>
  );
});
```
### `observer(ReactComponent)`

To become reactive, every React component that uses a controller, should be wrapped within `observer`. 

```javascript
import {observer} from 'controllerim';

export const SomeSmartComponent = observer(class extends React.Component {
...
})
```

### `store(storeClass)`
A store is just a global singleton controller that is not conceptually bound to any specific component. 

inside `AppStore.js`:
```javascript
  import {store} from 'controllerim';

  class _AppStore {
    constructor(){
      this.state = {useName: 'bla'};
    }

    getUserName() {
      return this.state.userName;
    }
  }

  export const AppStore = store(_AppStore);
```

Inside `component.jsx`:

```javascript
import React from 'react';
import {observer} from 'controllerim'
import {AppStore} from './AppStore';

class SomeComponent extends React.Component {
  render(){
    <div>{AppStore.getUserName()}</div> // <== The component will re-render on any change in getUserName
  }
}

export default observer(SomeComponent);
```

