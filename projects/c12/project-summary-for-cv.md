# GOV Payment Service - Project Summary & Skills for CV

## 1. Tong Quan Du An

**Ten du an:** GOV Payment Service / Payment Gateway cho Dich vu cong

**Mo ta:** Backend service trung gian xu ly thanh toan giua He thong Quan ly Thanh toan Truc tuyen (TTTT) cua Cong Dich vu Cong Quoc gia va ngan hang SHB. He thong tao giao dich, sinh VietQR theo chuan Napas EMVCo, truy van trang thai, lay bien lai, van tin tai khoan, hoan tien, chi ho va doi soat giao dich.

**Vai tro:** Backend Developer - thiet ke kien truc service, phat trien REST API, tich hop ESB/Core Banking/Napas/Ebank, xu ly database Oracle, refactor code, viet unit test va tai lieu ky thuat.

**Thoi gian:** 2026

**Quy mo hien tai:**
- 9 API chinh theo dac ta TTTT: 3.1, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9 va internal retry APIs.
- 156 Java source files trong `src/main/java`.
- 22 test classes trong `src/test/java`.
- 6 `@ConfigurationProperties` classes: ESB, Bank, Alias, QR, Signature, Reconciliation.
- 8 JPA repositories, nhieu entity nghiep vu: transaction, receipt, refund, disbursement, failed message, reconciliation result, API log.
- Tich hop cac he thong ben ngoai: TTTT, ESB/Core Banking, Napas, Ebank, Oracle Core Banking schema, Signature Service, Kafka retry topic.

---

## 2. Tech Stack

| Layer | Cong nghe / Ky nang |
|-------|----------------------|
| Language | Java 17 |
| Framework | Spring Boot 3.5.7, Spring Web MVC |
| Build | Maven |
| Database | Oracle, Oracle JDBC `ojdbc11` |
| ORM / Data Access | Spring Data JPA, Hibernate, JdbcTemplate |
| Migration | SQL migration scripts under `src/main/resources/db/migration` |
| Validation | Jakarta Bean Validation, custom annotation validators |
| API Docs | SpringDoc OpenAPI 2.8.6, Swagger UI |
| Integration | RestTemplate, ESB REST APIs, JWT authentication, ESB service headers |
| Messaging / Retry | Spring Kafka producer, failed-message retry table, internal retry APIs |
| QR | ZXing 3.5.4, custom Napas EMVCo / VietQR encoder, CRC checksum |
| Security | HMAC/SHA-256 style ESB signature, outgoing signature service, request validation, data masking |
| Logging / Observability | SLF4J, Logback, AOP API logging, MDC correlation ID, Spring Boot Actuator health/info |
| Testing | JUnit 5, Mockito, Spring Boot Test |
| Utilities | Lombok, Jackson ObjectMapper, Base64, checksum utilities |

---

## 3. Kien Truc He Thong

### 3.1 Layered Architecture + Facade + Use Case Services

```text
Client / TTTT
    |
    v
PaymentController / ReconciliationController / InternalRetryController
    |
    v
PaymentService Facade / ReconciliationService / FailedMessageService
    |
    +-- CreatePaymentUseCase          -> CreatePaymentServiceImpl
    +-- TransactionQueryUseCase       -> TransactionQueryServiceImpl
    +-- ReceiptUseCase                -> ReceiptServiceImpl
    +-- BankAccountUseCase            -> BankAccountServiceImpl
    +-- RefundUseCase                 -> RefundServiceImpl
    +-- DisbursementUseCase           -> DisbursementServiceImpl
    +-- ReconciliationService         -> ReconciliationServiceImpl
    |
    +-- TransferService Strategy
    |       +-- InternalTransferServiceImpl
    |       +-- NapasTransferServiceImpl
    |       +-- CitadTransferServiceImpl
    |
    +-- EsbClient / EsbTokenManager / SignatureClient / Repositories
            |
            v
ESB, Core Banking, Napas, Ebank, Oracle DB, Kafka, Signature Service
```

### 3.2 Design Patterns / Engineering Practices

