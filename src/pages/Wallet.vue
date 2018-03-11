<template>
  <div>
    <div class="btn-wrapper">
      <Button class="button" @click="openModal('create_wallet')">创建新钱包</Button>
      <Modal v-model="modal.create_wallet" width="360" :closable="false" :mask-closable="false">
        <p slot="header" style="text-align:center">
            <span>创建新钱包</span>
        </p>
        <div style="text-align:center">
            <i-input v-model="user_entropy" placeholder="Type random text to generate entropy" style="width: 100%"></i-input>
        </div>
        <div slot="footer" style="text-align:center;">
            <i-button class="button" @click="proceedCreateToPassword">创建</i-button>
            <i-button class="button" @click="closeModal()">关闭</i-button>
        </div>
      </Modal>
      <Modal v-model="modal.password_create" width="360" :closable="false" :mask-closable="false">
        <div style="text-align:center">
            <p style="text-align:left">Your new wallet seed is: "<span class="danger" v-text="seed"></span>". Please write it down on paper or in a password manager, you will need it to access your wallet. Do not let anyone see this seed or they can take your Ether. Please enter a password to encrypt your seed while in the browser.</p>
            <i-input type="password" v-model="user_password" placeholder="Type your password" style="width: 100%"></i-input>
        </div>
        <div slot="footer" style="text-align:center;">
            <i-button class="button" :loading="modal_loading" @click="createWallet">确定</i-button>
            <i-button class="button" @click="closeModal('password_create')">关闭</i-button>
        </div>
      </Modal>
      <Modal v-model="modal.restore_wallet" width="360" :closable="false" :mask-closable="false">
        <p slot="header" style="text-align:center">
            <span>seed</span>
        </p>
        <div style="text-align:center">
            <i-input v-model="seed" placeholder="Type your wallet seed" style="width: 100%"></i-input>
        </div>
        <div slot="footer" style="text-align:center;">
            <i-button class="button" @click="proceedStoreToPassword">确定</i-button>
            <i-button class="button" @click="closeModal()">关闭</i-button>
        </div>
      </Modal>
      <Modal v-model="modal.password_restore" width="360" :closable="false" :mask-closable="false">
        <p slot="header" style="text-align:center">
            <span>输入密码</span>
        </p>
        <div style="text-align:center">
            <i-input type="password" v-model="user_password" placeholder="Type your password" style="width: 100%"></i-input>
        </div>
        <div slot="footer" style="text-align:center;">
            <i-button class="button" :loading="modal_loading" @click="restoreWallet">确定</i-button>
            <i-button class="button" @click="closeModal()">关闭</i-button>
        </div>
      </Modal>
      <Modal v-model="modal.seed_export" width="360" :closable="false" :mask-closable="false">
        <p slot="header" style="text-align:center">
            <span>请记牢Seed</span>
        </p>
        <div style="text-align:center">
          <p class="seed-export">{{seed}}</p>    
        </div>
        <div slot="footer" style="text-align:center;">
            <i-button class="button" @click="closeModal()">关闭</i-button>
        </div>
      </Modal>
      <Modal v-model="modal.password_export" width="360" :closable="false" :mask-closable="false">
        <p slot="header" style="text-align:center">
            <span>输入密码</span>
        </p>
        <div style="text-align:center">
            <i-input type="password" v-model="user_password" placeholder="Type your password" style="width: 100%"></i-input>
        </div>
        <div slot="footer" style="text-align:center;">
            <i-button class="button" :loading="modal_loading" @click="exportWallet">确定</i-button>
            <i-button class="button" @click="closeModal()">关闭</i-button>
        </div>
      </Modal>
      <i-button class="button" @click="openModal('restore_wallet')">恢复钱包</i-button>
      <i-button class="button">帮助</i-button>
    </div>
    <div class="filter-wrapper">
    </div>
    <div class="content-wrapper">
      <ul class="wallet-list">
        <li class="wallet-item" v-for="wallet in wallet_list" :key="wallet.address">
          <div class="wallet-wrapper" @click="processTransaction(wallet)">
            <h1 class="wallet-address">
              <i class="icon iconfont icon-key"></i>
              <span v-text="wallet.address"></span>
              <p>
              <span class="token-wrapper" v-for="(value, key) in wallet" v-bind:key="key">
                <span v-show="key !== 'address' && key !== 'keystore'">{{value}} {{key}}</span>
              </span>
              </p>
            </h1>
          </div>
          <a href="javascript:;" class="export" @click="proceedExport(wallet)">导出秘钥</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import lightwallet from "eth-lightwallet";
import HookedWeb3Provider from "hooked-web3-provider";
import _ from "lodash";
import dbUtils from "../dbUtils";
import reportUtils from "../reportUtils";
import web3Utils from "../web3Utils";

