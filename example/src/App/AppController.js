import { Controller } from 'react-view-controllers';

export class AppController extends Controller {
  constructor(comp) {
    super(comp);
    this.state = {
      totalNotesCount: 2,
      userName: 'bob'
    };
  }

  getTotalNotesCount() {
    return this.state.totalNotesCount;
  }

  increaseCounter() {
    this.state.totalNotesCount++;
  }

  getUserName() {
    return this.state.userName;
  }
  setUserName(value){
    this.state.userName = value;
  }
}