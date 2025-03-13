<!--
 * @Author: 胡伟健 903157935@qq.com
 * @Date: 2023-11-15 11:10:59
 * @LastEditors: WANAN
 * @LastEditTime: 2025-01-13 10:55:59
 * @FilePath: \notese:\chkj-admin\src\components\SelectTable\index.vue
 * @Description: SelectTable 封装组件
-->
<template>
  <el-select
    ref="selectRef"
    v-model:model-value="state.defaultValue"
    popper-class="t-select-table"
    :multiple="multiple"
    v-bind="selectAttr"
    :value-key="keywords.value"
    :filterable="filterable"
    :filter-method="filterMethod || selectFilterMethod"
    @visible-change="selectVisibleChange"
    @remove-tag="selectRemoveTag"
    @clear="selectClearClick"
    @keyup="selectKeyup"
  >
    <template #empty>
      <div class="t-table-select__table" :style="{ width: `${tableWidth}px` }" tabindex="-1" @keyup="selectKeyup">
        <div class="table_query_condition" v-if="isShowQuery">
          <slot name="queryCondition"></slot>
        </div>
        <el-table
          ref="selectTableRef"
          :data="state.tableData"
          :class="{
            radioStyle: !multiple,
            highlightCurrentRow: isRadio,
            keyUpStyle: isKeyup
          }"
          highlight-current-row
          border
          :row-key="tableGetRowKey"
          @row-click="tableRowClick"
          @cell-dblclick="tableCellDblclick"
          @selection-change="tableSelectionChange"
          :height="tableHeight"
          v-bind="$attrs"
          show-overflow-tooltip
          scrollbar-always-on
          :size="'small'"
        >
          <el-table-column
            v-if="multiple"
            type="selection"
            width="55"
            align="center"
            v-bind="$attrs"
            :reserve-selection="reserveSelection"
            fixed
          ></el-table-column>
          <el-table-column type="radio" width="55" :label="radioTxt" fixed align="center" v-if="!multiple && isShowFirstColumn">
            <template #default="scope">
              <el-radio
                :size="'small'"
                v-model="radioVal"
                :label="scope.$index + 1"
                @click.stop="radioChangeHandle($event, scope.row, scope.$index + 1)"
              ></el-radio>
            </template>
          </el-table-column>
          <el-table-column
            v-for="(item, index) in columns"
            :key="index + 'i'"
            :type="item.type"
            :label="item.label"
            :prop="item.prop"
            :min-width="item['min-width'] || item.minWidth || item.width"
            :align="item.align || 'center'"
            :fixed="item.fixed"
            :show-overflow-tooltip="item.noShowTip"
            v-bind="{ ...item.bind, ...$attrs }"
          >
            <template #default="scope">
              <!-- render方式 -->
              <template v-if="item.render">
                <RenderCol :column="item" :row="scope.row" :render="item.render" :index="scope.$index" />
              </template>
              <!-- 作用域插槽 -->
              <template v-if="item.slotName">
                <slot :name="item.slotName" :scope="scope"></slot>
              </template>
              <div v-if="!item.render && !item.slotName">
                <span>{{ scope.row[item.prop] }}</span>
              </div>
            </template>
          </el-table-column>
          <slot></slot>
        </el-table>
        <div class="t-table-select__page" v-if="isShowPagination">
          <el-pagination
            v-model:current-page="table.currentPage"
            v-model:page-size="table.pageSize"
            size="small"
            background
            @size-change="tableSizeChange"
            @current-change="tableCurrentChange"
            layout="total, sizes, prev, pager, next, jumper"
            :pager-count="5"
            :total="table.total"
            v-bind="$attrs"
          />
        </div>
      </div>
    </template>
  </el-select>
</template>

<script setup lang="ts" name="TSelectTable">
import RenderCol from "./renderCol.vue";
import { computed, useAttrs, useSlots, ref, watch, nextTick, reactive } from "vue";
import { ElMessage } from "element-plus";
import { debounce } from "lodash";

