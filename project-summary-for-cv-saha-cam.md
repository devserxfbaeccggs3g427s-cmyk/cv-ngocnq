# SHB Mobile Banking Cambodia - Project Summary for CV

## 1. Tổng Quan Dự Án

**Tên dự án:** SHB Mobile Banking Cambodia / SHB SAHA CAM

**Mô tả:** Hệ thống Mobile Banking cho thị trường Cambodia, gồm các microservice backend phục vụ xác thực người dùng, quản lý thiết bị, OTP, tài khoản, người thụ hưởng, tra cứu giao dịch CASA, tạo/xác nhận lệnh chuyển tiền và tra cứu tỷ giá. Source hiện tại cũng có module frontend iBanking Cambodia legacy bằng ASP.NET WebForms để tham chiếu nghiệp vụ hiện hữu.

**Vai trò phù hợp CV:** Backend Developer / Java Developer - phân tích nghiệp vụ iBanking hiện hữu, thiết kế và implement REST APIs cho Mobile Banking, tích hợp Oracle Core/EBANK qua stored procedure, tích hợp liên service Identity/Account/Fund Transfer, xử lý JWT/Redis session/OTP/SMS, validation nghiệp vụ chuyển tiền, mapping response đa ngôn ngữ và viết tài liệu kỹ thuật.

**Quy mô source hiện tại:**
- 3 backend services Spring Boot: `shb-mobile-identity-service`, `shb-mobile-account-service`, `shb-mobile-fundtransfer-service`.
- Khoảng 339 Java source files trong `src/main/java` của 3 service.
- 3 test classes trong `src/test/java`.
- 13 controller/API interface chính cho Auth, Device, Password, OTP, System Variables, Accounts, Users, Banks, Beneficiaries, Transactions và Exchange Rates.
- Frontend/reference legacy `ibank-frontend-campuchia` với khoảng 235 file ASP.NET WebForms/C#/JavaScript.
- Dual Oracle datasource theo service: EBANK, Core và SMS User.
- Tích hợp Redis, JWT, Oracle stored procedures, TCP Core Banking, SMS/OTP và HTTP client giữa các service.

---

## 2. Tech Stack

| Layer | Công nghệ / Kỹ năng |
|-------|----------------------|
| Language | Java 17, C# ASP.NET WebForms legacy reference |
| Backend Framework | Spring Boot 3.5.x, Spring Web MVC |
| Security | Spring Security 6.x, stateless JWT Bearer, Redis-backed session, BCrypt, RSA password decrypt |
| Data Access | Spring Data JPA, Hibernate, JdbcTemplate, Oracle stored procedures, REF CURSOR mapping |
| Database | Oracle EBANK, Oracle Core Banking, Oracle SMS schema |
| Cache / Session | Redis, Lettuce, Spring Cache |
| Integration | RestTemplate/Apache HttpClient 5, Spring Integration TCP/IP, inter-service HTTP clients |
| Messaging / OTP | SMS OTP flow, database OTP transaction table, rate limit, lockout |
| Mapping / DTO | MapStruct 1.6.3, Lombok, custom request/response models |
| API Docs | Springdoc OpenAPI 2.8.8, Swagger UI |
| Observability | Log4j2/Logback config, Actuator, structured service logs |
| Build / Deploy | Maven, Dockerfile per service, environment-based configuration |
| i18n | Message bundles for English, Khmer and Vietnamese |

---

## 3. Kiến Trúc Hệ Thống

```text
Mobile App / iBanking Reference
    |
    v
API Gateway / Service Route
    |
    +--> Identity Service
    |       - Login / logout / refresh token / validate token
    |       - Device registration and trusted-device verification
    |       - OTP generation / verification / SMS delivery
    |       - Password policy, password history and system variables
    |       - Redis session store + Oracle EBANK/SMS
    |
    +--> Account Service
    |       - Validate JWT through Identity Service
    |       - Account list/detail/balance/receive-transfer accounts
    |       - User profile, bank list, beneficiary CRUD
    |       - Oracle Core + EBANK stored procedures, Redis cache
    |
    +--> Fund Transfer Service
            - Validate JWT through Identity Service
            - CASA transaction history/detail
            - Payment order create/validate/confirm
            - Self transfer and intra-bank transfer processors
            - OTP confirmation via Identity Service
            - Core posting via Oracle procedure and TCP/IP integration
```

## 4. Các Module Chính

### 4.1 Identity Service

