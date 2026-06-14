# SHB Debit Collection Portal - Project Summary for CV

## 1. Tổng Quan Dự Án

**Tên dự án:** SHB Debit Collection Portal / Cổng thông tin thanh lý tài sản và xử lý nợ

**Mô tả:** Hệ thống microservices phục vụ nghiệp vụ xử lý nợ và thanh lý tài sản của SHB. Hệ thống cung cấp API cho cổng khách hàng tra cứu/đăng ký quan tâm tài sản, xem tin tức/thông báo/banner, tải file đính kèm; đồng thời cung cấp API quản trị cho nhân viên ngân hàng quản lý tài sản, danh mục, nội dung website, quy trình phê duyệt, upload file và xuất báo cáo.

**Vai trò:** Backend Developer - phân tích nghiệp vụ, thiết kế REST APIs, implement microservices Spring Boot, tích hợp Keycloak SSO, Eureka, Gateway, Redis, PostgreSQL, MinIO, xây dựng workflow Maker-Checker, xử lý upload/report Excel, cấu hình Docker/Kubernetes/GitLab CI và viết tài liệu kỹ thuật.

**Thời gian:** 2026

**Quy mô source hiện tại:**
- 5 backend services: `debit-collect-gateway`, `debit-collect-eureka`, `debit-collect-be`, `debit-collect-config-noti`, `debit-collect-file-report`.
- 398 Java source files trong `src/main/java`.
- 21 REST controllers cho asset, lead, user, category, notice, banner, sitemap, website asset, file, report, gateway health và UMS integration.
- 69 service/service implementation classes.
- 9 repository interfaces chính cho asset, lead, user, category, notice, website asset và file metadata.
- Dockerfile, Kubernetes manifests và GitLab CI cho từng service.
- 2 smoke test classes trong snapshot hiện tại.

---

## 2. Tech Stack

| Layer | Công nghệ / Kỹ năng |
|-------|----------------------|
| Language | Java 17 |
| Framework | Spring Boot 3.5.7, Spring Web MVC, Spring WebFlux Gateway |
| Microservices | Spring Cloud Gateway, Netflix Eureka, OpenFeign |
| Security | Spring Security, OAuth2 Resource Server, JWT/JWKS, Keycloak SSO |
| Database | PostgreSQL, Spring Data JPA, Hibernate, HikariCP |
| Cache / Rate Limit | Redis, Lettuce, Bucket4j, Spring Cache, Caffeine |
| Reliability | Resilience4j Circuit Breaker/Retry |
| File Storage | MinIO, presigned URL, multipart upload |
| File Processing | Apache POI, Tika, iText |
| API Docs | SpringDoc OpenAPI, Swagger UI |
| Mapping / Boilerplate | MapStruct, Lombok |
| Observability | Spring Boot Actuator, Micrometer Prometheus, Brave tracing, request-id logging |
| DevOps | Docker multi-stage build, Kubernetes, GitLab CI, ArgoCD-style deployment manifests |

---

## 3. Kiến Trúc Hệ Thống

```text
Customer/Admin Web
        |
        v
debit-collect-gateway
  - route APIs
  - Keycloak JWT validation
  - public/admin endpoint policy
  - Redis/Bucket4j rate limiting
  - circuit breaker, logging, health diagnostics
        |
        +--> debit-collect-be
        |     - asset management
        |     - lead/customer interest
        |     - user public APIs
        |     - admin asset workflow
        |
        +--> debit-collect-config-noti
        |     - category hierarchy
        |     - notice/news/announcement
        |     - banner and website assets
        |     - sitemap and public filters
        |
        +--> debit-collect-file-report
        |     - MinIO file upload/download
        |     - file metadata management
        |     - category import/export
        |     - operational reports
        |
        +--> debit-collect-eureka
              - service discovery

Infrastructure: PostgreSQL, Redis, MinIO, Keycloak, Kubernetes, Prometheus
```

**Service ownership:**

