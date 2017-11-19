import { Controller } from 'react-view-controllers';

export class TodoListController extends Controller {
  constructor(compInstance) {
    super(compInstance);
    this.state = {
      listItems: [{ title: 'firstItem', text: 'this is your first todo!' }],
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

  addTodo() {
    this.state.listItems.push({ title: this.state.inputValue, text: '' });
    this.state.inputValue = '';
  }

  editSelectedTodo(value) {
    this.state.selectedItem.text = value;
  }
}