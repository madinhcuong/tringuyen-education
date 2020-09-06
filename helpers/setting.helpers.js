module.exports = {
  // trên 500 điểm được đổi tiền
  on_Score: 500,

  // cộng điểm F1 = tiền khóa học ban đầu nhân 0.0025% /100 (0.000025)
  score_F1: 0.000025,

  // cộng điểm F2 = tiền khóa học ban đầu nhân 0.00125% /100 (0.0000125)
  score_F2: 0.0000125,

  // số điểm đổi nhân 2 (tiền thì nhân thêm 1000)
  score_x2: 2000,

  // tiền hoa hồng F1 5% (~ 0.05)
  rose_F1: 0.05,

  // tiền hoa hồng F2 2.5% (~ 0.025)
  rose_F2: 0.025,

  score_discount: (key_score) => {
    switch (key_score) {
      case "discount_25":
        return { score: 300, sale: 25 };

      case "discount_50":
        return { score: 600, sale: 50 };

      case "discount_75":
        return { score: 900, sale: 75 };

      case "discount_100":
        return { score: 1200, sale: 100 };
    }
  },

  // cộng điểm thăng hạng
  addition_score_level_wallet: (level_check, score_check) => {
    // "bronze", "silver", "gold", "diamond"
    let data = { addition: false, level: level_check, score_addition: 0 };

    // bạc
    if (
      score_check >= 500 &&
      level_check == "bronze" &&
      level_check != "silver" &&
      level_check != "gold" &&
      level_check != "diamond"
    ) {
      data = {
        addition: true,
        level: "silver",
        score_addition: 100,
        title: "Bạc",
      };
    }

    // vàng
    if (
      score_check >= 1000 &&
      level_check != "bronze" &&
      level_check == "silver" &&
      level_check != "gold" &&
      level_check != "diamond"
    ) {
      data = {
        addition: true,
        level: "gold",
        score_addition: 200,
        title: "Vàng",
      };
    }

    // kc
    if (
      score_check >= 10000 &&
      level_check != "bronze" &&
      level_check != "silver" &&
      level_check == "gold" &&
      level_check != "diamond"
    ) {
      data = {
        addition: true,
        level: "diamond",
        score_addition: 300,
        title: "Kim cương",
      };
    }

    return data;
  },
};
