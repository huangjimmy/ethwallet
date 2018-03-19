import Vue from "vue";
import _ from "lodash";
import lightwallet from "eth-lightwallet-jh";
import iView from "iview";
import routes from "./routes";
import MainLayout from "./layouts/MainLayout.vue";
import dbUtils from "./dbUtils";
import web3Utils from "./web3Utils";

Vue.use(iView);

const app = new Vue({
  el: "#app",
  data: {
    currentView: "wallet",
    globalData: {
      wallet_list: [],
      current_wallet: {}
    }
  },
  components: {
    mainLayout: MainLayout,
    home: routes.home,
    wallet: routes.wallet,
    transaction: routes.transaction,
      send: routes.send,
      sendr: routes.sendr,
      receive: routes.receive,
    history: routes.history
  },
  created() {
    let _this = this,
      address_list = _.uniq(_.trim(dbUtils.get("address_list")).split(" ")),
      wallet = {};

    _.each(address_list, function(address) {
      let serialized_keystore = dbUtils.get(address);
      if (serialized_keystore) {
        wallet = {
          address: address,
          keystore: lightwallet.keystore.deserialize(dbUtils.get(address))
        };
        _this.globalData.wallet_list.push(wallet);
      }
    });

    dbUtils.set("address_list", address_list.join(" "));

    window.onhashchange = function(e) {
      _this.currentView = window.location.hash.replace("#", "");
    };
  },
  methods: {
  }
});
