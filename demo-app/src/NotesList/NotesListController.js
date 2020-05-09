import {Controller} from 'controllerim';
import {appStore} from '../App/AppStore';
import {fetchRandomJoke} from '../chuckNorrisService';

export const NotesListController = Controller(class {
  constructor() {
    const firstItem = {title: 'firstItem', text: '', id: 0};
    this.state = {
      listItems: [firstItem],
      selectedItem: firstItem,
      inputValue: ''
    };
  }
  getSelectedItem() {
    return this.state.selectedItem;
  }
  setSelectedItem(item) {
    this.state.selectedItem = item;
  }

  getInputValue() {
    return this.state.inputValue;
  }
  setInputValue(value) {
    this.state.inputValue = value;
  }
  getListItems() {
    return this.state.listItems;
  }

  addNote() {
    this.state.listItems.push({title: this.state.inputValue, text: '', id: this.state.listItems.length});
    this.state.inputValue = '';
    // update the total notes counter in the app's controller:
    appStore.increaseCounter();
  }

  editSelectedNote(value) {
    this.state.selectedItem.text = value;
  }

  copyNote(text) {
    this.state.selectedItem.text = text;
  }

  async addRandomJoke() {
    const joke = await fetchRandomJoke();
    this.state.selectedItem.text = joke;
  }

  copyNoteToOther(currentInstanceId) {
    const otherInstanceId = currentInstanceId === 'first' ? 'second' : 'first';
    const otherInstanceController = NotesListController.getInstance(otherInstanceId);
    otherInstanceController.copyNote(this.state.selectedItem.text);
  }
});
