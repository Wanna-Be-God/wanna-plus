<template>
  <!-- 穿梭框组件根节点 可以自定义组件样式  -->
  <div class="wan-transfer-panel" :style="panelStyle">
    <div class="wan-transfer-panel_header">
      <el-checkbox v-model="panelState.allChecked" @change="handleAllCheckedChange" :indeterminate="isIndeterminate">
        <!-- 显示面板标题 -->
        {{ title }}
      </el-checkbox>
      <!-- 显示已选项的摘要信息 -->
      <span> {{ checkedSummary }} </span>
    </div>
    <div class="wan-transfer-panel_filter" v-if="filterable">
      <el-input
        class="wan-teansfer-input"
        size="small"
        :placeholder="filterPlaceholder"
        prefix-icon="el-icon-search"
        v-model="panelState.keywords"
      />
    </div>
    <!-- 自定义过滤 -->
    <div class="wan-transfer-panel_filter" v-if="customFilterable">
      <slot name="customFilter"></slot>
    </div>
    <div class="wan-transfer-panel_body" ref="panelBody">
      <el-table
        ref="tableRef"
        :row-key="rowKey"
        v-bind="tableProps"
        :data="filteredData"
        height="100%"
        @selection-change="selectionChange"
        @row-dblclick="handleTableDbclick"
        :empty-text="emptyText"
      >
        <!-- 拖拽列 -->
        <el-table-column v-if="rowDraggable" prop="sortable" width="55" align="center" fixed="left">
          <template #default>
            <!-- 拖拽图标 -->
            <span class="iconfont icon-tuozhuai" style="cursor: move"></span>
          </template>
        </el-table-column>
        <!-- 选择列 -->
        <el-table-column type="selection" width="35" align="center" fixed="left" :selectable="props.selectable"></el-table-column>
        <!-- 插槽用于自定义表格内容 -->
        <slot name="table"></slot>
      </el-table>
    </div>
    <div class="wan-transfer-panel_footer" v-if="slots.footer">
      <!-- 插槽用于自定义底部内容 -->
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Sortable from "sortablejs"; // 引入拖拽库
import { useCheck } from "./composables";
import { DRAG_CHANGE_EVENT, transferPanelEmits, transferPanelProps } from "./transfer-panel";
import type { TransferPanelState } from "./transfer-panel";
import { onMounted, reactive, ref, useSlots } from "vue";

const props = defineProps(transferPanelProps);
const emit = defineEmits(transferPanelEmits);
const slots = useSlots();

const panelState = reactive<TransferPanelState>({
  allChecked: false,
  keywords: "",
  checked: [],
  checkChangeByUser: false,
  customFormUpdate: false
});

const {
  tableRef,
  filteredData,
  emptyText,
  checkedSummary,
  isIndeterminate,
  handleTableDbclick,
  handleAllCheckedChange,
  selectionChange
} = useCheck(props, panelState, emit);

const panelBody = ref();

const initSort = () => {
  const el = tableRef.value.$el.querySelector(".el-table__body > tbody"); // 获取表格主体
  Sortable.create(el, {
    handle: ".icon-tuozhuai", // 拖拽手柄
    dragClass: "dragClass", // 拖拽时的样式
    ghostClass: "ghostClass", // 拖拽时的透明样式
    chosenClass: "chosenClass", // 选中样式
    onEnd: function (evt: any) {
      const targetRowIndex = evt.newIndex;
      const sourceRowIndex = evt.oldIndex;
      emit(DRAG_CHANGE_EVENT, targetRowIndex, sourceRowIndex); // 发出拖拽变化事件
    }
  });
};

onMounted(() => {
  if (props.rowDraggable) {
    initSort(); // 初始化拖拽
  }
});

defineExpose({
  /** 表格Ref */
  tableRef
});
</script>

<style lang="scss" scoped>
// $--border-color: #ebeef5;
$--border-color: #afafaf; // 边框颜色
.wan-transfer-panel {
  display: inline-flex; // 使用弹性布局
  flex-direction: column; // 垂直排列
  vertical-align: middle;
  height: 100%; // 高度占满
  overflow: hidden; // 隐藏溢出内容
  border: 1px solid $--border-color; // 边框
  border-radius: 5px; // 圆角
  min-width: 200px; // 最小宽度
  flex: 1; // 弹性伸缩

  .wan-transfer-panel_header {
    height: 40px; // 头部高度
    line-height: 40px; // 行高
    // background: #f5f7fa;
    border-bottom: 1px solid $--border-color; // 底部边框
    padding: 0 15px; // 内边距
    span:nth-last-child(1) {
      float: right; // 摘要信息右对齐
      font-size: 12px; // 字体大小
      color: #909399; // 字体颜色
      margin-left: 10px; // 左边距
    }
  }

  .wan-transfer-panel_filter {
    padding: 10px; // 过滤区域内边距
  }

  .wan-transfer-panel_footer {
    padding: 10px; // 底部区域内边距
    border-top: 1px solid $--border-color; // 顶部边框
  }

  .wan-transfer-panel_body {
    // padding: 0 10px; // 主体区域内边距
    // overflow-y: overlay;
    overflow: hidden; // 隐藏溢出内容
    flex: 1; // 弹性伸缩
  }
}

::v-deep .el-table::before {
  height: 0; // 解决表格高度问题
}

::v-deep .el-input__inner {
  border-radius: 28px; // 输入框圆角
}

::v-deep .el-table__fixed::before {
  height: 0; // 解决表格固定列高度问题
}

// 拖拽相关样式
:deep(.dragClass) {
  background: rgba($color: #41c21a, $alpha: 0.5) !important; // 拖拽时的背景样式
}
:deep(.ghostClass) {
  background: rgba($color: #6cacf5, $alpha: 0.5) !important; // 拖拽时的透明样式
}
:deep(.chosenClass:hover > td) {
  background: rgba($color: #f56c6c, $alpha: 0.5) !important; // 选中样式
}
</style>
