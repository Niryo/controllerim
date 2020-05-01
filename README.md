# Controllerim

A simple, clean and well structured state management library for react

[![npm version](https://img.shields.io/npm/v/controllerim.svg)](https://www.npmjs.com/package/controllerim)

## Installation

`npm install controllerim --save`


## Basic usage example



Inside `ParentController.js`:

```javascript
import { Controller } from 'controllerim';

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

export const ParentController = Controller(_ParentController);
```

Inside `Parent.jsx`:

```javascript
import React, { Component } from 'react';
import { observer } from 'controllerim';
import { ParentController } from './ParentController';

class Parent extends Component {
  constructor(props) {
    super(props);
    this.controller = ComponentController.create();
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
import {ParentController} from './ParentController'

class Child extends Component {
  constructor(props){
    super(props);
    this.parentController = ParentController.getInstance();
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

### `Controller(controllerClass)`
#### Arguments:
    *controllerClass* : any es6 class with a state member.
##### Returns:# Controllerim

A simple, clean and well structured state management library for react

[![npm version](https://img.shields.io/npm/v/controllerim.svg)](https://www.npmjs.com/package/controllerim)

## Installation

`npm install controllerim --save`


## Basic usage example



Inside `ParentController.js`:

```javascript
import { Controller } from 'controllerim';

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

export const ParentController = Controller(_ParentController);
```

Inside `Parent.jsx`:

```javascript
import React, { Component } from 'react';
import { observer } from 'controllerim';
import { ParentController } from './ParentController';

class Parent extends Component {
  constructor(props) {
    super(props);
    this.controller = ComponentController.create();
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
import {ParentController} from './ParentController'

class Child extends Component {
  constructor(props){
    super(props);
    this.parentController = ParentController.getInstance();
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

### `Controller(controllerClass)`
#### Arguments:
    *controllerClass* : any es6 class with a state member.
##### Returns:
    {create(), getInstance()}: two factory methods for getting a new controller instance 

A controller is a plain Javascript class that holds should  **state** and methods that manipulate the state.
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
# Controllerim

A simple, clean and well structured state management library for react

[![npm version](https://img.shields.io/npm/v/controllerim.svg)](https://www.npmjs.com/package/controllerim)

## Installation

`npm install controllerim --save`


## Basic usage example



Inside `ParentController.js`:

```javascript
import { Controller } from 'controllerim';

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

export const ParentController = Controller(_ParentController);
```

Inside `Parent.jsx`:

```javascript
import React, { Component } from 'react';
import { observer } from 'controllerim';
import { ParentController } from './ParentController';

class Parent extends Component {
  constructor(props) {
    super(props);
    this.controller = ComponentController.create();
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
import {ParentController} from './ParentController'

class Child extends Component {
  constructor(props){
    super(props);
    this.parentController = ParentController.getInstance();
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

### `Controller(controllerClass)`
#### Arguments:
    *controllerClass* : any es6 class with a state member.
##### Returns:
    {create(), getInstance()}: two factory methods for getting a new controller instance 

A controller is a plain Javascript class that holds should  **state** and methods that manipulate the state.
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
# Controllerim

A simple, clean and well structured state management library for react

[![npm version](https://img.shields.io/npm/v/controllerim.svg)](https://www.npmjs.com/package/controllerim)

## Installation

`npm install controllerim --save`


## Basic usage example



Inside `ParentController.js`:

```javascript
import { Controller } from 'controllerim';

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

export const ParentController = Controller(_ParentController);
```

Inside `Parent.jsx`:

```javascript
import React, { Component } from 'react';
import { observer } from 'controllerim';
import { ParentController } from './ParentController';

class Parent extends Component {
  constructor(props) {
    super(props);
    this.controller = ComponentController.create();
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
import {ParentController} from './ParentController'

class Child extends Component {
  constructor(props){
    super(props);
    this.parentController = ParentController.getInstance();
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

### `Controller(controllerClass)`
#### Arguments:
    *controllerClass* : any es6 class with a state member.
##### Returns:
    {create(), getInstance()}: two factory methods for getting a new controller instance 

A controller is a plain Javascript class that holds should  **state** and methods that manipulate the state.
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
# Controllerim

A simple, clean and well structured state management library for react

[![npm version](https://img.shields.io/npm/v/controllerim.svg)](https://www.npmjs.com/package/controllerim)

## Installation

`npm install controllerim --save`


## Basic usage example



Inside `ParentController.js`:

```javascript
import { Controller } from 'controllerim';

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

export const ParentController = Controller(_ParentController);
```

Inside `Parent.jsx`:

```javascript
import React, { Component } from 'react';
import { observer } from 'controllerim';
import { ParentController } from './ParentController';

class Parent extends Component {
  constructor(props) {
    super(props);
    this.controller = ComponentController.create();
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
import {ParentController} from './ParentController'

class Child extends Component {
  constructor(props){
    super(props);
    this.parentController = ParentController.getInstance();
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

### `Controller(controllerClass)`
#### Arguments:
    *controllerClass* : any es6 class with a state member.
##### Returns:
    {create(), getInstance()}: two factory methods for getting a new controller instance 

A controller is a plain Javascript class that holds should  **state** and methods that manipulate the state.
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
# Controllerim

A simple, clean and well structured state management library for react

[![npm version](https://img.shields.io/npm/v/controllerim.svg)](https://www.npmjs.com/package/controllerim)

## Installation

`npm install controllerim --save`


## Basic usage example



Inside `ParentController.js`:

```javascript
import { Controller } from 'controllerim';

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

export const ParentController = Controller(_ParentController);
```

Inside `Parent.jsx`:

```javascript
import React, { Component } from 'react';
import { observer } from 'controllerim';
import { ParentController } from './ParentController';

class Parent extends Component {
  constructor(props) {
    super(props);
    this.controller = ComponentController.create();
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
import {ParentController} from './ParentController'

class Child extends Component {
  constructor(props){
    super(props);
    this.parentController = ParentController.getInstance();
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

### `Controller(controllerClass)`
#### Arguments:
    *controllerClass* : any es6 class with a state member.
##### Returns:
    {create(), getInstance()}: two factory methods for getting a new controller instance 

A controller is a plain Javascript class that holds should  **state** and methods that manipulate the state.
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
# Controllerim

A simple, clean and well structured state management library for react

[![npm version](https://img.shields.io/npm/v/controllerim.svg)](https://www.npmjs.com/package/controllerim)

## Installation

`npm install controllerim --save`


## Basic usage example



Inside `ParentController.js`:

```javascript
import { Controller } from 'controllerim';

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

export const ParentController = Controller(_ParentController);
```

Inside `Parent.jsx`:

```javascript
import React, { Component } from 'react';
import { observer } from 'controllerim';
import { ParentController } from './ParentController';

class Parent extends Component {
  constructor(props) {
    super(props);
    this.controller = ComponentController.create();
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
import {ParentController} from './ParentController'

class Child extends Component {
  constructor(props){
    super(props);
    this.parentController = ParentController.getInstance();
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

### `Controller(controllerClass)`
#### Arguments:
    *controllerClass* : any es6 class with a state member.
##### Returns:
    {create(), getInstance()}: two factory methods for getting a new controller instance 

A controller is a plain Javascript class that holds should  **state** and methods that manipulate the state.
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
# Controllerim

A simple, clean and well structured state management library for react

[![npm version](https://img.shields.io/npm/v/controllerim.svg)](https://www.npmjs.com/package/controllerim)

## Installation

`npm install controllerim --save`


## Basic usage example



Inside `ParentController.js`:

```javascript
import { Controller } from 'controllerim';

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

export const ParentController = Controller(_ParentController);
```

Inside `Parent.jsx`:

```javascript
import React, { Component } from 'react';
import { observer } from 'controllerim';
import { ParentController } from './ParentController';

class Parent extends Component {
  constructor(props) {
    super(props);
    this.controller = ComponentController.create();
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
import {ParentController} from './ParentController'

class Child extends Component {
  constructor(props){
    super(props);
    this.parentController = ParentController.getInstance();
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

### `Controller(controllerClass)`
#### Arguments:
    *controllerClass* : any es6 class with a state member.
##### Returns:
    {create(), getInstance()}: two factory methods for getting a new controller instance 

A controller is a plain Javascript class that holds should  **state** and methods that manipulate the state.
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
# Controllerim

A simple, clean and well structured state management library for react

[![npm version](https://img.shields.io/npm/v/controllerim.svg)](https://www.npmjs.com/package/controllerim)

## Installation

`npm install controllerim --save`


## Basic usage example



Inside `ParentController.js`:

```javascript
import { Controller } from 'controllerim';

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

export const ParentController = Controller(_ParentController);
```

Inside `Parent.jsx`:

```javascript
import React, { Component } from 'react';
import { observer } from 'controllerim';
import { ParentController } from './ParentController';

class Parent extends Component {
  constructor(props) {
    super(props);
    this.controller = ComponentController.create();
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
import {ParentController} from './ParentController'

class Child extends Component {
  constructor(props){
    super(props);
    this.parentController = ParentController.getInstance();
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

### `Controller(controllerClass)`
#### Arguments:
    *controllerClass* : any es6 class with a state member.
##### Returns:
    {create(), getInstance()}: two factory methods for getting a new controller instance 

A controller is a plain Javascript class that holds should  **state** and methods that manipulate the state.
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
# Controllerim

A simple, clean and well structured state management library for react

[![npm version](https://img.shields.io/npm/v/controllerim.svg)](https://www.npmjs.com/package/controllerim)

## Installation

`npm install controllerim --save`


## Basic usage example



Inside `ParentController.js`:

```javascript
import { Controller } from 'controllerim';

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

export const ParentController = Controller(_ParentController);
```

Inside `Parent.jsx`:

```javascript
import React, { Component } from 'react';
import { observer } from 'controllerim';
import { ParentController } from './ParentController';

class Parent extends Component {
  constructor(props) {
    super(props);
    this.controller = ComponentController.create();
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
import {ParentController} from './ParentController'

class Child extends Component {
  constructor(props){
    super(props);
    this.parentController = ParentController.getInstance();
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

### `Controller(controllerClass)`
#### Arguments:
    *controllerClass* : any es6 class with a state member.
##### Returns:
    {create(), getInstance()}: two factory methods for getting a new controller instance 

A controller is a plain Javascript class that holds should  **state** and methods that manipulate the state.
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
# Controllerim

A simple, clean and well structured state management library for react

[![npm version](https://img.shields.io/npm/v/controllerim.svg)](https://www.npmjs.com/package/controllerim)

## Installation

`npm install controllerim --save`


## Basic usage example



Inside `ParentController.js`:

```javascript
import { Controller } from 'controllerim';

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

export const ParentController = Controller(_ParentController);
```

Inside `Parent.jsx`:

```javascript
import React, { Component } from 'react';
import { observer } from 'controllerim';
import { ParentController } from './ParentController';

class Parent extends Component {
  constructor(props) {
    super(props);
    this.controller = ComponentController.create();
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
import {ParentController} from './ParentController'

class Child extends Component {
  constructor(props){
    super(props);
    this.parentController = ParentController.getInstance();
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

### `Controller(controllerClass)`
#### Arguments:
    *controllerClass* : any es6 class with a state member.
##### Returns:
    {create(), getInstance()}: two factory methods for getting a new controller instance 

A controller is a plain Javascript class that holds should  **state** and methods that manipulate the state.
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
# Controllerim

A simple, clean and well structured state management library for react

[![npm version](https://img.shields.io/npm/v/controllerim.svg)](https://www.npmjs.com/package/controllerim)

## Installation

`npm install controllerim --save`


## Basic usage example



Inside `ParentController.js`:

```javascript
import { Controller } from 'controllerim';

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

export const ParentController = Controller(_ParentController);
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

### `Controller(controllerClass)`
##### Arguments:
* **controllerClass**: any es6 class with a state member.
##### Returns:
* **Object: { create(), getInstance() }**: an object with two factory methods for getting a new controller instance 

A controller is a plain Javascript class that holds a  **state** and methods for manipulating the state.
All the methods of the controller are smartly memoized and computed, thus if you do some heavy calculation based on some props from the state, it will be re-calculated only if the relevant state or args have changed.

The observers (React Components that you wrapped within `observer`) will react to any change in the state, even changes of deep nested properties.

#### `create(id?: string (default: 'globalInstance') )`:

Returns a new instance of the given controller. You should use this method when you know for sure that you need a fresh instance and not an existing one (most of the time you should prefer `create` over `getInstance`). You can pass an `id`, for being used later by getInstance.

#### `getInstance(id?: string (default: 'globalInstance'))`:
Returns an existing instance of the given controller, or a new one if there isn't any existing instance yet. If you don't supply an `id`, the return value will be the default global instance.


#### Controller Usage example:

```javascript
import {Controller} from 'controllerim';

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
```

Your React component will create an instance of the Controller like this: 

```javascript
import {AppController} from 'controllerim';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.controller = AppController.create();
  }

  render(){
    <div>{this.controller.getTotalNotesCount()}</div>
    <div onPress={() => this.controller.increaseCounter()}>click me</div>
  }
}
```



### `observer(ReactComponent)`

To become reactive, every React component that uses a controller, should be wrapped within `observer`. 

```javascript
import {observer} from 'controllerim';

export const SomeSmartComponent = observer(class extends React.Component {
...
})
```

### `Store(storeClass)`
A store is just a global singleton controller that is not conceptually bound to the lifecycle of any specific component. 

inside `AppStore.js`:
```javascript
  import {Store} from 'controllerim';

  class _AppStore {
    constructor(){
      this.state = {useName: 'bla'};
    }

    getUserName() {
      return this.state.userName;
    }
  }

  export const AppStore = Store(_AppStore);
```

Inside `component.jsx`:

```javascript
import React from 'react';
import {observer} from 'controllerim'
import {AppStore} from './AppStore';

class SomeComponent extends React.Component {
  render(){
    <div>{AppStore.getUserName()}</div>
  }
}

export default observer(SomeComponent);
```

