<template>
  <div>
    <div class="btn-wrapper">
      <Button class="button" @click="changeNet('TEST')" v-show="net==='PROD'">切换到测试网</Button>
      <Button class="button" @click="changeNet('PROD')" v-show="net==='TEST'">切换到正式网</Button>
    </div>
    <div class="filter-wrapper">
      <i-input v-model="keyword" class="keyword" placeholder="地址">
        <i-select v-model="address" slot="append" class="transfer-wallet-selector" placeholder="选择钱包" @on-change="onWalletChange">
            <Option v-for="item in wallet_list" :value="item.address" :key="item.address">{{ item.address }}</Option>
        </i-select>
      </i-input>
      <Button class="button filter-button" @click="search">搜索</Button>
      <Button class="button filter-button" @click="filter(keyword)" :disabled="filter_list.length>0?false:true">在结果中搜索</Button>
    </div>
    <div class="content-wrapper">
      <ul class="transaction-list">
        <li class="transaction-item" v-for="transaction in filter_list" v-bind:key="transaction.hash">
          <div class="transaction-wrapper">
            <h1 class="transaction-title">TRANSACTION</h1>
            <p class="transaction-sub">
              <span v-text="transaction.from"></span> => <span v-text="transaction.to"></span>
            </p>
          </div>
          <div class="transaction-token-wrapper">
            <span class="token-amount" v-text="transaction.value"></span>
            <span class="token">{{ transaction.contractAddress | translateAddressToToken }}</span>
          </div>
          <div class="transaction-time-wrapper">{{transaction.timeStamp | formatDate}}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import MainLayout from "../layouts/MainLayout.vue";
import web3Utils from "../web3Utils";

export default {
  data() {
    return {
      net:'TEST',
      wallet_list: [],
      current_wallet: {},
      keyword: "",
      address: "",
      transaction_list: [],
      filter_list:[]
    };
  },
  mounted() {
    this.wallet_list = this.$root.globalData.wallet_list;
  },
  filters: {
    formatDate: function(timestamp) {
      let newDate = new Date();
      newDate.setTime(timestamp * 1000);
      return newDate.toLocaleString();
    },
    translateAddressToToken: function(address) {
      if(!address) return 'ETH';
      let erc20token = _.find(web3Utils.getErc20Tokens(), {
          address: address
        });
      return erc20token?erc20token.symbol:'未知';
    }
  },
  methods: {
    changeNet(net){
      var _this = this;
      this.$Loading.start();
      setTimeout(()=>{
        _this.$Loading.finish();
        _this.net = net;
      },5);
    },
    loadHistory(address) {
      let _this = this,
          requestUrl = `${web3Utils.getHttpBaseUrl(this.net)}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc`;
      this.$Loading.start();
      
      axios.get(requestUrl)
        .then(response => {
          _this.transaction_list = response.data.result;
          _this.filter_list = response.data.result;
          _this.$Loading.finish();
        })
        .catch(error => {
          _this.$Message.error(error);
          _this.$Loading.error();
        });
    },
    onWalletChange(address) {
      let _this = this,
        web3 = web3Utils.getWeb3(),
        current_wallet = _.find(this.$root.globalData.wallet_list, ["address", address]);

      web3Utils.setWebProvider(current_wallet.keystore);
    },
    search(){
      this.loadHistory(this.address);
      // this.loadHistory("0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a");
    },
    filter(keyword) {
      if(keyword){
        this.filter_list = this.transaction_list.filter(transaction => {
          return transaction.from === keyword || transaction.to === keyword;
        })
      }else{
        this.filter_list = [].concat(this.transaction_list);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.filter-wrapper {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
}
.keyword {
  width: 620px;
}
.transfer-wallet-selector {
  width: 320px;
}
.filter-button {
  height: 34px;
  margin-left: 10px;
}
.transaction-list {
  display: flex;
  flex-direction: column;
  .transaction-item {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    height: 70px;
    margin-bottom: 10px;
    color: #ccc;
    border: 1px solid #999;
    border-left: 5px solid #ccc;
    background: rgb(90, 84, 110);
    padding: 0 30px;
    &:nth-child(2n) {
      background: rgb(177, 156, 171);
    }
    &:hover {
      border: 1px solid #fff;
      border-left: 5px solid #fff;
      color: #fff;
    }
    .transaction-wrapper {
      flex-grow: 1;
      .transaction-title {
        display: inline-flex;
        font-size: 20px;
      }
      .transaction-sub {
        color: #eee;
        font-size: 10px;
        margin-top: 10px;
      }
    }
    .transaction-token-wrapper {
      font-size: 14px;
      align-content: left;
    }
    .transaction-time-wrapper {
      width: 150px;
      font-size: 12px;
      padding: 0 0 0 10px;
    }
  }
}
</style>