| Service | Port | Chức năng |
|---------|------|-----------|
| `debit-collect-gateway` | 8080 | API routing, JWT auth, rate limiting, circuit breaker, health/diagnostic APIs |
| `debit-collect-eureka` | 8761 | Service registry/discovery |
| `debit-collect-be` | 8084 | Quản lý tài sản, lead, user, asset workflow và public asset APIs |
| `debit-collect-config-noti` | 8082 | Quản lý danh mục, thông báo/tin tức, banner, website assets và public CMS APIs |
| `debit-collect-file-report` | 8083 | Upload/download file, MinIO, import/export Excel, report view/export |

---

## 4. Chức Năng Chính Đã Phát Triển

### 4.1 API Gateway, Authentication và Traffic Control

- Xây dựng Spring Cloud Gateway WebFlux làm entrypoint cho toàn bộ hệ thống.
- Cấu hình route theo domain API: assets/leads, banners/notices/categories, files/reports.
- Validate JWT/JWKS từ Keycloak, tách danh sách public endpoints và protected admin endpoints.
- Implement Redis/Bucket4j rate limiting theo IP hoặc user, cấu hình riêng cho public browsing, lead submission, admin APIs và search APIs.
- Thêm circuit breaker/retry với Resilience4j, health/diagnostic endpoints và Prometheus metrics.
- Tích hợp UMS/Keycloak admin APIs cho tác vụ liên quan user/role/group.

### 4.2 Auth & Asset Service

- Xây dựng API public cho danh sách tài sản mới nhất, tìm kiếm tài sản, chi tiết tài sản, tài sản phổ biến và tracking view.
- Xây dựng API admin CRUD tài sản, danh sách published, advanced filter, batch delete và chi tiết tài sản kèm file/presigned URL.
- Implement workflow tài sản: tạo mới, submit, approve, reject, quản lý trạng thái và lý do từ chối.
- Validate mã tài sản duy nhất, tham chiếu danh mục, giá trị tài chính không âm và các rule nghiệp vụ.
- Quản lý lead/đăng ký quan tâm của khách hàng, kết hợp reCAPTCHA để giảm spam.
- Sử dụng Spring Data JPA Specification cho search/filter động theo keyword, loại tài sản, trạng thái, tỉnh/thành, ngày tạo và người tạo.

### 4.3 Config & Notification Service

- Quản lý danh mục phân cấp cho tài sản, tỉnh/thành, filter public và type system.
- Implement import danh mục theo file: preview/execute, validate record, xử lý lỗi và báo cáo lỗi import.
- Quản lý tin tức/thông báo/announcement với API public search và API admin CRUD.
- Xây dựng workflow Maker-Checker cho notice: Draft/Rejected -> Pending -> Approved/Rejected.
- Áp dụng Separation of Duties: checker không được phê duyệt nội dung do chính mình tạo.
- Quản lý banner và website assets, hỗ trợ batch delete, filter theo type và public listing.
- Sử dụng OWASP HTML Sanitizer để làm sạch rich text content và giảm rủi ro XSS.
- Thêm Redis cache cho category hierarchy, province list, banner list và cơ chế invalidation bằng AOP.

### 4.4 File & Report Service

- Xây dựng API upload single/multiple file, cập nhật entity binding, delete single/batch và public file lookup.
- Lưu file trên MinIO, quản lý metadata trong PostgreSQL và sinh presigned URL cho frontend.
- Validate file theo role: kích thước, MIME type, filename, dangerous extension và content detection bằng Apache Tika.
- Hỗ trợ attachment roles như avatar, banner, thumbnail, document, image, attachment, icon và import category.
- Xây dựng category export/import preview bằng Excel, export danh sách lỗi import.
- Xây dựng report APIs cho view/export, gồm các report strategy: lead report, interaction report, sales duration report.
- Sử dụng Strategy/Factory cho report generation để dễ mở rộng loại báo cáo mới.

### 4.5 DevOps, Runtime và Monitoring

- Viết Dockerfile cho các Spring Boot services.
- Cấu hình Kubernetes deployment/service/configmap/secret/kustomization cho mỗi service chính.
- Cấu hình rolling update, health probes, resource requests/limits và JVM options theo container runtime.
- Cấu hình GitLab CI cho build/package/deploy.
- Expose Actuator health/info/metrics/prometheus cho monitoring.
- Dùng logback + request ID/MDC pattern để trace request qua nhiều service.

---

## 5. Backend / System Design Skills

### 5.1 Microservice Backend Development

