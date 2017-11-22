# React View Controllers
A state management library for react, based on Mobx

## Installation
`npm install react-view-controllers --save`

## Agenda:
* React componets state is really good for dumb components, but its not so good for smart components. It cannot be esaly shared to deep nested children, it prevents separation of logic and view to different files, and it is not easly testable. React view controllers tackles exactluy those points.
* Every 'smart component' should have a controller.
* A controller is a plain Javascript class and is not aware of the view it controls. A view could be easly replaced without the need for making changes in the controller. 
* The controller holds a state and methods for manipulating the state. 
* The controller's lifecycle should be bounded to the component's lifecycle. when a component enters the screen, A new fresh controller will be created, and when the component is destroyed the controller will be destroyed.
* A component can get and set data from parents controllers (not necessarily direct parents), but it cannot use data from the controllers of sibling components.
* Every controller should be explicitly provided in order to be used by child components.
* Any change in the controller state will be automatically reflected in the view.

## Why 
* **Zero boilerplate:** Controllers are just plain javascript classes, and All you need to do in order to make your views react to changes in the controllers, is just to wrap them with `observer` and you are good to go.

* **No need for singleton stores:** If you ever used Redux, you probably knows what happens when you forget to clean your stores when a component leave the screen- the next time it enters the screen, it fetches some old state-related data from the store and bad things happens. You may say that stores should not contain state related data, but sometimes you just need to share state across multiple components, for example, `currentSelectedItem`, `isCartFull`, `canMoveToNextStep` etc. 
`Controllers` lifecycle is binded to the component lifecycle, so you get a fresh controller out of the box whenever a component enters the screen.

* **Reusability:** Each component holds an *instance* of it's Controller (again, no singletons!), so you can create **multiple  instances of a component** (see example project). When you have a singleton store its much more cumbersome to support multiple instance of a component. 

* **Better encapsulation**: A component can fetch data only from it's direct controller and it's parents controllers. You cannot feth data from sibling component's Controllers. If you need some piece of data to be visible for two sibling components, it means that this data should sit within their first common parent. If you need a piece of data to be visible to all other component, put it in your AppController.


## How
Most of the heavy lifting is being done behind the scenes with the help of [Mobx](https://github.com/mobxjs/mobx).

## How does it look:
Inside `NotesListController.js`: 
```javascript
import { Controller } from 'react-view-controllers';

export class NotesListController extends Controller {
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

Inside `NotesList.jsx`:
```javascript
import React, { Component } from 'react';
import { observer } from 'react-view-controllers';
import { NotesListController } from './NotesListController';

class NotesList extends Component {
  componentWillMount() {
    this.controller = new NotesListController(this);
  }

  render() {
    return (
      <div>
        <div>{this.controller.getMessage()}</div>
        <button onClick={() => this.controller.setMessage('hello world!')}>Click me to change message</button>
      </div>
    );
  }
}

export default observer(NotesList);

```

### Example project
Here is a [Simple example project](https://niryo.github.io/react-view-controllers/)
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

* #### `getParentController(controllerName: string)`:
Use this Controller method when you need to fetch data from a parent controller (not necessarily a direct parent).
The name of the parent controller is the name of the class, as returned from Class.name.
If for example your code looks like this: 
```javascript
class SomeParentController extends Controller{}
````
then the name will be 'SomeParentController' (`SomeParentController.name`).
Make sure that the parent controller is provided using `ProvideController`.
You cannot get the controller of a sibling component. If you need to use some data from a sibling component, put this data in the first common parent of the two components.

If you need to interact with a parent controller from your React component, you can do something like this:
```javascript
 componentWillMount() {
    this.controller = new SomeChild(this);
    this.parentController = this.controller.getParentController(SomeParentController.name);
  }
```
Or directly:
```javascript
 componentWillMount() {
    this.parentController = new Controller(this).getParentController(SomeParentController.name);
  }
```

#### Usage example:
```javascript
import {Controller} from 'react-view-controllers';
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
  const someProp = super.getParentController(SomeParentController.name); //you can use the name of the controller as string,                                                                          //but this way is safer.
  //do something with someProp...
  }
}
```

Your React component will create an instance of the Controller inside **`componentWillMount`** like this:

```javascript
import {AppController} from 'react-view-controllers';

class App extends React.Component {
   componentWillMount() {
    this.controller = new AppController(this);
   }
}
```


### `observer(ReactComponent)`
To become reactive, every React component that uses a controller should be wrapped within `observer`. 

#### Usage example:
```javascript
import {observer} from 'react-view-controllers';

class SomeSmartComponent extends React.Component {
...
}

export default observer(SomeSmartComponent)
```


### `<ProvideController controller={controllerInstance}/>`:
If you want your controller instance to be visible to your child components, you must explicitly provide it using ProvideController.

#### Usage example:
```javascript
import * as React from 'react';
import SomeParentComponentController from './SomeParentComponentController';
import { observer, ProvideController } from 'react-view-controllers';

class SomeParentComponent extends React.Component {
  componentWillMount() {
    this.controller = new SomeParentComponentController(this);
  }

  render() {
    return (
        <ProvideController controller={this.controller}>
           <SomeChild>
           <AnotherChild>
        </ProvideController>
    );
  }
}

```

In the above example, SomeChild and AnotherChild could make use of `SomeParentComponentController` using `getParentController()`.



