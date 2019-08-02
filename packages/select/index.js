import VTagSelect from './src/main.vue'

// 为组件添加 install 方法，用于按需引入
VTagSelect.install = function (Vue) {
    Vue.component(VTagSelect.name, VTagSelect)
}

export default VTagSelect