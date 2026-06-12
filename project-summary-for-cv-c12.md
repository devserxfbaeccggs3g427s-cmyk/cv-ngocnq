# GOV Payment Service - Project Summary for CV

## 1. Tổng Quan Dự Án

**Tên dự án:** GOV Payment Service / Payment Gateway cho Dịch vụ công

**Mô tả:** Backend service trung gian xử lý thanh toán giữa Hệ thống Quản lý Thanh toán Trực tuyến (TTTT) của Cổng Dịch vụ Công Quốc gia và ngân hàng SHB. Service tiếp nhận yêu cầu thanh toán, tạo giao dịch, tạo tài khoản alias, sinh VietQR/Napas QR, truy vấn trạng thái, tra cứu biên lai, vấn tin tài khoản, hoàn tiền, chi hộ, đối soát giao dịch và retry failed Kafka messages.

**Vai trò:** Backend Developer - phân tích BRD/API spec, thiết kế service layer, implement REST APIs, tích hợp ESB/Core Banking/Napas/Ebank/Signature Service/Kafka/Oracle, refactor kiến trúc, viết unit test và tài liệu kỹ thuật.

**Thời gian:** 2026

**Quy mô source hiện tại:**
- 153 Java source files trong `src/main/java`.
- 23 test classes trong `src/test/java`.
- 4 controller chính: `PaymentController`, `ReconciliationController`, `InternalRetryController`, `QrTestController`.
- 8 public payment/reconciliation APIs theo spec TTTT: 3.1, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8 và 3.9.
- 4 internal retry APIs cho vận hành failed Kafka messages.
- 6 entity/repository chính trong snapshot hiện tại: transaction, receipt, refund, disbursement, failed message và API log.
- 5 typed configuration property groups: ESB, Bank, Alias, QR, Signature.
- Tích hợp Oracle DB, Oracle Core Banking schema, ESB SHB, Napas, Ebank, Signature Service và Kafka.

---

## 2. Tech Stack

| Layer | Công nghệ / Kỹ năng |
|-------|----------------------|
| Language | Java 17 |
| Framework | Spring Boot 3.5.7, Spring Web MVC |
| Build | Maven |
| Database | Oracle, Oracle JDBC `ojdbc11`, HikariCP |
| Data Access | Spring Data JPA, Hibernate, JdbcTemplate |
| Validation | Jakarta Bean Validation, custom validators |
| API Docs | SpringDoc OpenAPI 2.8.6, Swagger UI |
| Integration | RestTemplate, ESB REST APIs, JWT authentication, ESB service headers |
| Messaging / Retry | Spring Kafka producer, retry table, internal retry APIs |
| QR | ZXing 3.5.4, Napas EMVCo/VietQR TLV encoder, CRC checksum |
| Security | ESB signature, Signature Service forwarding, request/response signing header, data masking |
| Observability | SLF4J, Logback, AOP API logging, MDC request tracing, Actuator health/info |
| Testing | JUnit 5, Mockito, Spring Boot Test |
| Utilities | Lombok, Jackson, Base64, custom checksum/signature utilities |

---

## 3. Kiến Trúc Hệ Thống

### 3.1 High-Level Flow

```text
TTTT / Internal Ops
    |
    v
PaymentController / ReconciliationController / InternalRetryController
    |
    v
PaymentService facade / ReconciliationService / FailedMessageService
    |
    +-- CreatePaymentUseCase
    +-- TransactionQueryUseCase
    +-- ReceiptUseCase
    +-- BankAccountUseCase
    +-- RefundUseCase
    +-- DisbursementUseCase
    |
    +-- TransferService strategies
    |       +-- InternalTransferServiceImpl
    |       +-- NapasTransferServiceImpl
    |       +-- CitadTransferServiceImpl
    |
    +-- EsbClient / EsbTokenManager / SignatureClient / Repositories
            |
            v
Oracle DB, Oracle Core Banking schema, ESB, Napas, Ebank, Kafka, Signature Service
```

