import { computed, nextTick, ref, watch, type SetupContext } from "vue";
import { CHECKED_CHANGE_EVENT, ROW_DBCLICK_EVENT } from "../transfer-panel";
import type {
  TransferPanelProps,
  TransferPanelState,
  TransferPanelEmits,
} from "../transfer-panel";
import { isFunction } from "element-plus/es/utils/index";

export const useCheck = (
  props: TransferPanelProps,
  panelState: TransferPanelState,
  emit: SetupContext<TransferPanelEmits>["emit"]
) => {
  const tableRef = ref();

  const filteredData = computed(() => {
    if (!props.filterable && !props.customFilterable) {
      return props.data; // 默认返回所有数据
    }

    return props.data.reduce((acc: any[], item) => {
      let isFiltered = false;
      if (props.filterable && isFunction(props.filterMethod)) {
        isFiltered = props.filterMethod(panelState.keywords, item);
      } else if (
        props.customFilterable &&
        isFunction(props.customFilterMethod)
      ) {
        isFiltered = props.customFilterMethod(
          props.customFilterForm,
          item,
          panelState.customFormUpdate
        );
      }
      if (isFiltered) {
        acc.push(item);
      }
      return acc;
    }, []);
  });

  const emptyText = computed(() => {
    if (panelState.keywords.length && filteredData.value.length === 0) {
      return "无匹配数据"; // 过滤后无匹配数据时的提示
    }
    return "暂无数据"; // 默认提示
  });

  const checkableData = computed(() => {
    if (isFunction(props.selectable)) {
      return filteredData.value.filter(props.selectable as any);
    } else {
      return filteredData.value;
    }
  });

  const checkedSummary = computed(() => {
    const checkedLength = panelState.checked.length;
    const dataLength = props.data.length;
    const { noChecked, hasChecked } = props.format;
    if (noChecked && hasChecked) {
      return checkedLength > 0
        ? hasChecked
            .replace(/\${checked}/g, checkedLength.toString())
            .replace(/\${total}/g, dataLength.toString())
        : noChecked.replace(/\${total}/g, dataLength.toString());
    } else {
      return `${checkedLength}/${dataLength}`;
    }
  });

  const isIndeterminate = computed(() => {
    // 获取当前选中的项数量
    const checkedLength = panelState.checked.length;
    // 获取可选项的总长度
    const totalSelectable = selectableLength.value;

    // 判断是否为部分选中状态：
    // 1. checkedLength > 0: 表示有选中项
    // 2. checkedLength < totalSelectable: 表示不是全选状态
    // 如果同时满足这两个条件，则返回 true，表示部分选中
    return checkedLength > 0 && checkedLength < totalSelectable;
  });

  const selectableLength = computed(() => {
    if (isFunction(props.selectable)) {
      return filteredData.value.filter(props.selectable as any).length;
    } else {
      return filteredData.value.length;
    }
  });

  const handleTableDbclick = (row: any, column: any, event: Event) => {
    emit(ROW_DBCLICK_EVENT, row, column, event); // 双击行时发出事件
  };

  const handleAllCheckedChange = (val: any) => {
    if (selectableLength.value === 0) {
      panelState.allChecked = false; // 无可选择数据时取消全选
      return;
    }
    if (val) {
      tableRef.value.toggleAllSelection(true); // 全选
    } else {
      tableRef.value.toggleAllSelection(false); // 取消全选
    }
  };

  const selectionChange = (rows: any[]) => {
    panelState.checked = rows; // 更新已选数据
    if (rows.length && !isIndeterminate.value) {
      panelState.allChecked = true; // 全选状态
    } else {
      panelState.allChecked = false; // 取消全选状态
    }
  };

  watch(
    () => panelState.checked,
    (newVal, oldVal) => {
      const newCheckedKeys = newVal.map((i) => i[props.rowKey]); // 新选择的行的键
      const oldCheckedKeys = oldVal.map((i) => i[props.rowKey]); // 旧选择的行的键
      if (panelState.checkChangeByUser) {
        const movedKeys = newCheckedKeys
          .concat(oldCheckedKeys)
          .filter(
            (v) =>
              newCheckedKeys.indexOf(v) === -1 ||
              oldCheckedKeys.indexOf(v) === -1
          ); // 计算变化的键
        emit(CHECKED_CHANGE_EVENT, newCheckedKeys, movedKeys, newVal); // 发出选择变化事件
      } else {
        emit(CHECKED_CHANGE_EVENT, newCheckedKeys); // 发出选择变化事件
        panelState.checkChangeByUser = true; // 标记为用户更改
      }
    }
  );

  watch(
    () => props.defaultChecked,
    (newVal, oldVal) => {
      if (
        oldVal &&
        newVal?.length === oldVal.length &&
        newVal.every((item) => oldVal.indexOf(item) > -1)
      )
        return; // 检查是否有变化
      const checked: any[] = [];
      checkableData.value.forEach((row: any) => {
        if (newVal!.indexOf(row[props.rowKey]) > -1) {
          checked.push(row); // 添加已选行
          nextTick(() => {
            tableRef.value.toggleRowSelection(row, true); // 设置行选择状态
          });
        }
      });
      panelState.checkChangeByUser = false; // 标记为非用户更改
      panelState.checked = checked; // 更新已选数据
    },
    {
      immediate: true, // 立即执行
    }
  );

  return {
    tableRef,
    filteredData,
    emptyText,
    checkableData,
    checkedSummary,
    isIndeterminate,
    selectableLength,
    handleTableDbclick,
    handleAllCheckedChange,
    selectionChange,
  };
};
