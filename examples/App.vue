<template>
  <div id="app">
    <div style="margin:10px;width:200px;height:40px;">
      <v-tag-select placeholder="提示单选1" :search="ssearch" :multy="multy" :max="max" :change="change" :confirm="confirm" :cancel="cancel" :close="close" :empty="empty" :options="data"  v-model="value"></v-tag-select>
    </div>
    <div style="height:100px;width:100px;border:1px solid #ccc;" @click="add">12</div>
    <div style="height:100px;width:100px;">12</div>
     <div style="margin:10px;width:200px;height:40px;">
      <v-tag-select placeholder="提示单选2" :empty="empty" :search="ssearch"  :multy="smulty" :max="max" :options="data"></v-tag-select>
    </div>
       <div style="height:100px;width:100px;">12</div>
    <div style="height:100px;width:100px;">12</div>
    <div style="margin:10px;width:200px;height:40px;">
      <v-tag-select placeholder="提示单选3" :search="search"  :multy="multy" :options="data"  :value="val3"></v-tag-select>
    </div>
        <div style="height:100px;width:100px;">12</div>
    <div style="height:100px;width:100px;">12</div>
    <div style="margin:10px;width:200px;height:40px;">
      <v-tag-select placeholder="提示单选4" :empty="empty"  :multy="multy" :options="data" :search="ssearch"></v-tag-select>
    </div>
  </div>
</template>

<script>
import aa from './components/HelloWorld.vue'

export default {
  name: 'app',
  components: {
    aa
  },
  data(){
    return {
      test: '',
      empty:true,
      search:false,
      multy:true,
      max:0,
      data:[
        {text:"选项1",value:"1"},
        {text:"选项2",value:"2"},
        {text:"选项3",value:"3"},
        {text:"选项4",value:"4"}
      ],
      value:"1",
      val2:"2",
      val3:"3",
      smulty:false,
      ssearch:true
    }
  },
  methods:{
    fn () {
        this.test += 1 
    },
    add(){
      this.value = "1,3";
      this.data.push({text:"选项4",value:"4"});
    },
    change(data){
      console.info("change = " + JSON.stringify(data));
    },
    confirm(data){
      console.info("confirm = " + JSON.stringify(data));
    },
    cancel(data){
      console.info("cancel = " + JSON.stringify(data));
    },
    close(data){
      console.info("close = " + JSON.stringify(data));
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
