<template>
  <div>
    <div class="filter-wrapper">
    </div>
    <div class="content-wrapper">
      <div class="receive-wallet-wrapper">
        <div class="receive-wallet-selector">
          当前钱包：
          <i-select v-model="current_wallet.address" class="wallet-source" placeholder="选择钱包" @on-change="changeReceiveWallet">
            <Option v-for="item in wallet_list" :value="item.address" :key="item.address">{{ item.address }}</Option>
          </i-select>
        </div>
        <div class="receive-wallet-qrcode">
          收款二维码：<p class="qrcode" id="qrcode"></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import async from "async";
import BigNumber from "bignumber.js";
import reportUtils from "../reportUtils";
import web3Utils from "../web3Utils";
import kjua from "kjua";

export default {
  data() {
    return {
      token_address: "",
      transfer_token: 0,
      wallet_list: [],
      current_wallet: {
        balances:[]
      },
      target_address: "",
      qrcode: "",
      user_password: "",
      modal_loading:false,
      modal:{
        password_transaction:false
      }
    };
  },
  computed: {
    token: function() {
      let _this = this,
        _token = _.find(this.current_wallet.balances, { address: _this.token_address });
      return _token ? _token.symbol : "";
    },
    max: function() {
      let _this = this,
        _token = _.find(this.current_wallet.balances, { value: _this.token_address });
      return _token ? _token.balance : 0;
    },
    min: function() {
      return 0;
    },
    step: function() {
      return 0.0001;
    }
  },
  mounted() {
    this.wallet_list = this.$root.globalData.wallet_list;

    if (this.$root.globalData.current_wallet) {
      this.current_wallet = this.$root.globalData.current_wallet;
    }
  },
  methods: {
    openModal(modalname) {
      this.modal = {};
      this.modal[modalname] = true;
    },
    closeModal(modalname) {
      let modal_map = JSON.parse(JSON.stringify(this.modal));
      modalname ? (modal_map[modalname] = false) : (modal_map = {});
      this.modal = modal_map;
      this.modal_loading = false;
      this.user_password = "";
    },
    generateQRCode(text) {
      let img_path = "./assets/logo.png",
        _qrcode = document.querySelector("#qrcode");
      _qrcode.innerHTML = "";
      _qrcode.appendChild(kjua({ text: text }));
    },
    changeReceiveWallet(address) {
      let _this = this,
        current_wallet = _.cloneDeep(
          _.find(this.$root.globalData.wallet_list, ["address", address])
        );
      this.current_wallet = current_wallet;
      this.generateQRCode(address);
    },

    getBalance(wallet) {
      var _this = this,
        web3 = web3Utils.getWeb3(),
        erc20tokens = web3Utils.getErc20Tokens(),
        _wallet = _.defaults({}, wallet),
        _token = {
          address: "ETH",
          symbol: "ETH"
        };

      _wallet.balances = [];

      _token.balance = web3Utils.toRealAmount(
        web3.eth.getBalance(_wallet.address)
      );

      _wallet.balances.push(_token);

      _.forEach(erc20tokens, token => {
        let balance = token.contract.balanceOf("" + _wallet.address);
        _token = {
          address: token.address,
          symbol: token.symbol,
          balance:parseFloat(web3Utils.toRealAmount(
            balance,
            token.decimals
          ))
        };
        _wallet.balances.push(_token);
      });    
      _this.current_wallet = _.defaults(wallet, _wallet);
      _this.wallet_list[
        _.findIndex(_this.wallet_list, { address: wallet.address })
      ] = _.cloneDeep(_this.current_wallet);
    },
    onWalletChange() {},
    onTokenChange(value) {
      this.token = value;
    }
  }
};
</script>

<style lang="less" scoped>
.content-wrapper {
  color: #fff;
  .form-item {
    display: inline-flex;
    align-items: flex-end;
    color: #ccc;
    font-size: 16px;
    width: 45%;
  }
  .wallet-source,
  .wallet-target,
  .transfer {
    font-size: 24px;
    color: #000;
  }
  .wallet-source,
  .wallet-target,
  .transfer,
  .token-amount {
    width: 80%;
  }
  .wallet-source {
    margin-left: 20px;
  }
  .wallet-target,
  .token-amount {
    margin-left: 5px;
  }
  .transfer {
    margin-left: 5px;
    .transfer-token {
      width: 248px;
    }
    .transfer-token-selector {
      width: 80px;
    }
  }
  .wallet-selector {
    font-size: 12px;
    text-decoration: underline;
    cursor: pointer;
  }
  .have-token-group {
    margin-left: 5px;
    color: #ccc;
    .have-token,
    .token {
      font-size: 16px;
      padding: 0 5px 0 0;
    }
  }
  .gap {
    clear: both;
    display: table;
    margin-top: 50px;
    width: 100%;
  }
  .result-wrapper {
    border-top: 1px solid rgba(110, 110, 110, 0.5);
    padding-top: 40px;
    margin-top: 50px;
    width: 100%;
    .ready-to-transfer {
      flex-grow: 0;
    }
    .form-item {
      width: 90%;
    }
    .transfer-amount,
    .amount-token {
      padding: 0 10px;
      font-size: 32px;
      color: #fff;
    }
    .token {
      flex-grow: 1;
    }
  }
  .receive-wallet-wrapper {
    font-size: 16px;
    color: #ccc;
    .receive-wallet-qrcode {
      margin-top: 30px;
      .qrcode {
        margin-left: 100px;
      }
    }
  }
}
</style>
