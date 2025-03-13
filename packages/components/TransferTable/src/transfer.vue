<template>
  <!-- 左 源数据  右 目标数据 -->
  <div class="wan-transfer" v-if="normal">
    <!-- 源数据 -->
    <transfer-panel
      ref="leftPanel"
      :panelStyle="leftPanelStyle"
      :rowKey="rowKey"
      :data="sourceData"
      :title="leftPanelTitle"
      :default-checked="leftDefaultChecked"
      :filterable="filterable"
      :filterPlaceholder="filterPlaceholder"
      :filterMethod="filterMethod"
      :customFilterable="leftCustomFilterable"
      :customFilterForm="leftCustomFilteForm"
      :customFilterMethod="leftCustomFilterMethod"
      :format="format"
      :rowDraggable="rowDraggable"
      :selectable="selectable"
      :table-props="tableProps"
      @checked-change="onSourceCheckedChange"
      @row-dblclick="leftTableDBClick"
      @drag-change="onSourceDrag"
    >
      <template #customFilter v-if="slots.leftCustomFilter">
        <slot name="leftCustomFilter"></slot>
      </template>
      <template #table>
        <slot></slot>
        <slot name="left-table"></slot>
      </template>
      <template #footer v-if="slots.leftFooter"
        ><slot name="leftFooter"></slot
      ></template>
    </transfer-panel>
    <!-- 操作按钮 -->
    <el-space class="mx-2" direction="vertical">
      <el-button
        type="primary"
        :disabled="isEmpty(checkedState.rightChecked)"
        @click="addToLeft"
      >
        <el-icon><ArrowLeftBold /></el-icon>
        <span v-if="!isUndefined(buttonTexts[0])">{{ buttonTexts[0] }}</span>
      </el-button>
      <el-button
        type="primary"
        :disabled="isEmpty(checkedState.leftChecked)"
        @click="addToRight"
      >
        <el-icon><ArrowRightBold /></el-icon>
        <span v-if="!isUndefined(buttonTexts[1])">{{ buttonTexts[1] }}</span>
      </el-button>
    </el-space>
    <!-- 目标数据 -->
    <transfer-panel
      ref="rightPanel"
      :panelStyle="rightPanelStyle"
      :rowKey="rowKey"
      :data="targetData"
      :title="rightPanelTitle"
      :default-checked="rightDefaultChecked"
      :filterable="filterable"
      :filterPlaceholder="filterPlaceholder"
      :filterMethod="filterMethod"
      :customFilterable="rightCustomFilterable"
      :customFilterForm="rightCustomFilteForm"
      :customFilterMethod="rightCustomFilterMethod"
      :targetOrder="targetOrder"
      :format="format"
      :rowDraggable="rowDraggable"
      :selectable="selectable"
      :table-props="tableProps"
      @checked-change="onTargetCheckedChange"
      @row-dblclick="rightTableDBClick"
      @drag-change="onTargetDrag"
    >
      <template #customFilter v-if="slots.rightCustomFilter">
        <slot name="rightCustomFilter"></slot>
      </template>
      <template #table>
        <slot></slot>
        <slot name="right-table"></slot>
      </template>

      <template #footer v-if="slots.rightFooter"
        ><slot name="rightFooter"></slot
      ></template>
    </transfer-panel>
  </div>
  <!-- 左 目标数据 右 源数据 -->
  <div class="wan-transfer" v-else>
    <!-- 目标数据 -->
    <transfer-panel
      ref="rightPanel"
      :panelStyle="rightPanelStyle"
      :rowKey="rowKey"
      :data="targetData"
      :title="rightPanelTitle"
      :default-checked="rightDefaultChecked"
      :filterable="filterable"
      :filterPlaceholder="filterPlaceholder"
      :filterMethod="filterMethod"
      :customFilterable="rightCustomFilterable"
      :customFilterForm="rightCustomFilteForm"
      :customFilterMethod="rightCustomFilterMethod"
      :targetOrder="targetOrder"
      :format="format"
      :rowDraggable="rowDraggable"
      :selectable="selectable"
      :table-props="tableProps"
      @checked-change="onTargetCheckedChange"
      @row-dblclick="rightTableDBClick"
      @drag-change="onTargetDrag"
    >
      <template #customFilter v-if="slots.rightCustomFilter">
        <slot name="rightCustomFilter"></slot>
      </template>
      <template #table>
        <slot></slot>
        <slot name="right-table"></slot>
      </template>
      <template #footer v-if="slots.rightFooter"
        ><slot name="rightFooter"></slot
      ></template>
    </transfer-panel>
    <!-- 操作按钮 -->
    <el-space class="mx-2" direction="vertical">
      <!-- 添加到目标数据 -->
      <el-button
        type="primary"
        :disabled="isEmpty(checkedState.leftChecked)"
        @click="addToRight"
      >
        <el-icon><ArrowLeftBold /></el-icon>
        <span v-if="!isUndefined(buttonTexts[1])">{{ buttonTexts[1] }}</span>
      </el-button>
      <!-- 添加到源数据 -->
      <el-button
        type="primary"
        :disabled="isEmpty(checkedState.rightChecked)"
        @click="addToLeft"
      >
        <el-icon><ArrowRightBold /></el-icon>
        <span v-if="!isUndefined(buttonTexts[0])">{{ buttonTexts[0] }}</span>
      </el-button>
    </el-space>
    <!-- 源数据 -->
    <transfer-panel
      ref="leftPanel"
      :panelStyle="leftPanelStyle"
      :rowKey="rowKey"
      :data="sourceData"
      :title="leftPanelTitle"
      :default-checked="leftDefaultChecked"
      :filterable="filterable"
      :filterPlaceholder="filterPlaceholder"
      :filterMethod="filterMethod"
      :customFilterable="leftCustomFilterable"
      :customFilterForm="leftCustomFilteForm"
      :customFilterMethod="leftCustomFilterMethod"
      :format="format"
      :rowDraggable="rowDraggable"
      :selectable="selectable"
      :table-props="tableProps"
      @checked-change="onSourceCheckedChange"
      @row-dblclick="leftTableDBClick"
      @drag-change="onSourceDrag"
    >
      <template #customFilter v-if="slots.leftCustomFilter">
        <slot name="leftCustomFilter"></slot>
      </template>
      <template #table>
        <slot></slot>
        <slot name="left-table"></slot>
      </template>
      <template #footer v-if="slots.leftFooter"
        ><slot name="leftFooter"></slot
      ></template>
    </transfer-panel>
  </div>
