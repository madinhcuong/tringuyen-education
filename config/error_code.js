// - 888: UNAUTHORIZED  (quyền)

// - 999: access_token (phải đăng nhập)

// -100: Email and password does not match (sai email hoac mat khau)

// -2: TOPIC_NOT_FOUND (id topic ko có)

// - 4: NEWS_NOT_FOUND

// - 6: NOT_CREATE_TRAINING (không thêm được training)

// -8: TRAINING_NOT_FOUND (không có)

// -10: ADMIN_ROLE_NOT_FOUND (ko co data role)

// - 12: NOT_CREATE_STAFF (ko tạo được nhan viên)

// -14 : TEACHER_NOT_FOUND (khong tim thay giao vien)

// -16: STAFF_NOT_FOUND (không tìm thấy nhân viên)

// - 18: EMAIL_DUPLICATE (email trùng)

// - 20: NOT_CREATE_INFORTRAINING (không tạo được thông tin khóa học)

// - 22 : INFOR_TRAINING_NOT_FOUND (không tìm thấy thông tin khóa học)

// - 24 : NOT_CREATE_COURSES  (Không tạo được khóa học)

// - 26: NOT_COURSES_NOT_FOUND (Không tìm thấy khóa học)

// - 28: NOT_CREATE_CLASS (Không tạo được lớp học)

// - 30: CLASSALL_NOT_FOUND (không tìm thấy lớp hoc)

// - 32: NOT_CREATE_STUDENT (không tạo được học viên)

// - 34: NOT_CREATE_DEBIT (không tạo được ví)

// - 36: EMAIL_NOT_FOUND (khoonng tim thấy email)

// - 38: CONNECT_ACCOUNT_ERROR (ket noi tk mail that bai)

// - 40: SEND_MAIL_ERROR (ko gui dược mail)

// - 42: CODE_NOT_FOUND_OR_EXPIRED (không tìm thấy mã reset pass or hết thời gian)

// - 44: STUDENT_NOT_FOUND (không tìm thấy học viên)

// - 46: CLASS_DUPLICATE (bạn đã đăng ký lớp học này)

// - 48: REGISTER_LEARN_NOT_FOUND (không tìm thấy học viên đăng ký)

// - 50: STUDENT_NOT_FOUND (khong có học viên)

// - 52: TRAINING_NOT_FOUND (Không tìm thấy đào tạo)

// - 54: SCHEDULE_TEACHER_DUPLICATE (Lịch giảng dạy bị trùng)

// - 56: TEACHER_DUPLICATE  (Giáo viên đang giảng dạy lớp này)

// - 58: FILE_NOT_FOUND (Không tìm thấy file)

// - 60: SCORE_CUMULATIVE_NOT_FOUND (Không tìm thấy thông tin điểm)

// - 62: DATA_STUDENT_NOT_FOUND (Không tìm thấy sinh viên)

// - 64: EMAIL_NOT_FOUND_REGISTER (Bạn chưa đăng ký tài khoản)

// - 66:  PASS_WORD_WRONG (Sai mật khẩu)

// - 68:  USER_NOT_FOUND (Không tìm thấy người dùng)

// - 70:  YOU_NOT_EARNED_ENOUGH_POINTS (Bạn chưa tích đủ điểm để đổi tiền)

// - 72:  DEBIT_NOT_FOUND (Không tìm thấy ví tiền)

// - 74:  SCORE_NOT_ENOUGH  (Điểm tích lũy không đủ)

// - 76: ENTER_THE_CORRECT_SCORE (Vui lòng nhập đúng số điểm)

// - 78: UPLOAD_IMAGE_FAIL (Upload ảnh thất bại)

// - 80: DIPLOMA_NOT_FOUND (Không tìm thấy chứng chỉ)

// - 82: PAYPAL_CREATE_WRONG (Yêu cầu thanh toán paypal không hợp lệ)

// - 84: PAYPAL_CREATE_WRONG (Thực hiện thanh toán không thành công. Vui lòng kiểm tra tài khoản thanh toán)

// - 86: CHECK_DISCOUNT_100_LOCAL (Bạn được giảm giá 100% vui lòng chọn phương thức thanh toán tại trung tâm)

// - 88: INVALID_SIGNATURE (Chữ ký không hợp lệ (thanh toán không thành công))

// - 90: MONEY_NOT_ENOUGH (Số tiền của bạn không đủ để gửi yêu cầu)

// - 92: PAY_NOT_FOUND (Không tìm thấy yêu cầu thanh toán tiền)

// - 94: PAY_NOT_ENOUGH (Số tiền trong ví không đủ để thực hiện yêu cầu)

// - 96: INFOR_COVID19_NOT_FOUND (Không tìm thấy thông tin dịch Covid-19)

// - 98: STATISTIC_EXCEL_NOT_FOUND (Không tìm thấy phần thống kê)

// - 102: INFOR_AGENT_CODE_NOT_FOUND (Không tìm thấy thông tin người giới thiệu)

// - 104: YOU_NOT_EARNED_ENOUGH_POINTS_TRANSFER_SCORE (Bạn chưa tích đủ số điểm)

// - 106: INFOR_PAY_NOT_FOUND (Không tìm thấy thông tin người gửi yêu cầu thanh toán)

// - 108: IMPORT_SCORE_ERROR (Import điểm học viên lỗi)


// ********************  SOCKET  ************************* //
// - GET_LIST_STUDENT_REGISTER: cập nhật lại list student register

// - GET_LIST_NOTI: cập nhật lại list thông báo noti cua client

// - RESET_CMS_PERMISSION: khi có thay đổi quyền load lại trang

// - GET_LIST_PAY_CMS: Cập nhật lại list thanh toán tiền

//- LOGOUT_ACCOUNT: Đăng xuất khi bị khóa tài khoản