export default {
  data() {
    return {
      modal: {},
      modal_loading: false,
      user_entropy: "",
      user_password: "",
      wallet_list: [],
      seed: ""
    };
  },
  mounted() {
    this.loadWallet();
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
      this.user_entropy = "";
      this.user_password = "";
      this.seed = "";
    },
    
    newAddresses(password, keystore) {
      let _this = this,
          address;
      keystore.keyFromPassword(password, function(err, pwDerivedKey) {
        if (err) {
          reportUtils.report(err);
          return;
        }
        keystore.generateNewAddress(pwDerivedKey, 1);
        _.each(keystore.getAddresses(), address => {
          _this.updateWallet(_this.getBalance({
            address:address,
            keystore:keystore
          }));
        })
      });
    },
    proceedCreateToPassword() {
      if (!this.user_entropy) {
        this.$Message.error("输入字符先");
      } else {
        this.openModal("password_create");
        this.seed = lightwallet.keystore.generateRandomSeed(this.user_entropy);
      }
    },
    createWallet() {
      if (this.modal_loading) return;

      if (!this.user_password) {
        this.$Message.error("输入密码");
      }

      let _this = this,
        password = this.user_password;

      this.modal_loading = true;

      lightwallet.keystore.createVault(
        {
          password: password,
          seedPhrase: _this.seed,
          //random salt
          hdPathString: "m/0'/0'/0'"
        },
        function(err, ks) {
          if (err) {
            reportUtils.report(err);
            this.$Message.error("创建失败");
            return;
          }
          try {
            _this.newAddresses(password, ks);
            web3Utils.setWebProvider(ks);  
          } catch (err) {
            reportUtils.report(err);
            _this.$Message.error("创建失败");
          } finally {
            _this.closeModal();
          }
        }
      );
    },
    getBalance(wallet) {
      web3Utils.setWebProvider(wallet.keystore);
      
      var _this = this,
        web3 = web3Utils.getWeb3(),
        erc20tokens = web3Utils.getErc20Tokens(),
        _wallet = _.defaults({}, wallet),
        _token_list = [];

      _token_list.push({
        value: "ETH",
        label: "ETH"
      });
      _wallet["ETH"] = web3Utils.toRealAmount(
        web3.eth.getBalance(_wallet.address)
      );

      _.forEach(erc20tokens, token => {
        let balance = token.contract.balanceOf("" + _wallet.address);
        _token_list.push({
          value: token.address,
          label: token.symbol
        });
        // _wallet[token.contract.address] = web3Utils.toRealAmount(
        //   balance,
        //   token.decimals
        // );
        _wallet[token.symbol] = web3Utils.toRealAmount(
          balance,
          token.decimals
        );
      });
      return _.defaults({}, wallet, _wallet);
    },
    proceedStoreToPassword() {
      if (!this.seed) {
        this.$Message.error("输入seed");
      } else {
        this.openModal("password_restore");
      }
    },
    restoreWallet() {
      var _this = this,
        password = this.user_password,
        seed = this.seed;

      this.modal_loading = true;

      if(lightwallet.keystore.isSeedValid(seed)){
        lightwallet.keystore.createVault(
          {
            password: password,
            seedPhrase: seed,
            //random salt
            hdPathString: "m/44'/60'/0'/0"
          },
          function(err, ks) {
            if (err) {
              window.location.reload();
            }
            try {
              _this.newAddresses(password, ks);
              web3Utils.setWebProvider(ks);  
            } catch (e) {
              reportUtils.report(e);
              _this.$Message.error("恢复失败");
            } finally {
              _this.closeModal();
            }
          }
        );
      }else{
        _this.$Message.error("无效的Seed");
        _this.closeModal();
      }
    },
    updateWallet(wallet) {
      let index = _.findIndex(this.wallet_list, ["address", wallet.address]);
      if (index != -1) {
        // lightwallet.keystore.upgradeOldSerialized(wallet.keystore, password, function(keystore){
        //   wallet.keystore = keystore;
        // })
        this.wallet_list[index] = wallet;
      } else {
        this.wallet_list.push(wallet);
        dbUtils.set(
          "address_list",
          [dbUtils.get("address_list"), wallet.address].join(" ")
        );
      }
      dbUtils.set(wallet.address, wallet.keystore.serialize());
    },
    loadWallet() {
      let _this = this;
      this.wallet_list = this.$root.globalData.wallet_list.map( wallet => {
        return _this.getBalance(wallet);
      })
    },
    proceedExport(wallet) {
      this.openModal("password_export");
      this.current_wallet = _.cloneDeep(wallet);
    },
    exportWallet() {
      let _this = this,
        password = this.user_password,
        keystore = _.find(this.wallet_list, this.current_wallet).keystore;

      keystore.keyFromPassword(password, function(err, pwDerivedKey) {
        if (err) {
          reportUtils.report(err);
          _this.$Message.error(err);
          return;
        }
        try {
          _this.seed = keystore.getSeed(pwDerivedKey);
          _this.openModal("seed_export");
        } catch (e) {
          _this.$Message.error("导出失败");
        }
      });
    },
    processTransaction(wallet) {
      this.$root.globalData.current_wallet = _.cloneDeep(wallet);
      window.location.hash = "transaction";
    }
  }
};
</script>

<style lang="less" scoped>
.seed-export {
  font-size: 30px;
  color: red;
}
.token-wrapper{
  margin-right:10px;
  font-size:12px;
  color:#ccc;
}
.wallet-list {
  display: flex;
  flex-direction: column;
  .wallet-item {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    height: 70px;
    padding: 0 20px;
    background: rgba(90, 84, 111, 1);
    margin-bottom: 10px;
    border: 1px solid rgb(204, 204, 204);
    .wallet-wrapper {
      flex-grow: 1;
      .wallet-address {
        color: #ccc;
        font-size: 20px;
      }
    }
    .export {
      text-align: right;
      flex-direction: row;
      font-size: 12px;
      color: #fff;
      visibility: hidden;
      cursor: pointer;
    }
    &:hover,
    &.active {
      background: rgb(159, 135, 169);
      border: 1px solid #fff;
      .wallet-name {
        color: #efefef;
      }
      .wallet-address {
        color: #fff;
      }
    }
    &:hover {
      .export {
        visibility: visible;
        color: #fff;
      }
    }
  }
}
</style>
