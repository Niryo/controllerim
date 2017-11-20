# react-view-controllers
A state management library for react

## Api:
### `Controller(componentInstance)`
Every view should have a controller that extends `Controller`. The controller holds an observable state.
Make sure to call `super(componentInstance)` from your controller constructor.
Every controller exposes `getParentController()`. See bellow for more details.

#### Usage example:
```javascript
import {Controller} from 'react-view-controllers';

export class AppController extends Controller {
  constructor(comp) {
    super(comp);
    this.state = {totalNotesCount: 2};
  }

  getTotalNotesCount() {
    return this.state.totalNotesCount;
  }

  increaseCounter() {
    this.state.totalNotesCount ++;
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
If you want your controller instance to be visible to your child component, you must explicitly provide it using ProvideController.

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


### `getParentController(controllerName: string)`:
Use this Controller method inside `componentWillMount` to get a parentController.
The name of the parent controller is the name of the class, as return from Class.name.
If for example your code looks like this: `class SomeParentController extends Controller{}`, then the name will be 'SomeParentController' (`SomeParentController.name`).
Make sure that the parent controller is provided using `ProvideController`.
You cannot get the controller of a sibling component. If you need to use some data from a sibling component, put this data in the first
common parent of the two components.

#### Usage example:

```javascript
import * as React from 'react';
import SomeChildController from './SomeParentComponentController';

class SomeChild extends React.Component {
  componentWillMount() {
    this.controller = new SomeChild(this);
    this.parentController = this.controller.getParentController('SomeParentController');
  }
...
}

```

In the example above we need to make sure that SomeParentController is provided using ProvideController.

