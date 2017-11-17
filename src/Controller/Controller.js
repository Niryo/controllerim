
export class Controller {

  constructor(componentInstance) {
    this.component = componentInstance;
  }

  getName() {
    return this.component.constructor.name;
  }

  getParentController(parentControllerName) {
    if(this.component.context === undefined){
      throw new Error(`Context is undefined. Make sure that you initialized ${this.getName()} in componentWillMount()`);
      
    }

    const parrentController = this.component.context.controllers && this.component.context.controllers[parentControllerName];
    if (!parrentController) {
      throw new Error(`Parent controller does not exist. make sure that ${parentControllerName} is parrent of ${this.getName()} and that you provided it using ProvideController`);
    }
    return parrentController;
  }
}