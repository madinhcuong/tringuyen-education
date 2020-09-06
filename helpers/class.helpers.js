module.exports = {
  distribution_student: number => {
    if (number <= 4.9) return "CHƯA ĐẠT";
    if (number <= 6.4) return "TRUNG BÌNH";
    if (number <= 7.9) return "KHÁ";
    if (number > 7.9) return "GIỎI";
  }
};
