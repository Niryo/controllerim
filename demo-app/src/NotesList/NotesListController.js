import { Controller } from 'controllerim';
import AppController from '../App/AppController';
import { fetchRandomJoke } from '../chuckNorrisService';

class NotesListController {
  constructor() {
    this.state = {
      listItems: [{ title: 'firstItem', text: 'this is your first todo!', id: 0 }],
      selectedItem: { title: '', text: '' },
      inputValue: ''
    };
  }
  getSelectedItem() {
    return this.state.selectedItem;
  }
  setSelectedItem(item) {
    return this.state.selectedItem = item;
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
    this.state.listItems.push({ title: this.state.inputValue, text: '', id: this.state.listItems.length });
    this.state.inputValue = '';
    // update the total notes counter in the app's controller:
    AppController.getController().increaseCounter();
  }

  editSelectedNote(value) {
    this.state.selectedItem.text = value;
  }

  async addRandomJoke() {
    const joke = await fetchRandomJoke();
    this.state.selectedItem.text = joke;
  }
}

export default Controller(NotesListController);
