import { Controller } from 'react-view-controllers';
import {AppController} from '../App/AppController';
export class NotesListController extends Controller {
  constructor(compInstance) {
    super(compInstance);
    this.state = {
      listItems: [{ title: 'firstItem', text: 'this is your first todo!', id: 0}],
      selectedItem: {title:'',text:''},
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
    this.state.listItems.push({ title: this.state.inputValue, text: '' ,id: this.state.listItems.length});
    this.state.inputValue = '';
    super.getParentController(AppController.name).increaseCounter();
  }

  editSelectedNote(value) {
    this.state.selectedItem.text = value;
  }
}