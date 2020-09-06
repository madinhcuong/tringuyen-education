const axios = require("axios");
const { _extend } = require("util");
const { responseOk, responseError } = require("../../helpers/_base_helpers");

let api_world = "https://corona.lmao.ninja/v2/all";
// "https://corona-virus-stats.herokuapp.com/api/v1/cases/general-stats";

let api_vietnam = "https://corona.lmao.ninja/v2/countries/vn";
// "https://corona-virus-stats.herokuapp.com/api/v1/cases/countries-search?limit=10&search=Vietnam";

// test souc tree

class CoVid_19 {
  async GetInforCovid19VietNam(req, res) {
    try {
      axios
        .get(api_vietnam)
        .then((response) => {
          return responseOk(res, response.data);
        })
        .catch((error) => {
          console.log(error);
          return responseError(res, 400, 96, "INFOR_COVID19_NOT_FOUND");
        });
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetInforCovid19World(req, res) {
    try {
      axios
        .get(api_world)
        .then((response) => {
          return responseOk(res, response.data);
        })
        .catch((error) => {
          console.log(error);
          return responseError(res, 400, 96, "INFOR_COVID19_NOT_FOUND");
        });
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}
module.exports = CoVid_19;
