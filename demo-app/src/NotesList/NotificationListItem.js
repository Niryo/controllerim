import React from 'react';
import {NotesListController} from './NotesListController';
import {observer} from 'controllerim';
export const NotificationListItem = observer((props) => {
  const controller = React.useRef(NotesListController.getInstance(props.controllerId)).current;
  const {item} = props;
  return (
    <li
      className={`listItem ${controller.getSelectedItem().id === item.id ? 'selected' : ''}`}
      onClick={() => controller.setSelectedItem(item)}
      key={item.id}
      data-hook="listItem"
    >
      {item.title}
    </li>
  )
});