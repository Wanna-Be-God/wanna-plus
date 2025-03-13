import type { ExtractPropTypes, PropType } from "vue";

export const definePropType = <T>(val: any): PropType<T> => val;
// 辅助函数，检查变量是否为数组
const isArray = (arg: any): arg is any[] => Array.isArray(arg);
// 辅助函数，检查变量是否为 null 或 undefined
const isNil = (value: any): value is null | undefined => value === null || value === undefined;
export const mutable = <T extends readonly any[] | Record<string, unknown>>(val: T) => val as Mutable<typeof val>;
export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export type TransferKey = string | number;
export type TransferDirection = "left" | "right";
export type TransferDataItem = Record<string, any>;

export interface TransferFormat {
  noChecked?: string;
  hasChecked?: string;
}

export interface TransferCheckedState {
  leftChecked: TransferKey[];
  rightChecked: TransferKey[];
}

export const UPDATE_MODEL_EVENT = "update:modelValue";
export const CHANGE_EVENT = "change";
export const LEFT_CHECK_CHANGE_EVENT = "left-check-change";
export const RIGHT_CHECK_CHANGE_EVENT = "right-check-change";

export const transferProps = {
  /** 左源右目 */
  normal: Boolean,
  /**
   * @description 数据源
   */
  data: {
    type: Array,
    default: () => []
  },
  /**
   * @description 绑定值
   */
  modelValue: {
    type: definePropType<TransferKey[]>(Array),
    default: () => []
  },
  /**
   * 用于检查列表头中状态的文本
   */
  format: {
    type: definePropType<TransferFormat>(Object),
    default: () => ({})
  },
  rowKey: {
    type: String,
    default: ""
  },
  /**
   * @description 自定义标题
   */
  titles: {
    type: Array,
    default: () => []
  },
  /**
   * @description 自定义按钮文字
   */
  buttonTexts: {
    type: Array,
    default: () => []
  },
  rowDraggable: {
    type: Boolean,
    default: false
  },
  /**
   * @description 左列表中初始选中数据项的键数组
   */
  leftDefaultChecked: {
    type: Array,
    default: () => []
  },
  /**
   * @description 右列表中初始选中数据项的键数组
   */
  rightDefaultChecked: {
    type: Array,
    default: () => []
  },
  /**
   * @description 右侧按钮点击事件
   */
  beforeRightButtonClick: Function,
  /**
   * @description 左侧按钮点击事件
   */
  beforeLeftButtonClick: Function,
  /**
   * @description 左侧表格行是否可拖拽
   */
  leftTableRowDraggable: {
    type: Boolean,
    default: false
  },
  /**
   * @description 右侧表格行是否可拖拽
   */
  rightTableRowDraggable: {
    type: Boolean,
    default: false
  },
  /**
   * @description 目标列表中元素的顺序策略。
   * 如果设置为' original '，元素将保持与数据源相同的顺序。
   * 如果设置为' push '，则新添加的元素将被推到底部。
   * 如果设置为' unshift '，则新添加的元素将被插入顶部
   */
  targetOrder: {
    type: String,
    values: ["original", "push", "unshift"],
    default: "original"
  },
  /**
   * @description 通用面板样式
   */
  panelStyle: {
    type: Object,
    default: () => ({})
  },
  /**
   * @description 左侧面板样式
   */
  leftPanelStyle: Object,
  /**
   * @description 右侧面板样式
   */
  rightPanelStyle: Object,
  filterable: {
    type: Boolean,
    default: false
  },
  filterPlaceholder: String,
  filterMethod: Function,
  leftCustomFilterable: {
    type: Boolean,
    default: false
  },
  /**
   * @description 左侧自定义筛选对象
   */
  leftCustomFilteForm: Object,
  /**
   * @description 左侧自定义筛选方法
   */
  leftCustomFilterMethod: Function,
  rightCustomFilterable: {
    type: Boolean,
    default: false
  },
  /**
   * @description 右侧自定义筛选对象
   */
  rightCustomFilteForm: Object,
  /**
   * @description 右侧自定义筛选方法
   */
  rightCustomFilterMethod: Function,
  /**
   * @description 表格行是否可选择
   */
  selectable: Function,
  tableProps: Object
};

export type TransferProps = ExtractPropTypes<typeof transferProps>;

export const transferCheckedChangeFn = (checkedKeys: TransferKey[], movedKeys?: TransferKey[], checkedRows?: any[]): any => {
  return [checkedKeys, movedKeys, checkedRows].every(isArray) || (isArray(checkedKeys) && isNil(movedKeys) && isNil(checkedRows));
};

// 定义 transferEmits 对象，所有函数返回类型为 any
export const transferEmits = {
  [UPDATE_MODEL_EVENT]: transferCheckedChangeFn,
  [CHANGE_EVENT]: (value: TransferKey[], direction: TransferDirection, movedKeys: TransferKey[]) =>
    [value, movedKeys].every(isArray) && ["left", "right"].includes(direction),
  [LEFT_CHECK_CHANGE_EVENT]: transferCheckedChangeFn,
  [RIGHT_CHECK_CHANGE_EVENT]: transferCheckedChangeFn
};

// 使用 typeof 操作符来获取 transferEmits 对象的类型，并导出为 TransferEmits 类型别名
export type TransferEmits = typeof transferEmits;