### 3.2 Design Patterns / Engineering Practices

| Pattern / Practice | Áp dụng trong dự án |
|--------------------|---------------------|
| Facade | `PaymentServiceImpl` là thin facade, delegate sang các use case service. |
| Interface Segregation | Tách interface theo use case: create payment, query transaction, receipt, refund, disbursement, bank inquiry. |
| Strategy | Route chuyển tiền qua `TransferService`: nội bộ SHB, Napas, Citad/Kho bạc. |
| Template Method | `AbstractTransferService` chứa logic chung cho financial posting, reversal, amount format và ESB request. |
| Repository | Spring Data JPA repositories cho transaction, receipt, refund, disbursement, failed message và API log. |
| AOP | `ApiLogAspect` ghi log request/response cho endpoint business. |
| Servlet Filter | `MdcFilter`, `RequestBodyCachingFilter`, `OutgoingSignatureFilter`. |
| Configuration Properties | Gom cấu hình ESB, Bank, Alias, QR, Signature vào typed properties. |
| Defensive Integration | Token cache/refresh, retry khi token lỗi, timeout handling, reversal flow và masking sensitive data. |

---

## 4. Chức Năng Chính Đã Phát Triển

### 4.1 API 3.1 - Tạo giao dịch và sinh QR

- Validate partner code, dữ liệu bắt buộc, dữ liệu biên lai, danh sách khoản nộp và thời gian hiệu lực.
- Đảm bảo idempotency bằng `x-request-id`, chặn duplicate bill đang active hoặc đã thanh toán.
- Sinh tài khoản alias theo ngày + Oracle sequence, check unique trước khi sử dụng.
- Gọi ESB tạo alias account với JWT token và service header signature.
- Sinh QR theo chuẩn Napas EMVCo/VietQR, TLV tags, amount, currency, additional data và CRC.
- Lưu đầy đủ metadata giao dịch, thông tin người nộp, biên lai và QR string vào Oracle.

### 4.2 API 3.3 - Kiểm tra trạng thái giao dịch

- Tra cứu giao dịch mới nhất theo mã hóa đơn.
- Map internal status sang response code của TTTT.
- Trả flat JSON contract đúng spec, không dùng envelope response.

### 4.3 API 3.4 - Lấy biên lai điện tử

- Tra cứu biên lai theo mã tham chiếu / mã giao dịch.
- Xử lý các case giao dịch không tồn tại, chưa thanh toán, chưa có biên lai.
- Tách `GovReceipt` entity/repository để quản lý thông tin biên lai và URL biên lai.

### 4.4 API 3.5 - Vấn tin tài khoản ngân hàng

- Route theo mã ngân hàng:
  - SHB nội bộ: query Oracle Core Banking tables bằng `JdbcTemplate`.
  - Ngân hàng ngoài: gọi ESB Napas inquiry và ESB Ebank getinfo.
- Map trạng thái tài khoản từ `rec_st`, `inact_st`, `fin_st`.
- Chuẩn hóa tên chủ tài khoản, tên ngân hàng, mã tiền tệ và response code.

### 4.5 API 3.6 - Hoàn tiền

- Validate giao dịch gốc đã PAID, số tiền hoàn và tổng tiền đã hoàn.
- Lưu `RefundTrans` để tracking request, ref no, trạng thái và lỗi tích hợp.
- Route hoàn tiền SHB nội bộ qua financial posting, ngân hàng ngoài qua Napas transfer.
- Cập nhật receipt inactive khi hoàn tiền thành công.
- Map kết quả transfer thành SUCCESS/PENDING/FAILED và response TTTT.

### 4.6 API 3.7 - Lấy thông tin tài khoản thanh toán

- Hỗ trợ tìm theo `MaHoaDon`, `MaGiaoDich` hoặc cả hai.
- Chỉ trả thông tin khi giao dịch đã thanh toán.
- Resolve tên ngân hàng từ config SHB hoặc ESB bank info.