/** props */
const props = defineProps({
  /**
   * @description 选择值
   */
  value: {
    type: [String, Number, Array]
  },
  /**
   * @description table所需数据
   */
  table: {
    type: Object,
    default: () => {
      return {};
    }
  },
  /**
   * @description 表头数据
   */
  columns: {
    type: Array as unknown as any[],
    default: () => []
  },
  /**
   * @description 单选文案
   * @default： 单选
   */
  radioTxt: {
    type: String,
    default: "单选"
  },
  /**
   * @description 是否显示搜索条件
   * @default false
   */
  isShowQuery: {
    type: Boolean,
    default: false
  },
  /**
   * @description 是否显示隐藏下拉框按钮
   */
  isShowBlurBtn: {
    type: Boolean,
    default: false
  },
  /**
   * @description 显示隐藏下拉框按钮属性
   */
  btnBind: {
    type: Object,
    default: () => {
      return {
        btnTxt: "关闭下拉框"
      };
    }
  },
  /**
   * @description 单选框--是否开启点击整行选中
   */
  rowClickRadio: {
    type: Boolean,
    default: true
  },
  /**
   * @description 是否显示首列
   */
  isShowFirstColumn: {
    type: Boolean,
    default: true
  },
  /**
   * @description 是否过滤
   * @default true
   */
  filterable: {
    type: Boolean,
    default: false
  },
  /**
   * @description 是否支持翻页选中
   * @default true
   */
  reserveSelection: {
    type: Boolean,
    default: true
  },
  /**
   * @description 是否显示分页
   * @default true
   */
  isShowPagination: {
    type: Boolean,
    default: false
  },
  /**
   * @description 是否自定义过滤
   * @type Function
   */
  filterMethod: {
    type: Function
  },
  /**
   * @description 过滤键名
   * @type string[]
   */
  filterKeys: {
    type: Array as unknown as any[],
    default: () => []
  },
  /**
   * @description 下拉数据指向的label/value
   * @type {label: string; value:string}
   */
  keywords: {
    type: Object,
    default: () => {
      return {
        label: "label",
        value: "value"
      };
    }
  },
  /**
   * 单选是否开启键盘事件
   */
  isKeyup: {
    type: Boolean,
    default: false
  },
  /**
   * 多选
   */
  multiple: {
    type: Boolean,
    default: false
  },
  /**
   * 自动聚焦
   */
  autofocus: {
    type: Boolean,
    default: false
  },
  /**
   * table宽度
   */
  tableWidth: {
    type: Number,
    default: 550
  },
  /**
   * table高度
   */
  tableHeight: {
    type: Number,
    default: 400
  },
  /**
   * @description： 设置默认选中项--keywords.value值（单选是String, Number类型；多选时是数组）
   */
  defaultSelectVal: {
    type: [String, Number, Array]
  }
});

/** 抛出事件 */
const emits = defineEmits([
  "page-change",
  "size-change",
  "selectionChange",
  "radioChange",
  "selectVisibleShow",
  "selectVisibleHidden",
  "autofocus",
  "interface-update"
]);

const selectAttr = computed(() => {
  return {
    clearable: true,
    // 多选时是否将选中值按文字的形式展示
    collapseTags: true,
    // 当鼠标悬停于折叠标签的文本时，是否显示所有选中的标签。
    collapseTagsTooltip: true,
    ...useAttrs()
  };
});
const slots = useSlots();
const isDefaultSelectVal = ref(false); // 是否已经重新选择了
const isRadio = ref(false);
const isVisible = ref(false); // 是否显示隐藏下拉框
const radioVal = ref("");
const state: any = reactive({
  defaultSelectValue: props.defaultSelectVal, // 默认选中
  tableData: props.table.data, // table数据
  defaultValue: props.value,
  rows: [], // row集合
  ids: [], // id集合
  tabularMap: {} // 存储下拉tale的所有name
});
// 获取ref
const selectRef: any = ref<HTMLElement | null>(null);
const selectTableRef: any = ref<HTMLElement | null>(null);
const tableRowIndex = ref(-1);
const tableScrollTop = ref(23);

/** 监听表格数据变化 */
watch(
  () => props.table.data,
  val => {
    // console.log("watch：SelectTable--props.table.data", val);
    state.tableData = val;
    nextTick(() => {
      if (!props.reserveSelection) {
        selectClear();
      } else if (!props.multiple) {
        const findIndex = state.tableData.findIndex((item: { [x: string]: string | number | unknown[] | undefined }) => {
          return item[props.keywords.value] === props.defaultSelectVal;
        });
        if (findIndex != -1) {
          state.defaultValue = state.tableData[findIndex];
          radioVal.value = findIndex + 1;
          nextTick(() => {
            selectRef.value.states.selectedLabel = state.tableData[findIndex][props.keywords.label];
          });
        } else {
          selectTableRef.value.setCurrentRow(-1);
          tableRowIndex.value = -1;
          radioVal.value = "";
        }
      }
      state.tableData &&
        state.tableData.length > 0 &&
        state.tableData.forEach((item: { [x: string]: any }) => {
          state.tabularMap[item[props.keywords.value]] = item[props.keywords.label];
        });
    });
  },
  { deep: true }
);
/** 监听选中值变化 */
watch(
  () => props.defaultSelectVal,
  val => {
    // console.log("watch：SelectTable--props.defaultSelectVal", val);

    state.defaultSelectValue = val;
    // if (val && isDefaultSelectVal.value) {
    //   defaultSelect(val);
    // }
    if (!val) {
      selectClear();
    } else {
      defaultSelect(val);
    }
  },
  { deep: true }
);