</template>

<script setup lang="ts">
import { isEmpty, isUndefined } from "element-plus/es/utils/index";
import TransferPanel from "./transfer-panel.vue";
import { transferEmits, transferProps } from "./transfer";
import type { TransferCheckedState } from "./transfer";
import { useMove, useComputedData, useCheckedChange } from "./composables";
import type { TransferPanelInstance } from "./transfer-panel";
import { useSlots, reactive, ref, toRaw } from "vue";

defineOptions({
  name: "WanTransferTable",
});

const props = defineProps(transferProps);
const emit = defineEmits(transferEmits);
const slots = useSlots();

const checkedState = reactive<TransferCheckedState>({
  rightChecked: [],
  leftChecked: [],
});

const leftPanel = ref<TransferPanelInstance>();
const rightPanel = ref<TransferPanelInstance>();

const { sourceData, targetData, leftPanelTitle, rightPanelTitle } =
  useComputedData(props);

const { addToLeft, addToRight, leftTableDBClick, rightTableDBClick } = useMove(
  props,
  checkedState,
  emit
);

const { onSourceCheckedChange, onTargetCheckedChange } = useCheckedChange(
  checkedState,
  emit
);

const onSourceDrag = (targetRowIndex: number, sourceRowIndex: number) => {
  sourceData.value.splice(
    targetRowIndex,
    0,
    sourceData.value.splice(sourceRowIndex, 1)[0]
  );
};
const onTargetDrag = (targetRowIndex: number, sourceRowIndex: any) => {
  targetData.value.splice(
    targetRowIndex,
    0,
    targetData.value.splice(sourceRowIndex, 1)[0]
  );
};

/**
 * @description: 获取 targetData 目标数据
 */
const getTargetData = () => toRaw(targetData.value);

defineExpose({
  getTargetData,
  leftPanel,
  rightPanel,
});
</script>

<style lang="scss" scoped>
.wan-transfer {
  text-align: left;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: auto;
  .wan-transfer-option {
    display: flex;
    flex-direction: column;
    vertical-align: middle;
    margin: 0 10px;
  }
}
</style>
