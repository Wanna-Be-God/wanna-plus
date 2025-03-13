import type { ExtractPropTypes } from "vue";
import { transferProps, transferCheckedChangeFn } from "./transfer";
import type { TransferKey } from "./transfer";
import type TransferPanel from "./transfer-panel.vue";

export interface TransferPanelState {
  allChecked: boolean;
  checked: any[];
  keywords: string;
  checkChangeByUser: boolean;
  customFormUpdate: boolean;
}

export const CHECKED_CHANGE_EVENT = "checked-change";
export const ROW_DBCLICK_EVENT = "row-dblclick";
export const DRAG_CHANGE_EVENT = "drag-change";

export const transferPanelProps = {
  panelStyle: Object,
  rowKey: transferProps.rowKey,
  data: transferProps.data,
  title: String,
  defaultChecked: Array,
  filterable: transferProps.filterable,
  filterPlaceholder: transferProps.filterPlaceholder,
  filterMethod: Function,
  targetOrder: String,
  customFilterable: Boolean,
  customFilterForm: Object,
  customFilterMethod: Function,
  format: transferProps.format,
  rowDraggable: Boolean,
  selectable: Function,
  tableProps: transferProps.tableProps,
};

export type TransferPanelProps = ExtractPropTypes<typeof transferPanelProps>;

export const transferPanelEmits = {
  [CHECKED_CHANGE_EVENT]: transferCheckedChangeFn,
  [ROW_DBCLICK_EVENT]: (row: any, column: any, event: Event) => {},
  [DRAG_CHANGE_EVENT]: (targetRowIndex: number, sourceRowIndex: number) => {},
};

export type TransferPanelEmits = typeof transferPanelEmits;

export type TransferPanelInstance = InstanceType<typeof TransferPanel>;