### 4.7 API 3.8 - Chi hộ

- Validate partner, currency, service code, beneficiary info, payment channel và duplicate `MaGiaoDichTTTT`.
- Lưu `DisbursementTrans` cho chi hộ thông thường hoặc `RefundTrans` khi có giao dịch gốc liên quan.
- Route transfer theo 3 kênh:
  - SHB nội bộ: financial posting.
  - Napas: inquiry + financial posting + Napas create.
  - Citad/Kho bạc: Domxfer.
- Cập nhật ref no, transaction time và status SUCCESS/PENDING/FAILED.

### 4.8 API 3.9 - Đối soát giao dịch

- Controller và service endpoint cho quy trình đối soát TTTT/DVTT.
- Type 1: tổng hợp giao dịch từ DB/Core Banking, build file đối soát pipe-delimited và encode Base64.
- Type 2: nhận file phản hồi, decode Base64, parse data lines và map kết quả cân khớp.
- Validate ngày đối soát, loại yêu cầu, loại file, mã dịch vụ, kênh thanh toán và tên file phản hồi.
- Ghi chú source snapshot: service hiện tại vẫn tham chiếu một số class đối soát đang bị xóa trong working tree (`LoaiGiaoDich`, `ResultsReconciliation`, `ResultsReconciliationRepository`), cần restore hoặc refactor trước khi compile.

### 4.9 Internal Retry APIs

- Quản lý failed Kafka messages theo status: PENDING, RETRYING, RESOLVED, DEAD.
- Retry tất cả message đến hạn hoặc retry theo `refNo`.
- Republish raw payload về Kafka topic gốc bằng `KafkaTemplate`.
- Cung cấp danh sách failed messages và summary dashboard theo status, error category, resolved today.

---

## 5. Backend / System Design Skills

### 5.1 Backend Development

- Thiết kế RESTful APIs bằng Java 17, Spring Boot 3 và Spring Web MVC.
- Implement DTO request/response theo flat JSON contract của đối tác.
- Sử dụng Jakarta Bean Validation và custom validators cho conditional mandatory fields.
- Xây dựng centralized error handling bằng `GlobalExceptionHandler`, `BusinessException`, `BusinessErrorCode` và `ErrorResponseFactory`.
- Quản lý transaction database bằng Spring `@Transactional`.
- Sử dụng Lombok Builder/Data pattern để giảm boilerplate DTO/entity.
- Xử lý ngày giờ, currency, amount, transaction status và response code mapping trong domain tài chính.

### 5.2 Banking / Payment Integration

- Tích hợp ESB/Core Banking REST APIs với JWT authentication và service header signing.
- Gọi các nghiệp vụ banking: alias account creation, customer inquiry, financial posting, reversal, Napas inquiry/create, Domxfer/Citad.
- Implement VietQR/Napas EMVCo QR generation với TLV encoding và CRC checksum.
- Thiết kế idempotency cho thanh toán bằng request ID, duplicate bill detection và unique alias account.
- Xử lý payment lifecycle: create, paid status query, receipt, refund, disbursement và reconciliation.
- Làm việc với domain Payment Gateway, FinTech, Government Services, Core Banking, Napas và Citad/Kho bạc.

### 5.3 Database / Data Engineering

- Modeling entity cho transaction, receipt, refund, disbursement, failed message và API log.
- Sử dụng Spring Data JPA cho CRUD/query repository và derived query.
- Sử dụng `JdbcTemplate` cho SQL phức tạp và join Oracle Core Banking schema.
- Viết SQL migration scripts cho transaction, refund, disbursement, failed message, receipt URL và app config.
- Xử lý Base64 file content, pipe-delimited file parsing/building và file naming theo ngày đối soát.

### 5.4 Security / Reliability

