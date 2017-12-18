# Controllerim
A simple, clean and well structured state management library for react

[![npm version](https://img.shields.io/npm/v/controllerim.svg)](https://www.npmjs.com/package/controllerim)
## Installation
`npm install controllerim --save`

## Why is Controllerim a better approach than Redux
[the ugly side of Redux (blog post)](https://medium.com/@niryo/the-ugly-side-of-redux-6591fde68200)

## Getting started
[A step by step tutorial](https://medium.com/@niryo/getting-started-with-controllerim-9d9b29923713)

## Basic usage example
*Note: This is a usage example of sharing data between parent and a direct child, but keep in mind that the child could have been a nested child and everything would have stayed the same*.

Inside Parent.jsx

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
});

export default obvserver(Parent);
/** 
note: If you don't want to use default export, you could export the class directly:
export const Parent = observer( class extends Component {
  ...
  }
);

*/

```

Inside `ParentController.js`: 
```javascript
import { Controller } from 'controllerim';

export class ParentController extends Controller {
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

Inside Child.jsx:
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
});

export default obvserver(Child);
```


## Agenda
* Data flow is unidirectional- from parent down to the children. A parent cannot fetch data from child controllers.
* Every 'smart component' should have a controller.
* A controller is a plain Javascript class and is not tightly coupled to any view.
* The controller holds a state and methods for manipulating the state. 
* The controller's lifecycle should be bound to the component's lifecycle. when a component enters the screen, A new fresh controller will be created, and when the component is destroyed the controller will be destroyed.
* A component can get and set data from parents' controllers (not necessarily direct parents), but it cannot use data from the controllers of sibling components.
* Any changes to the controller state will be automatically reflected by the view.

## Why 
* **Zero boilerplate:** Controllers are just plain javascript classes, and All you need to do in order to make your views react to changes in the controllers, is just to wrap them with `observer` and you are good to go.

* **No need for singleton stores:** If you ever used Redux, you probably knows what happens when you forget to clean your stores when a component leave the screen- the next time it enters the screen, it fetches some old state-related data from the store and bad things happens. You may say that stores should not contain state related data, but sometimes you just need to share state across multiple components, for example, `currentSelectedItem`, `isCartFull`, `canMoveToNextStep` etc. 
`Controllers` lifecycle is bound to the component lifecycle, so you get a fresh controller out of the box whenever a component enters the screen.

* **Reusability:** Each component holds an *instance* of it's Controller (again, no singletons!), so you can create **multiple  instances of a component** (see example project). When you have a singleton store its much more cumbersome to support multiple instance of a component. 

* **Better encapsulation**: A component can fetch data only from it's direct controller and it's parents controllers. You cannot feth data from sibling component's Controllers. If you need some piece of data to be visible for two sibling components, it means that this data should sit within their first common parent. If you need a piece of data to be visible to all other component, put it in your AppController.

* **Mimics React's local component's state :** React state is really good for dumb components, but its not so good for smart components. It cannot be esaly shared to deep nested children, it prevents separation of logic and view to different files, and it is not easly testable. controllerim tackles exactly those points.

## How
The basic (and naive) idea works very similar to React's local components' state, by forcing the component to update on every call to a setter function on the controller. But this is expensive, because we want to render things only if they are trully effected by the change. So Controllerim utilizes [Mobx](https://github.com/mobxjs/mobx) behind the scenes for all the performance boosts (Memoizes values, calculates dependencies and renders only when trully needed).
Controllerim uses es6 Proxies to proxy Mobx out of the way and keep the state nice and clean, so its not tightly coupled to Mobx. If you are using an old browser that doesn't support Proxies, Controllerim will fallback to the naive solution, but don't worry - es6 Proxy support is very wide, and for most of the web apps the naive solution works fast enough.

### Example project
Here is a [Simple example project](https://niryo.github.io/controllerim/)
You can see the source code under the example folder: [example/src](example/src)
If you want to run it locally:
After cloning the repository, nevigate to the example folder and type in your terminal:
```
npm install
npm start
```

## Api
### `Controller(componentInstance)`
Every view should have a controller that extends `Controller`. A controller is a plain javascript class that holds an observable state. a controller should contain only a **state** and methods that manipulate the state.
Make sure to call `super(componentInstance)` from your controller constructor.
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
  constructor(comp){
    super(comp);
  }
  getPropFromParentController() {
    return this.getParentController(SomeParentController.name).getSomeProp();
  }
}
```
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
* #### `clearState()`:
Clears the state back to it's initial value.

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

