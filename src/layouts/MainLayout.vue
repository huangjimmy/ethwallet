<template>
  <div class="container">
    <div class="sidebar">
      <div class="logobar">
        <a href="/"><img class="logo" src="../assets/logo.png" alt=""></a>
        <span class="slogan">CPSCOIN</span>
      </div>
      <ul class="menu">
        <li class="menu-item">
          <v-link href="/wallet">
            <i class="icon iconfont icon-wallet"></i>
            <span class="menu-item-text">钱包</span>
            <span class="tip" v-text="wallet_list.length"></span>
          </v-link>
        </li>
        <li class="menu-item">
          <v-link href="/transaction">
            <i class="icon iconfont icon-trade"></i>
            <span class="menu-item-text">交易</span>
          </v-link>
        </li>
        <li class="menu-item">
          <v-link href="/history">
            <i class="icon iconfont icon-tradelist"></i>
            <span class="menu-item-text">交易历史</span>
          </v-link>
        </li>
      </ul>
    </div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import VLink from "../components/VLink.vue";

export default {
  components: {
    VLink
  },
  data(){
    return {
      wallet_list:[]
    }
  },
  mounted(){
    this.wallet_list = this.$root.globalData.wallet_list;
  }
};
</script>

<style lang="less">
@import url(../assets/reset.less);
@import url(../assets/base.less);
@import url(../assets/iconfont.less);
@import url(../../node_modules/iview/dist/styles/iview.css);

.container {
  display: flex;
  margin: 0 auto;
  width: 1200px;
  min-height: 700px;
}
.sidebar {
  flex-direction: column;
  width: 200px;
  padding: 20px 0;
  background: rgb(82, 66, 120);
  color: #fff;
  .logobar {
    display:inline-flex;
    align-items: center;
    justify-content: center;
    width:100%;
    .logo {
      width: 52px;
      height: 52px;
    }
    .slogan {
      margin-left: 5px;
      font-size: 28px;
      font-family: "PTSans-NarrowBold", "PT Sans Narrow Bold", "PT Sans Narrow";
    }
  }
  .menu {
    margin: 60px 0 0 15px;
    font-size: 18px;
    .icon {
      font-size: 20px;
      margin: 0 5px;
    }
    .menu-item {
      height: 50px;
      color: #ccc;
      &:hover {
        color: #fff;
      }
      .tip {
        width: 20px;
        height: 20px;
        line-height: 20px;
        border-radius: 50%;
        float: right;
        text-align: center;
        background: #ccc;
        font-size: 14px;
        color: #000;
        margin-right: 15px;
      }
    }
  }
}
.content {
  flex-grow: 1;
  background: rgb(57, 60, 66);
  padding: 30px;
  min-width: 650px;
}
.btn-wrapper {
  height: 36px;
  line-height: 36px;
}
.filter-wrapper {
  height: 70px;
}
.content-wrapper {

}
</style>