- Quản lý JWT token ESB bằng in-memory cache, refresh buffer và thread-safe `ReentrantLock`.
- Retry ESB call một lần khi gặp token expired / unauthorized.
- Tính ESB signature cho alias account, financial posting và reversal.
- Forward request body sang Signature Service để ký response header `x-request-signature`.
- Mask dữ liệu nhạy cảm trước khi lưu API log.
- Tách config nhạy cảm ra environment variables.
- Sử dụng reversal flow để giảm rủi ro giao dịch bị lỗi giữa các bước hạch toán.

### 5.5 Observability / Operations

- AOP-based API logging cho request/response, status code, error code và duration.
- `REQUIRES_NEW` transaction cho log để không rollback theo business transaction.
- MDC correlation ID / request ID để trace log end-to-end.
- RestTemplate logging interceptor cho outbound ESB calls.
- Spring Boot Actuator health/info và health probes.
- Internal APIs để retry failed Kafka messages và xem dashboard summary.

### 5.6 Code Quality / Architecture

- Refactor `PaymentService` thành facade + use case services để giảm god class.
- Áp dụng SOLID: Single Responsibility, Interface Segregation, Dependency Inversion và Open/Closed cho transfer channel.
- Tách transfer logic chung vào `AbstractTransferService`.
- Gom constants/status/error messages thành enum và single source of truth.
- Tăng testability bằng interface-driven design, repository abstraction và Mockito-friendly dependencies.
- Viết unit tests cho controller, service, transfer strategy, utility, exception handler và token manager.

### 5.7 Documentation / Delivery

- Viết tài liệu API markdown cho create payment, check status, receipt, bank inquiry, refund, get payment account, disbursement và reconciliation.
- Lập tài liệu environment variables và project summary cho handover/CV.
- Chuyển BRD thành implementation flow, validation rules và test cases.
- Làm việc theo workflow doc-driven: spec -> design -> implementation -> unit test -> review.

---

## 6. Thách Thức Kỹ Thuật Và Cách Giải Quyết

| Thách thức | Giải pháp |
|------------|-----------|
| Conditional validation phức tạp theo từng mã dịch vụ | Custom Bean Validators cho `ThongTinBienLai`, `DanhSachKhoanNop`, `AtLeastOneField`. |
| Payment service có nguy cơ thành god class | Tách thành thin facade + use case service interfaces. |
| Nhiều kênh chuyển tiền có logic chung nhưng request khác nhau | Strategy + Template Method qua `TransferService` và `AbstractTransferService`. |
| ESB token hết hạn giữa request | `EsbTokenManager` cache token, refresh trước expiry và retry khi token lỗi. |
| Tạo alias account không trùng | Oracle sequence + retry loop + unique DB constraint. |
| QR phải đúng chuẩn Napas EMVCo | Custom TLV encoder, CRC-16 và configurable bank/currency metadata. |
| Response lỗi khác nhau theo API | `ErrorResponseFactory` map đúng DTO response cho từng endpoint. |
| Cần log cả request/response nhưng không ảnh hưởng business | AOP logging + `REQUIRES_NEW` transaction + swallow log errors. |
| Query tài khoản SHB và ngân hàng ngoài có flow khác nhau | Routing theo mã ngân hàng: Oracle Core Banking vs ESB Napas/Ebank. |
| Retry message lỗi không làm mất raw payload | Lưu failed message vào DB, republish Kafka topic gốc qua internal API. |
| Config rải rác, khó vận hành | Gom vào typed `@ConfigurationProperties` và environment variables. |

---

## 7. Thành Tựu / Impact

