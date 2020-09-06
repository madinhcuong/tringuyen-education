let url_backend = "http://localhost:9000";
let url_fontEnd = "http://localhost:3000";
//let url_fontEnd = "http://localhost:9000";

if (process.env.NODE_ENV == "production") {
  url_backend = "https://tringuyeneducation.herokuapp.com";
  url_fontEnd = "https://tringuyeneducation.herokuapp.com";
}

module.exports = {
  configure_paypal: {
    mode: "sandbox",
    client_id:
      "Addw6a-HuKMZzXDfKxND2s7TGf7NjT9p_5VP08rbb3mYwn4AQoU5r2rAiVeiga-Mpvr7Fhg4mwET1Zb9",
    client_secret:
      "EPJjzqxFRy8FR6131ft4XSRJj6fzqC-udTIVYpCDvCZL_8lhiF0cEiGIrTwhHjCFut0PiH2slioNCUnD",
  },

  paypal_return: {
    return_url: `${url_fontEnd}/checkout-payment`,
    cancel_url: `${url_backend}/web/api/error`,
    // return_url: `${url_backend}/web/api/success`,
  },

  vn_pay: {
    vnp_TmnCode: "YZ1UFO96",
    vnp_HashSecret: "FMSDRWHNJNDVSDWEAOKCDLHCQOJGRWQQ",
    vnp_Url: "http://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    returnUrl: `${url_fontEnd}/checkout-payment`,
    //  returnUrl: `${url_backend}/web/api/vnpay-return`,
  },

  // MoMo
  getMomoConfig: (environment) => {
    if (environment == "DEVELOPMENT")
      return {
        hostname: "https://test-payment.momo.vn",
        hostname_noHTTPS: "test-payment.momo.vn",
        endpoint:
          "https://test-payment.momo.vn/gw_payment/transactionProcessor",
        path: "/gw_payment/transactionProcessor",
        serectkey: "dSKhNM3jZOGF2yBcyZiEa4bh4QVfbB5G",
        partnerCode: "MOMOBNSF20200701",
        accessKey: "qLkIVSPXTxf9Gvi9",
        returnUrl: `${url_fontEnd}/checkout-payment`,
        notifyurl: `${url_backend}/web/api/ipn-payment-callback-momo`,
        orderInfo: "Thanh toan tien hoc phi",
        requestType: "captureMoMoWallet",
      };
  },
};