/**  默认选中（且只能默认选中第一页的数据） */
const defaultSelect = (defaultSelectVal: string | number | any[]) => {
  if (typeof defaultSelectVal === "object" && props.multiple) {
    state.defaultValue = defaultSelectVal
      .map(mapItem => {
        const findData = state.tableData.find((findItem: { [x: string]: any }) => findItem[props.keywords.value] === mapItem);
        return findData ? findData[props.keywords.label] : mapItem;
      })
      .filter(filterItem => filterItem);
    nextTick(() => {
      // console.log(selectRef.value.selected);
      // console.log(selectRef.value.states);
      // console.log(selectRef.value.states.selectedLabel);
      selectRef.value.selected?.forEach((item: { currentLabel: any; value: any }) => {
        item.currentLabel = item.value;
      });
    });
  } else {
    state.defaultValue = null;
    radioVal.value = "";
    const findData = state.tableData.find((findItem: any, findIndex: any) => {
      if (findItem[props.keywords.value] === defaultSelectVal) {
        state.defaultValue = findItem;
        radioVal.value = findIndex + 1;
        return true;
      }
    });
    nextTick(() => {
      selectRef.value.states.selectedLabel = findData ? findData[props.keywords.label] : "";
    });
  }
};

/** 设置表格选中数据 */
const initTableData = () => {
  const defaultSelectData = toRaw(props.defaultSelectVal) as string[];
  selectTableRef.value.clearSelection();
  // 表格默认赋值
  nextTick(() => {
    if (props.multiple) {
      defaultSelectData.forEach(item => {
        const findData = state.tableData.find((findItem: { [x: string]: string }) => findItem[props.keywords.value] === item);
        if (findData) {
          selectTableRef.value.toggleRowSelection(findData, true);
        }
      });
    } else {
      const findData = state.tableData.find(
        (item: { [x: string]: any }) =>
          item[props.keywords.value] === state.defaultValue && state.defaultValue[props.keywords.value]
      );
      if (findData) {
        selectTableRef.value.toggleRowSelection(findData);
      }
    }
  });
};

/** 复制内容 */
const copyDomText = (val: any) => {
  // 获取需要复制的元素以及元素内的文本内容
  const text = val;
  // 添加一个input元素放置需要的文本内容
  const input = document.createElement("input");
  input.value = text;
  document.body.appendChild(input);
  // 选中并复制文本到剪切板
  input.select();
  document.execCommand("copy");
  // 移除input元素
  document.body.removeChild(input);
};