- Implement login flow bằng Oracle stored procedure `GET_USER_CHANNEL_BY_CUSTID`, RSA password validation và audit login action.
- Quản lý JWT access token / refresh token bằng Nimbus JOSE JWT, session ID `sid`, device ID claim và issuer validation.
- Lưu session trong Redis, hỗ trợ sliding expiration và absolute session timeout.
- Validate điều kiện đăng nhập: individual customer, payroll account support, service package, default password, account lock và failed-login lockout.
- Quản lý trusted device: thiết bị mới/không trusted yêu cầu OTP, thiết bị blocked bị từ chối truy cập.
- Xây dựng OTP service lưu `TBL_EB_OTP_TRANSACTION`, kiểm tra OTP còn hiệu lực, resend, rate limit theo window, lock khi sai quá số lần và gửi SMS.
- Quản lý password change policy: độ dài, charset, history count, không trùng username/customer name, password expiration.
- Hỗ trợ system variables và localized error messages bằng `messages_en`, `messages_km`, `messages_vi`.

### 4.2 Account Service

- Bảo vệ API bằng JWT filter, validate token remote qua Identity Service và đẩy principal vào Spring Security context.
- Tra cứu danh sách tài khoản, chi tiết tài khoản, transfer account, receive account và balance bằng Oracle Core stored procedures.
- Lọc currency được hỗ trợ cho Mobile Cambodia, chủ yếu USD và KHR.
- Cập nhật default account, validate account type CASA và currency hợp lệ.
- Tra cứu user theo account number bằng Core procedure để phục vụ beneficiary và transfer validation.
- Quản lý danh bạ người thụ hưởng: list, add, update, delete, validate account, duplicate check.
- Quản lý bank list và cache Redis cho dữ liệu ngân hàng.
- Chuẩn hóa response contract theo `BaseApiResponse`, mapping DTO bằng MapStruct và localized error handling.

### 4.3 Fund Transfer Service

- Cung cấp API tra cứu lịch sử CASA transactions và transaction detail theo account, date range, ref no và transaction code.
- Tạo lệnh chuyển tiền qua `PaymentOrderService` và chọn processor bằng Strategy pattern:
  - `SelfTransferProcessor` cho chuyển tiền giữa tài khoản của cùng khách hàng.
  - `IntraTransferProcessor` cho chuyển tiền nội bộ SHB sang người thụ hưởng khác.
- Validate source/destination account qua Account Service, validate số dư, minimum amount, currency, tỷ giá và hạn mức nghiệp vụ.
- Tính toán amount/total amount/local amount theo tỷ giá qua `ExchangeRateService`, hỗ trợ currency conversion USD/KHR.
- Sinh OTP transaction khi tạo intra transfer và verify OTP khi confirm qua Identity Service.
- Lưu/init/update payment order bằng Oracle EBANK/Core procedure, cập nhật ref no, transaction date, module code và trạng thái thành công/thất bại.
- Tích hợp Core Banking posting qua `CoreClient`, Spring Integration TCP/IP và mapper cho finance posting / reversal.
- Xử lý timeout khi accounting, cập nhật trạng thái giao dịch và trả lỗi nghiệp vụ phù hợp.

### 4.4 Frontend / Legacy iBanking Reference

- Module `ibank-frontend-campuchia` là hệ thống ASP.NET WebForms/C# tham chiếu các luồng nghiệp vụ iBanking Cambodia.
- Bao gồm màn hình login, account/saving/lending/debit card, transfer self/intra/interbank, beneficiary maintenance, standing order, topup/postpaid, batch transaction, statement/report và Crystal Reports.
- Có các JavaScript helper cho form validation, calendar, currency format, password strength, MD5 và virtual keyboard.
- Source này có giá trị để đối chiếu nghiệp vụ, procedure, message và hành vi màn hình khi migrate/implement Mobile API.

---

## 5. Chức Năng Đã Triển Khai

### Authentication / Session / Device

- Login/logout/refresh-token/validate-token cho mobile app.
- JWT token có session state và device binding.
- Redis session validation, sliding TTL, absolute timeout và session invalidation.
- Failed login counter, lock duration và audit login fail.
- Trusted device registration/verification với OTP.

### OTP / SMS

- Generate OTP cho login device verification và transfer confirmation.
- Verify OTP theo transaction ID, attempt count, expiry và lock window.
- Rate limit OTP resend theo mobile number, transaction type và configurable window.
- Mask phone number/OTP trong response/log, có flag include OTP cho môi trường test.

### Account / Profile / Beneficiary