- Thiết kế RESTful APIs bằng Java 17 và Spring Boot 3.
- Tách service theo bounded context: gateway, discovery, auth-asset, config-notification, file-report.
- Sử dụng DTO request/response, MapStruct mapper, GlobalExceptionHandler và typed business exceptions.
- Quản lý transaction bằng `@Transactional` cho các flow tạo/sửa/phê duyệt.
- Sử dụng Spring Data JPA Repository và Specification cho truy vấn động.
- Dùng OpenFeign cho gọi nội bộ giữa service và forward request ID.

### 5.2 Security / Governance

- Tích hợp Keycloak SSO, JWT resource server và role-aware endpoint protection.
- Thiết kế danh sách public endpoints cho customer portal và protected endpoints cho admin portal.
- Implement workflow Maker-Checker cho nội dung/tài sản, có audit fields và separation of duties.
- Sanitization rich text content để phòng chống XSS.
- Validate file upload theo MIME, extension, filename và role-based size limit.
- Cấu hình CORS, gateway authentication filter và service-level security filter.

### 5.3 Performance / Reliability

- Redis caching cho dữ liệu đọc nhiều như category, province và banner.
- Redis/Bucket4j rate limiting cho gateway, riêng từng loại endpoint.
- Resilience4j circuit breaker/retry cho Redis và downstream services.
- HikariCP connection pooling, Hibernate batch insert/update và disable Open Session in View.
- Presigned URL với MinIO để giảm tải cho backend khi client tải file.
- Streaming/window-size config cho Excel export để xử lý report lớn.

### 5.4 File, Report và Data Processing

- Thiết kế file metadata model gắn với entity/domain và attachment role.
- Tích hợp MinIO SDK cho upload/download/delete object.
- Implement import/export Excel bằng Apache POI.
- Detect MIME bằng Apache Tika thay vì chỉ tin vào extension.
- Áp dụng Strategy pattern cho report generation.
- Xử lý category import validation, error record và export error file.

### 5.5 Observability / Operations

- Expose Actuator health, info, metrics và Prometheus endpoints.
- Thêm gateway diagnostic APIs để kiểm tra route, service health và backend connectivity.
- Log theo request ID/user ID giúp trace lỗi trong hệ thống microservices.
- Tách cấu hình qua environment variables cho database, Redis, MinIO, Keycloak và Eureka.
- Đóng gói và triển khai bằng Docker/Kubernetes/GitLab CI.

---

## 6. Bullet Points Có Thể Đưa Vào CV

- Developed a Java 17/Spring Boot 3 microservices platform for SHB debt collection and asset liquidation, covering asset management, CMS content, file storage, reporting, gateway authentication and service discovery.
- Built Spring Cloud Gateway with Keycloak JWT validation, public/admin endpoint policies, Redis/Bucket4j rate limiting, Resilience4j circuit breakers and Prometheus-ready health/metrics endpoints.
- Implemented asset management APIs with dynamic filtering, public search/detail APIs, admin CRUD, approval workflow, file attachments and view tracking.
- Designed Maker-Checker workflow for notices and managed content approval with audit trail, status transitions and separation-of-duties validation.
- Integrated MinIO object storage with secure file validation, metadata persistence, multipart upload, batch delete and presigned URL generation.
- Built Excel-based category import/export and report generation modules using Apache POI, Tika and strategy-based report services.
- Implemented Redis caching and cache invalidation for read-heavy configuration data such as category hierarchy, province list and banners.
- Prepared Docker, Kubernetes and GitLab CI deployment assets for independent backend services with health probes, resource limits and environment-based configuration.

---

## 7. Ghi Chú Chất Lượng Source

- Source hiện tại có cấu trúc microservices rõ ràng và có nhiều điểm production-oriented: gateway, service discovery, Redis, MinIO, Keycloak, metrics, Docker và Kubernetes.
- Test coverage trong snapshot còn rất thấp: chỉ thấy 2 smoke test classes. Nếu đưa vào CV, nên nói về phần đã implement và tránh claim "high test coverage" trừ khi bổ sung test thật sự.
- Repository hiện tại không bao gồm source frontend `debit-collect-fe` và `debit-collect-admin`, nên CV nên nhấn mạnh backend/microservices thay vì full-stack implementation.