/** ###################### Select事件 ###################### */
/** Select事件-表格数据搜索过滤  */
const selectFilterMethod = debounce((val: string, interfaceUpdate = false) => {
  if (interfaceUpdate) {
    // 接口搜索过滤
    emits("interface-update", true);
  } else {
    // 本地搜索过滤
    if (!props.filterable && props.filterKeys.length == 0) return;
    const tableData = JSON.parse(JSON.stringify(props.table?.data));
    if (tableData && tableData.length > 0) {
      if (props.filterKeys.length != 0) {
        state.tableData = tableData.filter((item: any) => {
          return props.filterKeys.some((keyItem: any) => {
            return item[keyItem]?.toString().toLowerCase().includes(val.toLowerCase());
          });
        });
      } else {
        state.tableData = tableData.filter((item: any) => {
          if (item[props.keywords.label].toLowerCase().includes(val.toLowerCase())) {
            return item;
          }
        });
      }
      if (!props.multiple) {
        if (val) {
          nextTick(() => {
            const findIndex = state.tableData.findIndex((item: any) => {
              return item[props.keywords.value] === state.defaultValue[props.keywords.value];
            });
            radioVal.value = findIndex != -1 ? findIndex + 1 : "";
          });
        } else {
          tableData.forEach((item: any, index: any) => {
            if (item[props.keywords.value] === state.defaultValue[props.keywords.value]) {
              radioVal.value = index + 1;
            }
          });
        }
      }
    }
  }
}, 500);
/** Select事件-键盘事件 => ↑ ↓ 回车 */
const selectKeyup = (e: { keyCode: any }) => {
  // console.log("selectKeyup:", e);
  const tableLength = state.tableData.length;
  const ScrollTop = tableScrollTop.value;
  if (!props.isKeyup) return;
  if (tableLength === 0) return;
  switch (e.keyCode) {
    case 40: // 下键
      if (state.tableData[tableRowIndex.value + 1] !== undefined) {
        selectTableRef.value.setCurrentRow(state.tableData[tableRowIndex.value + 1]);
        tableRowIndex.value = tableRowIndex.value * 1 + 1;
      } else {
        tableRowIndex.value = 0;
        selectTableRef.value.setCurrentRow(state.tableData[0]);
      }
      selectTableRef.value.setScrollTop(tableRowIndex.value * ScrollTop);
      break;
    case 38: // 上键
      if (state.tableData[tableRowIndex.value - 1] !== undefined && tableRowIndex.value > 0) {
        selectTableRef.value.setCurrentRow(state.tableData[tableRowIndex.value - 1]);
        tableRowIndex.value = tableRowIndex.value * 1 - 1;
      } else {
        tableRowIndex.value = 0;
        selectTableRef.value.setCurrentRow(state.tableData[0]);
      }
      selectTableRef.value.setScrollTop(tableRowIndex.value * ScrollTop);
      break;
    case 13: // 回车
      if (tableRowIndex.value > tableLength - 1 || tableRowIndex.value < 0) {
        tableRowIndex.value = 0;
      }
      if (!props.multiple) {
        tableRowClick(state.tableData[tableRowIndex.value]);
      } else {
        selectTableRef.value.toggleRowSelection(state.tableData[tableRowIndex.value]);
      }
      break;
  }
};
/** Select事件-表格显示隐藏回调 */
const selectVisibleChange = (visible: boolean) => {
  // console.log("表格显示隐藏回调", visible);
  isVisible.value = visible;
  if (visible) {
    isDefaultSelectVal.value = false;
    if (props.autofocus) {
      emits("autofocus");
      emits("selectVisibleShow");
    }
    initTableData();
  } else {
    if (isDefaultSelectVal.value) {
      props.multiple
        ? emits("selectVisibleHidden", state.rows, state.ids)
        : emits("selectVisibleHidden", state.rows[0], state.ids[0]);
    }
    nextTick(() => {
      if (props.multiple) {
        selectRef.value.selected?.forEach((item: { currentLabel: any; value: any }) => {
          item.currentLabel = item.value;
        });
      } else {
        selectRef.value.states.selectedLabel = (state.defaultValue && state.defaultValue[props.keywords.label]) || "";
      }
    });
  }
};
/** Select事件-tags删除后回调 */
const selectRemoveTag = (tag: any) => {
  // const row = state.tableData.find((item: { [x: string]: any }) => item[props.keywords.label] === tag);
  // selectTableRef.value.toggleRowSelection(row, false);
  // const { rows, ids } = state.tableData.reduce(
  //   (acc: { rows: string[]; ids: string[] }, item: any) => {
  //     if (row[props.keywords.value] !== item[props.keywords.value]) {
  //       if (item[props.keywords.value] == "-1" && !state.defaultSelectValue.includes("-1")) {
  //         return acc;
  //       }
  //       acc.rows.push(item);
  //       acc.ids.push(item[props.keywords.value]);
  //     }
  //     return acc;
  //   },
  //   { rows: [], ids: [] }
  // );

  // 针对List进行优化
  const index = state.tableData.findIndex((item: { [x: string]: any }) => item[props.keywords.label] === tag);
  state.rows.splice(index, 1);
  state.ids.splice(index, 1);
  emits("selectVisibleHidden", toRaw(state.rows), toRaw(state.ids));
};
/** Select事件-触发隐藏 */
const selectBlur = () => {
  selectRef.value.blur();
  selectRef.value.visible = false;
};
/** Select事件-触发显示 */
const selectFocus = () => {
  selectRef.value.focus();
};
/** 清空图表事件 */
const selectClearClick = () => {
  props.multiple ? emits("selectVisibleHidden", [], []) : emits("selectVisibleHidden", {}, undefined);
};
/** 清空后的回调 */
const selectClear = () => {
  if (props.multiple) {
    selectTableRef.value.clearSelection();
    state.defaultValue = [];
  } else {
    // 取消高亮
    selectTableRef.value.setCurrentRow(-1);
    tableRowIndex.value = -1;
    radioVal.value = "";
    state.defaultValue = null;
  }
  nextTick(() => {
    if (props.multiple) {
      selectRef.value.selected?.forEach((item: { currentLabel: any; value: any }) => {
        item.currentLabel = item.value;
      });
    } else {
      selectRef.value.states.selectedLabel = (state.defaultValue && state.defaultValue[props.keywords.label]) || "";
    }
  });
};

