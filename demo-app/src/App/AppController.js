import { Controller } from 'controllerim';
class AppController {
  constructor() {
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

export default Controller(AppController);