| Pattern / Practice | Ap dung trong du an |
|--------------------|---------------------|
| Facade | `PaymentServiceImpl` lam thin facade, delegate sang cac use case service. |
| Interface Segregation | Tach interface theo use case: create payment, query transaction, receipt, refund, disbursement, bank inquiry. |
| Strategy | Chon kenh transfer qua `TransferService`: noi bo SHB, Napas lien ngan hang, Citad/Kho bac. |
| Template Method | `AbstractTransferService` chua logic chung cho hach toan, reversal, build ESB request. |
| Abstract Factory | `EsbServiceHeaderFactory` tao service header nhat quan cho ESB calls. |
| Repository | Spring Data JPA repositories cho transaction, receipt, refund, disbursement, reconciliation, failed message, logs. |
| AOP | `ApiLogAspect` log request/response cho API business. |
| Filter Chain | `MdcFilter`, `OutgoingSignatureFilter`, cached request body. |
| Configuration Properties | Tap trung config qua typed properties thay vi rai rac `@Value`. |
| Defensive Integration | Token refresh, retry, reversal khi loi, fallback mapping, masking sensitive data. |

---

## 4. Chuc Nang Chinh Da Phat Trien

### 4.1 API 3.1 - Tao giao dich va sinh QR

**Muc tieu:** Nhan yeu cau thanh toan tu TTTT, tao tai khoan alias tren Core Banking va sinh VietQR.

**Ky nang / logic da ap dung:**
- Validate doi tac, du lieu bat buoc, format ngay gio, danh sach khoan nop va thong tin bien lai.
- Xu ly idempotency bang `x-request-id` va duplicate bill detection.
- Tao alias account unique bang Oracle sequence va retry loop.
- Goi ESB tao tai khoan alias voi JWT token va ESB signature.
- Sinh QR Napas EMVCo theo TLV tags, amount, currency, additional data va CRC-16.
- Luu transaction vao Oracle voi day du metadata thanh toan.

### 4.2 API 3.3 - Kiem tra trang thai giao dich

**Muc tieu:** TTTT truy van trang thai thanh toan theo ma hoa don / giao dich.

**Ky nang / logic da ap dung:**
- Query ban ghi moi nhat, mapping internal status sang response code cua TTTT.
- Fallback du lieu thanh toan tu Core Banking/IPN khi co nhieu nguon.
- Dam bao response flat JSON dung spec, khong envelope wrapper.

### 4.3 API 3.4 - Lay bien lai dien tu

**Muc tieu:** Tra ve thong tin bien lai hoac URL bien lai sau khi giao dich thanh cong.

**Ky nang / logic da ap dung:**
- Query receipt theo ma giao dich/ma hoa don.
- Xu ly truong hop chua co bien lai, giao dich khong ton tai hoac chua thanh toan.
- Tach entity `GovReceipt` va repository rieng de quan ly du lieu bien lai.

### 4.4 API 3.5 - Van tin tai khoan ngan hang

**Muc tieu:** Xac thuc tai khoan thu huong truoc khi chi ho/hoan tien.

**Ky nang / logic da ap dung:**
- Routing theo ma ngan hang:
  - SHB noi bo: query Oracle Core Banking tables bang `JdbcTemplate`.
  - Ngan hang khac: goi ESB Napas inquiry va ESB Ebank getinfo.
- Mapping trang thai tai khoan tu cac truong Core Banking: financial status, record status, inactive status.
- Chuan hoa ten ngan hang, ten chu tai khoan va error code tra ve.

### 4.5 API 3.6 - Hoan tien

**Muc tieu:** Xu ly hoan tien toan phan/mot phan dua tren giao dich goc da thanh toan.

**Ky nang / logic da ap dung:**
- Validate giao dich goc, so tien hoan, trang thai va duplicate refund.
- Luu `RefundTrans` de theo doi vong doi hoan tien.
- Thuc hien transfer theo kenh phu hop va reversal khi can.
- Chuan hoa status qua `TransferStatus`, error message va response mapping.

### 4.6 API 3.7 - Lay thong tin tai khoan thanh toan