/** ###################### Table事件 ###################### */
/** Table事件-单击行 */
const tableRowClick = (row: { [x: string]: any }) => {
  if (!props.rowClickRadio) return;
  if (!props.multiple) {
    let rowIndex;
    // eslint-disable-next-line no-unused-expressions
    props.table?.data.forEach((item: { [x: string]: any }, index: any) => {
      if (item[props.keywords.value] === row[props.keywords.value]) {
        // console.log('index', index)
        rowIndex = index;
      }
    });
    radioClick(row, rowIndex + 1);
    if (radioVal.value) {
      isRadio.value = true;
    } else {
      isRadio.value = false;
    }
  }
};
/** Table事件-点击单选框单元格 */
const radioChangeHandle = (event: { preventDefault: () => void }, row: any, index: any) => {
  event.preventDefault();
  radioClick(row, index);
};
/** 单选抛出事件radioChange */
const radioClick = (row: { [x: string]: any }, index: string) => {
  isDefaultSelectVal.value = true;
  if (radioVal.value === index) {
    // radioVal.value = "";
    // state.defaultValue = {};
    // state.rows = [{}];
    // state.ids = [null];
    // emits("radioChange", {}, null); // 取消勾选就把回传数据清除
    // selectBlur();
    console.log(111);
  } else {
    radioVal.value = index;
    state.defaultValue = row;
    state.rows = [row];
    state.ids = [row[props.keywords.value]];
    emits("radioChange", row, row[props.keywords.value]);
    selectBlur();
  }
};
/** Table事件-双击单元格-复制内容 */
const tableCellDblclick = (row: { [x: string]: any }, column: { property: string | number }) => {
  try {
    copyDomText(row[column.property]);
    ElMessage.success("复制成功");
  } catch (e) {
    ElMessage.error("复制失败");
  }
};
/** Table事件-复选框(多选) */
const tableSelectionChange = (val: any[]) => {
  isDefaultSelectVal.value = true;
  state.defaultValue = val.map(item => item[props.keywords.label]);
  state.rows = val;
  state.ids = val.map(item => item[props.keywords.value]);
  emits("selectionChange", val, state.ids);
};
/** Table事件-搜索后表格勾选不取消 */
const tableGetRowKey = (row: { [x: string]: any }) => {
  return row[props.keywords.value];
};
/** 表格事件-跳转到当前页码 */
const tableCurrentChange = (page: number) => {
  if (!isVisible.value) return;
  emits("page-change", page);
};
/** 表格事件-当前页码数量切换 */
const tableSizeChange = (size: number) => {
  emits("size-change", size);
};

/** 暴露方法出去 */
defineExpose({ selectFocus, selectBlur, selectClear, selectFilterMethod });
</script>

<style lang="scss">
.t-select-table {
  // 单选样式
  .radioStyle {
    .el-radio {
      .el-radio__label {
        display: none;
      }

      &:focus:not(.is-focus):not(:active):not(.is-disabled) .el-radio__inner {
        box-shadow: none;
      }
    }

    .el-table__row {
      cursor: pointer;
    }
  }

  // 键盘事件开启选择高亮
  .keyUpStyle {
    .el-table__body {
      tbody {
        .current-row {
          color: var(--el-color-primary) !important;
          cursor: pointer;
        }
      }
    }
  }

  // 选中行样式
  .highlightCurrentRow {
    :deep(.current-row) {
      color: var(--el-color-primary);
      cursor: pointer;
    }
  }

  .t-table-select__table {
    padding: 10px;

    .el-table__body,
    .el-table__header {
      margin: 0;
    }

    .el-table__cell {
      padding: 0;
      height: 23px !important;
    }
    .el-table--small .el-table__row {
      height: 23px !important;
    }

    .el-checkbox--small {
      margin: auto;
    }

    // 条件查询组件样式
    .table_query_condition {
      width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 10px;
    }
  }

  .t-table-select__page {
    margin-top: 5px;
    padding-top: 5px;
    padding-right: 10px;

    .el-pagination {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-right: calc(2% - 20px);
      background-color: var(--el-table-tr-bg-color);
    }
  }
}
</style>
