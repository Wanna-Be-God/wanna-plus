<!--
 * @Author: WANAN && 903157935@qq.com
 * @Date: 2025-03-13 11:59:41
 * @LastEditors: WANAN
 * @LastEditTime: 2025-03-13 23:08:51
 * @Description: 
-->
<script setup lang="ts">
import { reactive, ref } from "vue";

const state = reactive({
  dataSource: [
    {
      doctorId: "1",
      doctorName: "张三",
      doctorCode: "123456",
    },
    {
      doctorId: "2",
      doctorName: "李四",
      doctorCode: "123456",
    },
  ],
  ParentParams: {},
  value: [],
} as any);

/**
 * @description: 表格过滤条件自定义方法
 * @param {*} keyword
 * @param {*} row
 * @return {*}
 * @author: 唐漩
 */
const filterMethod = (keyword: any, row: any) => {
  return (
    row.doctorId.indexOf(keyword) > -1 ||
    row.doctorName.indexOf(keyword) > -1 ||
    row.doctorCode.indexOf(keyword) > -1
  );
};

/**
 * @description: 选中的数据双向绑定
 * @param {*} value
 * @return {*}
 * @author: 唐漩
 */
const input = (value: any) => {
  state.value = value;
};

/** 表格穿梭框 Ref */
const TableTransferRef = ref();
</script>

<template>
  <!-- <WanButton>Click me</WanButton> -->
  <WanTransferTable
    style="height: 100%;"
    ref="TableTransferRef"
    :data="state.dataSource"
    v-model:value="state.value"
    rowKey="doctorId"
    :titles="['已选项', '可选项']"
    filterable
    :filter-method="filterMethod"
    @input="input"
  >
    <template #left-table>
      <el-table-column label="医生编号" prop="doctorId"></el-table-column>
      <el-table-column label="医生名称" prop="doctorName"></el-table-column>
      <el-table-column label="工号" prop="doctorCode"></el-table-column>
    </template>
    <template #right-table>
      <el-table-column label="医生编号" prop="doctorId"></el-table-column>
      <el-table-column label="医生名称" prop="doctorName"></el-table-column>
      <el-table-column label="工号" prop="doctorCode"></el-table-column>
    </template>
  </WanTransferTable>
</template>

<style scoped></style>