**Muc tieu:** Lay thong tin tai khoan nguoi da thanh toan theo ma hoa don/ma giao dich.

**Ky nang / logic da ap dung:**
- Flexible search theo `MaHoaDon`, `MaGiaoDich` hoac ca hai.
- Chi tra ket qua khi giao dich da thanh toan.
- Resolve ten ngan hang tu SHB config hoac ESB getinfo.

### 4.7 API 3.8 - Chi ho

**Muc tieu:** DVTT thuc hien chuyen tien/chi tra den tai khoan thu huong.

**Ky nang / logic da ap dung:**
- Validate nguoi chi, nguoi huong, so tien, ma dich vu, kenh thanh toan.
- Luu `DisbursementTrans` de tracking request, ref no, status va loi tich hop.
- Route transfer qua 3 implementation: SHB noi bo, Napas, Citad/Kho bac.
- Xu ly hach toan/reversal qua ESB `financialposting`, `napasacqv2`, `domxfer`.

### 4.8 API 3.9 - Doi soat giao dich

**Muc tieu:** Ho tro quy trinh doi soat giua TTTT va DVTT.

**Ky nang / logic da ap dung:**
- Type 1: tong hop giao dich tu DB va Core Banking, build file doi soat 22 cot pipe-delimited.
- Type 2: nhan file phan hoi can khop, decode Base64, parse tung dong va luu `RESULTS_RECONCILIATION`.
- Query rieng cho thu ho, chi ho va refund; join voi Core Banking schema de lay ngay hach toan.
- Build ten file theo ngay doi soat, ma dich vu, loai giao dich, kenh thanh toan.
- Tinh summary line gom so luong, tong tien va checksum.
- Xu ly validation ngay doi soat, loai yeu cau, loai file, kenh thanh toan va truong hop khong co giao dich.

### 4.9 Internal Retry APIs

**Muc tieu:** Ho tro van hanh retry cac failed Kafka messages.

**Ky nang / logic da ap dung:**
- Quan ly `FailedMessage` theo status: PENDING, RETRYING, RESOLVED, DEAD.
- Retry tat ca message den han hoac retry theo `refNo`.
- Republish raw payload ve Kafka topic goc bang `KafkaTemplate`.
- Cung cap dashboard summary theo status, error category va resolved today.

---

## 5. Ky Nang Backend / System Design Co The Dua Vao CV

### 5.1 Backend Development

- Thiet ke va phat trien RESTful APIs bang Java 17, Spring Boot 3, Spring Web MVC.
- Implement request/response DTOs theo spec doi tac voi flat JSON contract.
- Su dung Jakarta Bean Validation va custom validators cho conditional mandatory fields.
- Xay dung centralized error handling bang `GlobalExceptionHandler`, `BusinessException`, `BusinessErrorCode` va `ErrorResponseFactory`.
- Quan ly transaction database bang Spring `@Transactional`.
- Su dung Lombok Builder/Data pattern de giam boilerplate DTO/entity.
- Xu ly ngay gio, currency, amount, status mapping va response code mapping theo nghiep vu tai chinh.

### 5.2 Banking / Payment Integration

- Tich hop ESB/Core Banking REST APIs voi JWT authentication va service header signing.
- Goi cac nghiep vu banking: tao alias account, customer inquiry, financial posting, reversal, Napas inquiry/create, Domxfer/Citad.
- Implement VietQR/Napas EMVCo QR generation, TLV encoding va CRC checksum.
- Thiet ke idempotency cho thanh toan bang request ID, duplicate bill detection va unique constraints.
- Xu ly hoan tien, chi ho, hach toan, reversal va doi soat giao dich.
- Lam viec voi domain Payment Gateway, FinTech, Government Services, Core Banking, Napas, Citad/Kho bac.

### 5.3 Database / Data Engineering

