import type { SetupContext } from "vue";
import { CHANGE_EVENT, UPDATE_MODEL_EVENT } from "../transfer";
import type {
  TransferCheckedState,
  TransferDirection,
  TransferEmits,
  TransferKey,
  TransferProps,
} from "../transfer";

export const useMove = (
  props: TransferProps,
  checkedState: TransferCheckedState,
  emit: SetupContext<TransferEmits>["emit"]
) => {
  const _emit = (
    value: TransferKey[],
    direction: TransferDirection,
    movedKeys: TransferKey[]
  ) => {
    emit(UPDATE_MODEL_EVENT, value);
    emit(CHANGE_EVENT, value, direction, movedKeys);
  };

  const addToLeft = () => {
    if (props.beforeLeftButtonClick) {
      if (!props.beforeLeftButtonClick()) return;
    }
    const currentValue = props.modelValue.slice();
    checkedState.rightChecked.forEach((item) => {
      const index = currentValue.indexOf(item);
      if (index > -1) {
        currentValue.splice(index, 1);
      }
    });
    _emit(currentValue, "left", checkedState.leftChecked);
  };

  const addToRight = () => {
    if (props.beforeRightButtonClick) {
      if (!props.beforeRightButtonClick()) return;
    }
    let currentValue = props.modelValue.slice();
    const itemsToBeMoved: TransferKey[] = [];
    const key = props.rowKey;
    props.data.forEach((item: any) => {
      const itemKey = item[key];
      if (
        checkedState.leftChecked.findIndex((i) => i === itemKey) > -1 &&
        props.modelValue.indexOf(itemKey) === -1
      ) {
        itemsToBeMoved.push(itemKey);
      }
    });
    currentValue =
      props.targetOrder === "unshift"
        ? itemsToBeMoved.concat(currentValue)
        : currentValue.concat(itemsToBeMoved);
    _emit(currentValue, "right", checkedState.leftChecked);
  };

  const rightTableDBClick = (row: any) => {
    if (props.beforeLeftButtonClick) {
      if (!props.beforeLeftButtonClick()) return;
    }
    const currentValue = props.modelValue.slice();
    const itemKey = row[props.rowKey];
    const index = currentValue.indexOf(itemKey);
    if (index > -1) {
      currentValue.splice(index, 1);
    }
    _emit(currentValue, "left", checkedState.rightChecked);
  };

  const leftTableDBClick = (row: any) => {
    if (props.beforeRightButtonClick) {
      if (!props.beforeRightButtonClick()) return;
    }
    let currentValue = props.modelValue.slice();
    const itemsToBeMoved: TransferKey[] = [];
    const key = props.rowKey;
    if (props.modelValue.indexOf(row[key]) === -1) {
      itemsToBeMoved.push(row[key]);
    }
    currentValue =
      props.targetOrder === "unshift"
        ? itemsToBeMoved.concat(currentValue)
        : currentValue.concat(itemsToBeMoved);
    _emit(currentValue, "right", checkedState.leftChecked);
  };

  return {
    addToLeft,
    addToRight,
    leftTableDBClick,
    rightTableDBClick,
  };
};
