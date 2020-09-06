const express = require("express");
const router = express.Router();

const { authorizedAdminByPermission } = require("../../helpers/_base_helpers");
const scoreCumulative = require("../../controllers/cms/scoreCumulative.controller");
const ScoreCumulative_controller = new scoreCumulative();

router.get(
  "/get-list-score-cumulative",
  authorizedAdminByPermission("READ_SCORE_CUMULATIVE"),
  (req, res) => {
    ScoreCumulative_controller.GetListScoreCumulative(req, res);
  }
);

router.get(
  "/get-score-cumulative-by-id/:id",
  authorizedAdminByPermission("READ_SCORE_CUMULATIVE"),
  (req, res) => {
    ScoreCumulative_controller.GetScoreCumulativeByID(req, res);
  }
);

router.get(
  "/get-list-aff-by-id/:id",
  authorizedAdminByPermission("READ_SCORE_CUMULATIVE"),
  (req, res) => {
    ScoreCumulative_controller.getAffiliateUserListById(req, res);
  }
);

module.exports = router;