- Modeling entity cho transaction, receipt, refund, disbursement, failed message, API log va reconciliation result.
- Su dung Spring Data JPA cho CRUD/query repository.
- Su dung JdbcTemplate cho SQL phuc tap va join voi Oracle Core Banking schema.
- Viet SQL migration scripts cho tao bang, sequence, rollback va cap nhat schema.
- Thiet ke query doi soat theo ngay hach toan, ma dich vu, loai giao dich va kenh thanh toan.
- Xu ly Base64 file content, pipe-delimited file parsing/building, checksum va duplicate row detection.

### 5.4 Security / Reliability

- Verify/forward digital signature qua Signature Service va outgoing signature filter.
- Quan ly JWT token ESB, refresh truoc khi het han va retry khi token loi.
- Masking du lieu nhay cam trong log.
- Tach config nhay cam ra environment variables.
- Implement retry mechanism cho failed Kafka messages va internal operation APIs.
- Su dung reversal flow de han che rui ro giao dich banking loi giua chung.

### 5.5 Observability / Operations

- AOP-based API logging cho request/response business endpoints.
- MDC correlation ID / request ID de trace log end-to-end.
- RestTemplate logging interceptor cho outbound ESB calls.
- Spring Boot Actuator health/info va health probes.
- Logback configuration va structured log theo tung buoc nghiep vu.
- Internal dashboard summary cho failed messages.

### 5.6 Code Quality / Architecture

- Ap dung SOLID:
  - Single Responsibility: tach PaymentService god class thanh nhieu use case services.
  - Interface Segregation: moi nhom nghiep vu co interface rieng.
  - Dependency Inversion: inject qua interface, de mock trong test.
  - Open/Closed: mo rong transfer channel qua strategy moi.
- Refactor duplicate ESB calls ve `EsbClient` generic method.
- Refactor transfer logic chung ve `AbstractTransferService`.
- Refactor constants/status/error messages thanh enums va single source of truth.
- Tang testability bang service decomposition, repository abstraction va interface-driven design.
- Viet unit tests voi JUnit 5 va Mockito cho controller, service, utility, exception handler va transfer services.

### 5.7 Documentation / Delivery

- Viet tai lieu API markdown cho tung endpoint: create payment, check status, receipt, bank inquiry, refund, get payment account, disbursement, reconciliation.
- Lap tai lieu environment variables va project summary cho handover/CV.
- Chuyen yeu cau nghiep vu BRD thanh design, implementation tasks va test cases.
- Lam viec theo workflow doc-driven: spec -> service design -> implementation -> unit test -> review.

---

## 6. Thach Thuc Ky Thuat Va Cach Giai Quyet

| Thach thuc | Giai phap |
|------------|-----------|
| Conditional validation phuc tap theo tung ma dich vu | Custom Bean Validators cho `ThongTinBienLai`, `DanhSachKhoanNop`, `AtLeastOneField`. |
| Payment service co nguy co thanh god class | Tach thanh thin facade + use case services + interfaces rieng. |
| Nhieu kenh chuyen tien co logic chung nhung request khac nhau | Strategy + Template Method: `TransferService` va `AbstractTransferService`. |
| ESB token het han giua request | `EsbTokenManager` voi token cache, refresh buffer va retry khi auth loi. |
| Tao so tai khoan alias khong trung | Oracle sequence + retry loop + unique DB constraint. |
| QR phai dung chuan Napas EMVCo | Custom TLV encoder, CRC-16, normalize data va configurable bank/currency. |
| Response loi khac nhau theo API | `ErrorResponseFactory` tra dung DTO response theo endpoint. |
| Can log ca loi validation truoc controller | Ket hop AOP logging va fallback logging trong exception handler/filter. |
| Query tai khoan SHB va ngan hang ngoai co flow khac nhau | Routing theo ma ngan hang: Oracle Core Banking vs ESB Napas/Ebank. |
| Doi soat file 22 cot va Base64 content | Tach `ReconciliationFileBuilder`, `ReconciliationFileParser`, checksum util va entity luu ket qua. |
| Retry message loi khong lam mat raw payload | Luu failed message vao DB, republish Kafka topic goc qua internal API. |
| Config rai rac, kho van hanh | Gom vao typed `@ConfigurationProperties` va environment variables. |

