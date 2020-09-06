// const nodemailer = require("nodemailer");
// const { google } = require("googleapis");

// const OAuth2 = google.auth.OAuth2;

// const client_Id =
//   "933963304592-8jk83ereg2b17m5d5kb43hcol1ir2r77.apps.googleusercontent.com";

// const client_Secret = "QFliwGu4zbwYA_kFNpqoLKF_";

// const refresh_Token =
//   "1//040hYELBuuW1cCgYIARAAGAQSNwF-L9Ir9fIbgKvym7QSQhPOqwXo5tQLl7jY8Ggw_mQidKpobxgQl7PsRQCuEaD5bA-ttNmgVys";

// const oauth2Client = new OAuth2(
//   client_Id,
//   client_Secret,
//   "https://developers.google.com/oauthplayground" // Redirect URL
// );

// oauth2Client.setCredentials({
//   refresh_token: refresh_Token,
// });
// const accessToken = oauth2Client.getAccessToken();

module.exports = {
  // transporter_config: {
  //   service: "gmail",
  //   auth: {
  //     type: "oauth2",
  //     user: "tringuyeneducation@gmail.com",
  //     clientId: client_Id,
  //     clientSecret: client_Secret,
  //     refreshToken: refresh_Token,
  //     accessToken: accessToken,
  //   },
  // },

  // Tạo mật khẩu ứng dụng trong gmail
  transporter_config: {
    service: "Gmail",
    auth: {
      user: "tringuyeneducation@gmail.com",
      pass: "e f a p o e h w b e o g q r j u",
    },
    tls: {
      rejectUnauthorized: false,
    },
  },
};

// let transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   service: "gmail",
//   port: 587,
//   secure: false, // true for 465, false for other ports
//   auth: {
//     user: "abckhongchobiet@gmail.com",
//     pass: "cuongquyky",
//   },
// });

// let option = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   service: "gmail",
//   port: 587,
//   secure: false, // true for 465, false for other ports
//   auth: {
//     user: "distancetrainingservice@gmail.com",
//     pass: "distancetraining"
//   }
// });
