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