- Tra cứu danh sách tài khoản, chi tiết tài khoản, tài khoản chuyển, tài khoản nhận và balance.
- Tra cứu user profile và customer/account name.
- Danh sách ngân hàng và cache Redis.
- Thêm/sửa/xóa/validate người thụ hưởng, duplicate beneficiary check.
- Cập nhật default account với validate CASA/currency.

### Transaction / Transfer

- Tra cứu lịch sử giao dịch CASA và chi tiết giao dịch.
- Validate payment order trước khi tạo lệnh.
- Tạo payment order, return transaction ID, auth method, fee, status và OTP metadata.
- Confirm payment order bằng OTP và accounting vào Core.
- Hỗ trợ self transfer không OTP và intra transfer có SMS OTP.
- Mapping trạng thái WAIT/SUCCESS/FAILED, ref no, transaction date và module code.

### Exchange Rate / Multi Currency

- Tra cứu tỷ giá và tính amount theo source currency, target currency và transaction currency.
- Hỗ trợ chuyển đổi USD/KHR, amount real, amount local và total amount.
- Validate same-currency/multi-currency account scenarios qua Account Service/Core procedure.

---

## 6. Backend / System Design Skills Có Thể Đưa Vào CV

### Java Backend Development

- Phát triển microservices bằng Java 17, Spring Boot 3, Spring Web MVC và Maven.
- Thiết kế REST API theo layered architecture: controller/API interface, service, processor, repository, mapper, DTO.
- Sử dụng MapStruct/Lombok để chuẩn hóa mapping và giảm boilerplate.
- Xây dựng centralized exception handling, business error code và localized message response.
- Sử dụng Bean Validation và custom validation cho request banking/payment.

### Security Engineering

- Implement stateless JWT authentication với Spring Security filter chain.
- Quản lý Redis-backed session, refresh token, token validation, sliding expiration và absolute timeout.
- Xử lý RSA-encrypted password payload và BCrypt password policy.
- Thiết kế trusted-device flow, device verification và device blocking.
- Implement login lockout, OTP lockout, rate limiting và audit action.

### Banking Integration

- Tích hợp Oracle Core Banking/EBANK bằng stored procedure, schema package, REF CURSOR và JDBC parameter mapping.
- Tích hợp Core posting qua TCP/IP bằng Spring Integration.
- Tích hợp liên service Identity, Account và Fund Transfer bằng HTTP client, header forwarding và token validation.
- Xử lý nghiệp vụ Mobile Banking: account inquiry, beneficiary, CASA history, transfer order, OTP confirmation, exchange rate và accounting.
- Xử lý currency USD/KHR, amount rounding, total amount, local currency amount và limit validation.

### Reliability / Operations

- Config theo environment variables cho datasource, Redis, JWT, service URL và timeout.
- Actuator endpoints cho health/operation.
- Graceful shutdown trong các service quan trọng.
- Log theo từng bước nghiệp vụ để trace login, OTP, transfer và core integration.
- Xử lý timeout khi accounting và cập nhật trạng thái giao dịch khi lỗi tích hợp.

### Code Quality / Architecture

- Áp dụng Strategy pattern cho payment processor provider, để mở rộng transfer type mới.
- Tách client, service, repository, mapper và model theo domain module.
- Sử dụng reusable `JdbcCallStoreExecutor`/helpers để gọi stored procedure nhất quán.
- Chuẩn hóa i18n và error message trong 3 ngôn ngữ: English, Khmer, Vietnamese.
- Tài liệu hóa README/API/config cho từng service.

---

## 7. Bullet Points Ngắn Gọn Cho CV

- Developed Java 17/Spring Boot microservices for SHB Mobile Banking Cambodia, covering authentication, device management, OTP, account inquiry, beneficiary management, CASA transaction history and fund transfer.
- Implemented stateless JWT security with Redis-backed sessions, refresh tokens, device binding, sliding expiration, login lockout and remote token validation across services.
- Built OTP/SMS flows for trusted-device verification and transfer confirmation, including expiry, retry attempts, resend rate limit, lockout and masked sensitive data.
- Integrated Oracle Core Banking and EBANK systems using JdbcTemplate, stored procedures, REF CURSOR mapping and reusable procedure execution helpers.
- Designed fund transfer processing with Strategy pattern for self-transfer and intra-bank transfer, including account validation, FX calculation, OTP confirmation and Core accounting via TCP/IP.
- Implemented account, bank and beneficiary APIs with Redis caching, multi-language error messages and MapStruct-based DTO mapping.
- Analyzed legacy ASP.NET WebForms iBanking Cambodia source to align Mobile API behavior with existing banking workflows.