- Hoàn thiện backend payment gateway cho luồng thanh toán dịch vụ công: tạo QR, check status, receipt, bank inquiry, refund, get payment account, disbursement và reconciliation.
- Tích hợp nhiều hệ thống banking thực tế: ESB SHB, Core Banking Oracle schema, Napas, Ebank, Kafka và Signature Service.
- Xây dựng luồng VietQR/Napas QR với alias account generation, idempotency và duplicate prevention.
- Xây dựng luồng hoàn tiền/chi hộ đa kênh với transfer strategy, financial posting, Napas, Domxfer và reversal.
- Cải thiện maintainability bằng facade/use-case decomposition, transfer strategy và typed configuration.
- Tăng observability và vận hành với AOP API logging, MDC tracing, RestTemplate interceptor, Actuator và internal retry APIs.
- Tạo bộ tài liệu kỹ thuật trong `DOC/` để phục vụ handover, review và CV.

---

## 8. Bullet Points Sẵn Sàng Đưa Vào CV

- Designed and developed a Java 17/Spring Boot 3 payment gateway integrating Vietnam public service payment flows with SHB Core Banking, ESB, Napas, Ebank, Kafka and Oracle systems.
- Implemented REST APIs for payment creation, VietQR generation, transaction status inquiry, e-receipt retrieval, bank account inquiry, refund, disbursement and reconciliation.
- Built Napas EMVCo/VietQR generation with TLV encoding, CRC checksum, configurable bank/currency metadata and Oracle-backed alias account generation.
- Integrated ESB banking APIs with JWT token caching, signed service headers, retry-on-auth-failure and reversal flows for reliable financial posting.
- Refactored a monolithic payment service into a facade plus use-case services, applying SOLID, Strategy, Template Method and interface-driven design.
- Implemented multi-channel transfer flows for internal SHB accounts, Napas interbank transfers and Citad/Kho bạc Domxfer payments.
- Developed operational retry APIs for failed Kafka messages, including retry by reference number, bulk retry, status tracking and dashboard summary.
- Added centralized exception handling, custom Bean Validation, AOP API logging, MDC tracing, request/response masking and Actuator health endpoints.
- Wrote unit tests with JUnit 5 and Mockito across controllers, services, transfer strategies, utilities, token manager and exception handling.

---

## 9. Keywords Cho CV / ATS

**Technical Keywords:** Java 17, Spring Boot 3, Spring Web MVC, REST API, Oracle Database, Spring Data JPA, Hibernate, JdbcTemplate, Maven, Jakarta Bean Validation, Custom Validators, Spring AOP, Logback, SLF4J, MDC, Spring Kafka, KafkaTemplate, Spring Boot Actuator, SpringDoc OpenAPI, Swagger UI, Lombok, Jackson, JUnit 5, Mockito, SQL Migration, Configuration Properties.

**Architecture Keywords:** Layered Architecture, Facade Pattern, Strategy Pattern, Template Method, Repository Pattern, Interface Segregation, Dependency Injection, SOLID, Clean Code, Refactoring, Error Handling, Idempotency, Observability.

**Integration Keywords:** ESB Integration, Core Banking Integration, Napas Integration, Ebank Integration, JWT Authentication, Digital Signature, HMAC/SHA-256, RestTemplate, Token Refresh, Retry Pattern, Reversal Transaction, External API Integration, Kafka Republish.

**Domain Keywords:** Payment Gateway, VietQR, Napas EMVCo, Government Services, Public Service Payment, FinTech, Banking, Core Banking, Transaction Processing, Refund, Disbursement, Reconciliation, Settlement, Account Inquiry, E-Receipt, Citad, Kho bạc, Oracle Core Banking.

**Soft Skills Keywords:** System Design, Backend Development, API Design, Technical Documentation, Requirement Analysis, Problem Solving, Production Support, Code Review, Refactoring, Cross-system Integration, Banking Domain Analysis.

---

## 10. Review Notes

- File này được cập nhật dựa trên source snapshot hiện tại của `gov-payment-service`.
- Không thể chạy `mvn test` trên máy hiện tại vì command `mvn` không tồn tại trong shell.
- Working tree đang có các file bị xóa và untracked files. Riêng flow đối soát đang tham chiếu một số class/repository bị xóa trong working tree, cần xử lý trước khi build/release.