---

## 7. Thanh Tuu / Impact

- Hoan thien day du cac API chinh cua payment gateway: tao QR, check status, receipt, bank inquiry, refund, get payment account, disbursement va reconciliation.
- Tich hop nhieu he thong banking thuc te: ESB/Core Banking, Napas, Ebank, Oracle Core Banking schema va Signature Service.
- Xay dung luong thanh toan VietQR theo chuan Napas EMVCo, co idempotency va duplicate prevention.
- Xay dung luong hoan tien/chi ho da kenh voi reversal va transfer strategy.
- Bo sung doi soat giao dich Type 1/Type 2, build/parse file Base64 22 cot va luu ket qua can khop.
- Bo sung retry failed Kafka messages phuc vu van hanh noi bo.
- Cai thien maintainability bang refactor facade/use-case/service strategy/config properties.
- Tang kha nang observability voi AOP logging, MDC tracing, RestTemplate interceptor va Actuator.
- Tao bo tai lieu ky thuat day du trong `DOC/` de phuc vu handover va review.

---

## 8. Bullet Points San Sang Dua Vao CV

- Designed and developed a Java 17/Spring Boot 3 payment gateway integrating Vietnam National Public Service payment flows with SHB Core Banking, ESB, Napas and Ebank systems.
- Implemented 9 REST APIs for payment creation, VietQR generation, transaction status inquiry, e-receipt retrieval, bank account inquiry, refund, disbursement and reconciliation.
- Built Napas EMVCo/VietQR generation with TLV encoding, CRC checksum, configurable bank/currency metadata and Oracle-backed alias account generation.
- Integrated ESB banking APIs with JWT token management, signed service headers, retry-on-auth-failure and reversal flows for reliable financial posting.
- Refactored a monolithic payment service into a facade plus use-case services, applying SOLID, Strategy, Template Method and interface-driven design.
- Developed reconciliation Type 1/Type 2 processing, including Oracle/Core Banking queries, 22-column pipe-delimited file generation, Base64 parsing, checksum calculation and result persistence.
- Implemented operational retry APIs for failed Kafka messages, including retry by reference number, bulk retry, status tracking and dashboard summary.
- Added centralized exception handling, custom Bean Validation, AOP API logging, MDC tracing, request/response masking and Actuator health endpoints.
- Wrote unit tests with JUnit 5 and Mockito across controllers, services, transfer strategies, utilities and exception handling.

---

## 9. Keywords Cho CV / ATS

**Technical Keywords:** Java 17, Spring Boot 3, Spring Web MVC, REST API, Oracle Database, Spring Data JPA, Hibernate, JdbcTemplate, Maven, Jakarta Bean Validation, Custom Validators, Spring AOP, Logback, SLF4J, MDC, Spring Kafka, KafkaTemplate, Spring Boot Actuator, SpringDoc OpenAPI, Swagger UI, Lombok, Jackson, JUnit 5, Mockito, SQL Migration, Configuration Properties.

**Architecture Keywords:** Layered Architecture, Facade Pattern, Strategy Pattern, Template Method, Repository Pattern, Abstract Factory, Interface Segregation, Dependency Injection, SOLID, Clean Code, Refactoring, Error Handling, Idempotency, Observability.

**Integration Keywords:** ESB Integration, Core Banking Integration, Napas Integration, Ebank Integration, JWT Authentication, Digital Signature, HMAC/SHA-256, RestTemplate, Token Refresh, Retry Pattern, Reversal Transaction, External API Integration.

**Domain Keywords:** Payment Gateway, VietQR, Napas EMVCo, Government Services, Public Service Payment, FinTech, Banking, Core Banking, Transaction Processing, Refund, Disbursement, Reconciliation, Settlement, Account Inquiry, E-Receipt, Citad, Kho bac, Oracle Core Banking.

**Soft Skills Keywords:** System Design, Backend Development, API Design, Technical Documentation, Requirement Analysis, Problem Solving, Production Support, Code Review, Refactoring, Cross-system Integration, Banking Domain Analysis.
