# Skill Roadmap — Notes tổng hợp (bản cô đọng)

> **Owner:** Nguyễn Quang Ngọc
> **Target:** Senior Backend / Full-Stack Developer (banking domain)
> **Thời lượng:** 24 tuần • Review mỗi Chủ nhật

## Giới thiệu

File tổng hợp **kiến thức cốt lõi** đã học trong suốt 24 tuần của skill roadmap, được viết thủ công dựa trên 295 note chi tiết đã chốt trong `skill-roadmap-progress.json`. Mỗi task lá được cô đọng về **định nghĩa, cơ chế, khi nào dùng/không dùng, pattern chuẩn, lỗi production hay gặp, và checklist review**. Phần câu hỏi phỏng vấn và ví dụ dài được lược bớt để tập trung vào bản chất cần nhớ khi áp dụng vào code backend ngân hàng.

Trọng tâm khi viết: **điều gì tạo ra bug trong production, điều gì khiến senior review chặn PR, điều gì giúp điều tra incident nhanh**. Mỗi nhánh có một hoặc hai "tư duy cốt lõi" in nghiêng ở đầu — đó là câu mà mình muốn nhớ đầu tiên khi mở task đó ra.

## Tổng quan

- **6 track • 12 module • 38 task cha • 115 nhánh • 262 task lá**
- Có note trong progress: **295**
- Đã hoàn thành: **331 task** — chưa hoàn thành: **6 task** (xem phụ lục cuối file)

## Mục lục track

1. **Java Core & JVM** — 3 tuần • Cơ bản → Nâng cao
2. **Spring Boot, Spring MVC & Spring Data** — 4 tuần • Trung cấp → Nâng cao
3. **Microservices, Spring Cloud & Event-Driven** — 4 tuần • Trung cấp → Nâng cao
4. **Database, SQL Performance, Cache & Object Storage** — 3 tuần • Trung cấp → Nâng cao
5. **Security, Identity & API Protection** — 2 tuần • Trung cấp → Nâng cao
6. **DevOps, Kubernetes & Observability** — 3 tuần • Cơ bản → Nâng cao

---


## Track 1: Java Core & JVM (3 tuần)

> **Mục tiêu track:** Nắm chắc ngôn ngữ, collection, concurrency, memory model và tuning JVM để xử lý backend tải cao.
> **Kỹ năng chính:** `Java Core` `OOP` `Collections` `Concurrency` `JVM` `Clean Code`

### 1.1 Module: Nền tảng Java

#### Task 1.1.1 — Ôn OOP, SOLID, immutable, equals/hashCode, defensive copy

**Level:** Cơ bản • **Estimate:** 12h • **Deliverable:** Thiết kế domain model banking chuẩn immutable, dùng entity/value object/DTO đúng ranh giới

##### Nhánh: OOP căn bản (encapsulation, inheritance, polymorphism, abstraction)

*Tư duy cốt lõi: OOP không phải để "code trông giống Java", OOP để giữ được invariant khi team mở rộng.*

- **1.1.1.1 Encapsulation (private + invariant + getter/setter có kiểm soát)**
  - **Định nghĩa:** Field private, getter/setter validate, class tự bảo vệ invariant nội bộ — không để caller tự do sửa state.
  - **Cơ chế:** Caller chỉ thấy method, không thấy field. Mỗi setter là một "cổng kiểm duyệt" — validate trước khi gán, từ chối giá trị xấu.
  - **Pattern chuẩn:**
    ```java
    public class Money {
        private final BigDecimal amount;
        private final String currency;
        public Money(BigDecimal amount, String currency) {
            if (amount == null || amount.signum() < 0) throw new IllegalArgumentException(...);
            this.amount = amount;
            this.currency = Objects.requireNonNull(currency);
        }
        public Money add(Money other) {
            requireSameCurrency(other);
            return new Money(this.amount.add(other.amount), this.currency);
        }
    }
    ```
  - **Lỗi production hay gặp:** Setter public `setBalance(BigDecimal)` cho phép set âm; getter trả mutable collection nội bộ → caller sửa lung tung; entity Hibernate có thêm setter vì lười viết constructor.
  - **Checklist:** Mọi field có `private`? Setter có validate? Getter có copy collection? Có immutable ở chỗ nào thì dùng `final`?

- **1.1.1.2 Polymorphism (interface, abstract class, dynamic dispatch)**
  - **Định nghĩa:** Một interface cha, nhiều implementation; JVM chọn method runtime dựa trên kiểu thực của object, không phải kiểu khai báo.
  - **Cơ chế:** Upcast `Animal a = new Dog();` — khi gọi `a.speak()`, JVM tra vtable của `Dog` rồi dispatch method phù hợp. Compiler chỉ kiểm tra "có method `speak()` trong `Animal`".
  - **Khi nào dùng:** Khi nhiều loại object cùng "có hành vi" nhưng cách làm khác nhau (Notification: SMS/Email/Push; Payment: Card/Wallet/CoreBanking).
  - **Lỗi production hay gặp:** Overload bị nhầm với override; `instanceof` chains thay vì đa hình; private method cùng tên ở cha-con không phải override.
  - **Checklist:** Interface đặt ở module nào? Có `default method` không? Có cần sealed class để giới hạn implementation?

- **1.1.1.3 Composition over inheritance**
  - **Định nghĩa:** "has-a" thay vì "is-a". Class A dùng class B như thành phần, không kế thừa.
  - **Cơ chế:** Kế thừa tạo coupling chặt: con kế thừa toàn bộ API cha, kể cả thứ không cần. Composition giữ A độc lập, chỉ gọi B khi cần.
  - **Khi nào KHÔNG dùng inheritance:** Quan hệ không phải "is-a" thật; muốn test dễ; cần swap implementation runtime; subclass phá invariant của cha.
  - **Lỗi production:** `extends ArrayList` để "có sẵn size()" — phá contract, khó refactor sau; `extends BaseController` để dùng helper, khiến mọi controller kéo theo cả đống method thừa.

##### Nhánh: SOLID

*Tư duy cốt lõi: SOLID không phải để "code đẹp", SOLID để khi nghiệp vụ đổi, chỉ phải đổi một chỗ.*

- **1.1.1.4 SRP — Single Responsibility**
  - **Định nghĩa:** Một class chỉ có một lý do để thay đổi — tức một nhóm stakeholder / một trục nghiệp vụ.
  - **Dấu hiệu vi phạm:** Class có tên "Manager/Helper/Util" gồm 20 method không liên quan; một service vừa gửi mail, vừa ghi DB, vừa validate input.
  - **Refactor chuẩn:** Tách theo trục thay đổi: `PaymentValidator`, `PaymentPersister`, `PaymentNotifier` — mỗi class có thể đổi độc lập.
  - **Checklist:** Khi muốn thêm method mới vào class, hỏi: "method này cùng trục nghiệp vụ với class không?". Câu trả lời không → tách.

- **1.1.1.5 OCP / DIP — Open-Closed + Dependency Inversion**
  - **Định nghĩa:** Mở rộng bằng abstraction, không sửa code lõi. Module cao không phụ thuộc module thấp, cả hai phụ thuộc abstraction.
  - **Pattern chuẩn:**
    ```java
    public interface RateLimiter { boolean allow(String key); }
    @Service public class RedisRateLimiter implements RateLimiter { ... }
    // Service cao chỉ phụ thuộc RateLimiter interface, không biết Redis hay Token bucket.
    ```
  - **Lỗi production:** `if (provider.equals("stripe")) { ... } else if (provider.equals("vnpay")) { ... }` — mỗi lần thêm provider phải sửa hết chỗ cũ. Sửa bằng `Map<String, PaymentProvider>` hoặc strategy.

- **1.1.1.6 LSP / ISP — Liskov Substitution + Interface Segregation**
  - **Định nghĩa:** Subtype phải thay thế được supertype mà không phá contract. Interface nhỏ, không ép implement thừa method.
  - **LSP vi phạm kinh điển:** `Square extends Rectangle` — Square phá invariant "width = height độc lập".
  - **ISP smell:** `UnsupportedOperationException` trong method của class implement — dấu hiệu interface quá to, phải tách.
  - **Checklist:** Mỗi method của interface có ý nghĩa cho mọi implementation không? Có method nào "không áp dụng" → tách interface.

##### Nhánh: Immutable object (final, defensive copy, thread-safety, value object)

*Tư duy cốt lõi: Trong backend ngân hàng, mặc định làm immutable. Mutable chỉ khi có lý do cụ thể.*

- **1.1.1.7 Immutable với final field + constructor validation**
  - **Định nghĩa:** Mọi field `final`, không có setter, constructor là điểm vào duy nhất, validation ngay tại constructor.
  - **Cơ chế:** Sau khi thoát constructor, object không thể đổi. JVM được phép chia sẻ reference tự do giữa các thread (safe publication).
  - **Pattern:** `record` (Java 16+) hoặc class thủ công với `final` field + getter không có setter.

- **1.1.1.8 Immutable collection (List.copyOf vs Collections.unmodifiableList)**
  - **Phân biệt:**
    - `Collections.unmodifiableList(list)`: chỉ bọc view, nếu list gốc đổi thì view cũng đổi — KHÔNG phải immutable thật.
    - `List.copyOf(list)`: copy sang cấu trúc mới, gốc đổi cũng không ảnh hưởng — immutable thật.
  - **Khi nào dùng cái nào:** Trả về cho caller bên ngoài → `List.copyOf`. Trong nội bộ module tin tưởng nhau → unmodifiable cũng được.
  - **Lỗi production:** Constructor `new ArrayList<>(input)` nhưng getter trả thẳng `return list` → caller sửa được state nội bộ.

- **1.1.1.9 Immutable trong concurrent code**
  - **Lợi ích:** Vì không thể đổi sau khi tạo, không cần lock/synchronized khi đọc — đây là cách đơn giản nhất để tránh race condition.
  - **Quy tắc vàng:** Khi nào nhiều thread cùng truy cập dữ liệu, cách an toàn nhất là **không cho đổi** thay vì lock khi đọc.
  - **Phối hợp:** `final` field + safe publication (gán trong constructor, không "this escape") + không lưu mutable reference bên ngoài.

##### Nhánh: equals/hashCode

*Tư duy cốt lõi: equals sai là bug logic. hashCode sai là bug performance. Cả hai sai là bug ngân hàng.*

- **1.1.1.10 equals/hashCode contract (5 điều kiện)**
  - **5 điều kiện:** reflexive, symmetric, transitive, consistent, `x.equals(null) == false`.
  - **HashCode rule:** `a.equals(b) == true` thì bắt buộc `a.hashCode() == b.hashCode()`. Ngược lại không bắt buộc nhưng nên tránh.
  - **Pattern:** IDE sinh hoặc dùng `record` (Java tự sinh đúng). Với class thường, dùng `Objects.equals` + `Objects.hash`.

- **1.1.1.11 Ảnh hưởng tới HashMap/HashSet**
  - **Lỗi kinh điển:** Thêm key vào HashMap, sau đó sửa field ảnh hưởng hashCode → không tìm thấy key nữa, get() trả null, có thể trùng key khác cùng bucket.
  - **Bài học:** Key trong HashMap/HashSet phải immutable về mặt hashCode và equals. Dùng value object (immutable) làm key.

- **1.1.1.12 equals/hashCode cho JPA entity**
  - **Quy tắc:** JPA entity KHÔNG nên override equals dựa trên field business; equals dựa trên **id** (database identifier) hoặc dùng identity reference.
  - **Lý do:** Trước khi persist, id chưa có → equals phải dùng reference identity. Sau khi persist, id có rồi → có thể dùng id. Hibernate có pattern riêng.
  - **Checklist:** Entity có override equals/hashCode? Dựa trên gì? Có nhất quán giữa transient/persistent không?

##### Nhánh: Defensive copying

*Tư duy cốt lõi: Trust no one. Caller có thể sửa object sau khi truyền vào.*

- **1.1.1.13 Defensive copy ở input (constructor/setter)**
  - **Khi nào cần:** Parameter là mutable object (Date, List, Map, custom class có setter).
  - **Pattern:**
    ```java
    public Order(List<Item> items) {
        this.items = List.copyOf(items);  // copy ngay, không giữ reference gốc
    }
    ```
  - **Lỗi kinh điển:** Constructor giữ `this.date = date;` rồi sau đó caller sửa `date.setTime(...)` → state nội bộ bị đổi ngầm.

- **1.1.1.14 Defensive copy ở output (getter)**
  - **Khi nào cần:** Field nội bộ là mutable collection, trả cho caller.
  - **Pattern:** Getter trả `Collections.unmodifiableList(this.items)` hoặc `List.copyOf(this.items)`.
  - **Khi nào KHÔNG cần:** Field đã là immutable (LocalDate, String, BigDecimal).

##### Nhánh: Entity vs Value Object vs DTO

*Tư duy cốt lõi: 3 khái niệm này phản ánh 3 ranh giới khác nhau trong hệ thống. Trộn lẫn = bug + khó test + khó evolve.*

- **1.1.1.15 Entity (identity + lifecycle + persistence)**
  - **Định nghĩa:** Có danh tính (id) ổn định theo thời gian, có vòng đời (transient → managed → detached → removed), được quản lý bởi persistence context.
  - **Quy tắc:** Entity KHÔNG nên expose ra API boundary. Entity có thể có setter (cho Hibernate), có field mutable (collection quan hệ). Trộn entity vào response → leak DB schema, cycle reference, lazy loading exception.

- **1.1.1.16 Value Object (so sánh bằng giá trị + bất biến)**
  - **Định nghĩa:** Không có danh tính riêng, hai instance cùng giá trị thì coi như nhau. Luôn immutable. Đại diện cho khái niệm nghiệp vụ: `Money`, `Address`, `PhoneNumber`, `AccountNumber`.
  - **Pattern:** Dùng `record` hoặc class immutable với `final` field + validate constructor.
  - **Lợi ích:** Tự validate domain rule ngay khi tạo (Money không bao giờ âm), tránh "primitive obsession".

- **1.1.1.17 DTO (request/response/command)**
  - **Định nghĩa:** Object chỉ để truyền dữ liệu qua một ranh giới (API, message queue, file). Không có logic nghiệp vụ, không có danh tính.
  - **Phân loại theo ranh giới:**
    - Request DTO: từ client vào server (validate, không leak field nội bộ).
    - Response DTO: từ server ra client (lọc field, không expose entity).
    - Command: dữ liệu gửi tới command handler / use case.
    - Event: dữ liệu publish lên Kafka.
  - **Lỗi production:** Trả entity JPA ra response → Jackson serialize lazy proxy → N+1 query hoặc stack overflow vì bidirectional; expose field nhạy cảm (password hash, internal note).


#### Task 1.1.2 — Collections: ArrayList, LinkedList, HashMap, ConcurrentHashMap, TreeMap

**Level:** Cơ bản • **Estimate:** 8h • **Deliverable:** Chọn collection đúng cho use case backend, đọc được internals khi review performance bug

##### Nhánh: List implementations & traversal

*Tư duy cốt lõi: ArrayList gần như luôn đúng cho 95% backend use case. LinkedList hiếm khi đúng.*

- **1.1.2.1 ArrayList vs LinkedList**
  - **Memory layout:** ArrayList là mảng liên tục, LinkedList là node rời rạc (mỗi node có `prev`, `next`, `item`).
  - **Random access:** ArrayList O(1), LinkedList O(n). Get(i) trên LinkedList phải duyệt từ đầu/cuối.
  - **Insert/delete giữa danh sách:** ArrayList O(n) (shift), LinkedList O(1) **nếu đã có node** — nhưng tìm vị trí vẫn O(n).
  - **Cache locality:** ArrayList thắng lớn vì dữ liệu liên tục trong memory, CPU prefetch hiệu quả.
  - **Checklist:** Chọn ArrayList trừ khi profile chứng minh LinkedList tốt hơn.

- **1.1.2.2 Benchmark chọn List cho backend workload**
  - **Bài học:** Hầu hết backend thao tác là `add`, `get(i)`, `iterator`, `forEach` — ArrayList thắng trên mọi metric đo được trừ insert/delete đầu/cuối thường xuyên.
  - **LinkedList hợp lý:** Implement LRU cache (cần remove đầu + add cuối + remove cuối, dùng `ArrayDeque` còn tốt hơn), hoặc cần xóa phần tử theo reference node (ít gặp).

##### Nhánh: Map internals & thread-safety

*Tư duy cốt lõi: HashMap là cấu trúc được dùng nhiều nhất trong backend. Hiểu bucket/hash/resize/treeify giúp debug memory và performance.*

- **1.1.2.3 HashMap internals (bucket, hash, collision, resize, treeify)**
  - **Cấu trúc:** Mảng bucket, mỗi bucket là linked list (hoặc red-black tree nếu quá dài).
  - **Hash:** `key.hashCode()` rồi `spread()` (XOR high 16 bits) để giảm collision.
  - **Bucket index:** `(n - 1) & hash` — yêu cầu `n` là power of 2.
  - **Collision:** Nhiều key rơi cùng bucket → tra O(n). Khi bucket > 8 và table > 64, chuyển sang red-black tree (Java 8+).
  - **Resize:** Load factor 0.75. Khi size > threshold, double bucket và rehash tất cả entry — operation tốn kém.
  - **Lỗi production:** `HashMap` với `String` key có hashCode tệ (cache key chỉ có 2-3 giá trị) → hầu hết key rơi cùng bucket → O(n) trên tập lớn; khởi tạo `new HashMap<>(1000)` không đủ nếu sẽ lên 10k → resize nhiều lần.

- **1.1.2.4 ConcurrentHashMap**
  - **Cơ chế:** Java 7 dùng segmented lock; Java 8+ dùng CAS + synchronized trên từng bucket head node — concurrency tốt hơn nhiều.
  - **Atomic operations:** `compute`, `computeIfAbsent`, `computeIfPresent`, `merge`, `putIfAbsent` — đảm bảo không bị race condition khi "check + put".
  - **KHÔNG atomic:** `if (!map.containsKey(k)) map.put(k, v)` — phải dùng `putIfAbsent`.
  - **Khi KHÔNG nên dùng ConcurrentHashMap:** Cần iterate toàn bộ + atomic với modification khác (dùng `ConcurrentSkipListMap` hoặc lock ngoài); cần null key/value (CHM cấm null).
  - **Lỗi production:** Multi-thread check-then-act trên HashMap (HashMap không thread-safe, có thể treo CPU do lost resize); dùng `Collections.synchronizedMap(new HashMap<>())` thay vì ConcurrentHashMap (lock cả bảng, throughput thấp).

##### Nhánh: Ordering, comparator

*Tư duy cốt lõi: TreeMap/Comparator yêu cầu nhất quán tuyệt đối. Một compareTo vi phạm → kết quả sai không dự đoán được.*

- **1.1.2.5 TreeMap / Comparator / consistency**
  - **Đặc tính:** Sorted map, O(log n) cho put/get/remove.
  - **Comparator consistency:** `compare(a,b) == 0` thì bắt buộc `a.equals(b) == true` nếu muốn map hoạt động đúng với `get()`.
  - **Null key:** TreeMap cho phép null key nếu comparator xử lý, nhưng tự code phải xử lý null an toàn.
  - **Khi dùng:** Cần range query (`subMap`, `headMap`), cần thứ tự duyệt sorted, hoặc cần dữ liệu luôn sorted.

- **1.1.2.6 Câu hỏi phỏng vấn Collections**
  - **Top câu hay gặp:** ArrayList vs LinkedList; HashMap put flow; ConcurrentHashMap cơ chế; equals/hashCode contract; fail-fast vs fail-safe iterator; ConcurrentModificationException; treeify threshold; load factor.
  - **Mẹo ôn:** Vẽ lại cấu trúc HashMap + ConcurrentHashMap từ trên xuống; nhớ rằng `modCount` gây CME.

#### Task 1.1.3 — Stream API, Optional, Functional interface, Lambda

**Level:** Trung cấp • **Estimate:** 9h • **Deliverable:** Mapping DTO bằng Stream đúng cách, dùng Optional đúng chỗ, refactor stream phức tạp

##### Nhánh: Stream pipeline & transformation

*Tư duy cốt lõi: Stream KHÔNG phải Collection. Stream là mô tả cách xử lý. Collection là dữ liệu.*

- **1.1.3.1 Pipeline (source, intermediate, terminal)**
  - **Source:** `list.stream()`, `Arrays.stream(arr)`, `Stream.of(...)`, `Files.lines(path)`.
  - **Intermediate (lazy):** `filter`, `map`, `sorted`, `distinct`, `limit`, `peek`, `flatMap`. Không chạy ngay khi khai báo.
  - **Terminal (kích hoạt):** `collect`, `toList`, `forEach`, `count`, `reduce`, `anyMatch`, `findFirst`, `findAny`, `allMatch`.
  - **3 đặc tính quan trọng:** lazy (intermediate chưa chạy), single-use (stream chỉ dùng được 1 lần), operation fusion (JVM gộp nhiều op lại).
  - **Lỗi:** `IllegalStateException: stream has already been operated upon` khi dùng stream 2 lần; nghĩ `peek` có side effect nhưng pipeline không chạy nếu không có terminal.

- **1.1.3.2 map / filter / flatMap / collect**
  - **map:** `A -> B`, biến đổi 1-1. Ví dụ `Order -> OrderDto`.
  - **filter:** `A -> maybe A`, giữ lại phần tử thỏa điều kiện.
  - **flatMap:** `A -> Stream<B>`, biến 1 phần tử thành nhiều rồi flatten.
  - **collect:** `Stream<A> -> Collection/Map`, gom kết quả cuối (`toList`, `toSet`, `groupingBy`, `joining`).
  - **Pattern chuẩn:**
    ```java
    List<OrderDto> result = orders.stream()
        .filter(o -> o.status() == OrderStatus.PAID)
        .map(OrderMapper::toDto)
        .toList();
    ```

##### Nhánh: Null-safety & functional style

*Tư duy cốt lõi: Optional chỉ nên dùng ở return type. Không dùng ở field, parameter, DTO.*

- **1.1.3.3 Optional (đúng chỗ)**
  - **Nên dùng:** Return type của method khi "không có giá trị" là kết quả hợp lệ: `Optional<Customer> findById(Long id)`.
  - **KHÔNG nên dùng:** Field entity, DTO field, parameter method, `Optional<List<X>>` (dùng list rỗng).
  - **Pattern an toàn:** `findById(...).orElseThrow(() -> new NotFoundException(...))`; `.map(...).filter(...).orElse(...)`.
  - **Lỗi:** `Optional.of(null)` ném NPE — dùng `Optional.ofNullable(...)`; `optional.get()` không check — phải check trước.

- **1.1.3.4 Functional interface (Predicate, Function, Consumer, Supplier)**
  - **Predicate<T>:** `T -> boolean` — kiểm tra điều kiện.
  - **Function<T,R>:** `T -> R` — chuyển đổi dữ liệu.
  - **Consumer<T>:** `T -> void` — hành động có side effect.
  - **Supplier<T>:** `() -> T` — cung cấp dữ liệu, lazy.
  - **Tư duy:** Functional interface cho phép **truyền logic như dữ liệu**. Strategy + lambda thay cho class con dài dòng.

- **1.1.3.5 Lambda & method reference**
  - **Scope:** Lambda truy cập được biến local, field, method của enclosing scope.
  - **Effectively final:** Biến local capture bởi lambda phải không bị gán lại (final hoặc effectively final).
  - **Method reference:** Rút gọn lambda khi chỉ gọi 1 method: `OrderMapper::toDto` tương đương `o -> OrderMapper.toDto(o)`.
  - **Đọc code:** Lambda/method ref chỉ tốt khi **code rõ hơn**, không phải khi **code ngắn hơn bằng mọi giá**. Lambda 3 dòng có logic nghiệp vụ → đẩy ra method riêng.

##### Nhánh: Performance & readability trade-off

*Tư duy cốt lõi: Code truyền đạt business rule rõ hơn thì code đó tốt hơn. Stream "đẹp" mà đọc không ra → fail review.*

- **1.1.3.6 Stream performance (lazy, boxing, parallel)**
  - **Lazy evaluation:** Intermediate op không chạy ngay → tiết kiệm khi filter loại bỏ nhiều.
  - **Boxing:** `IntStream` thay vì `Stream<Integer>` tránh boxing/unboxing trong vòng lặp lớn.
  - **Parallel stream:** KHÔNG tự động nhanh hơn. Chi phí fork/join, chia/gộp, dùng `commonPool()` (chia sẻ với các tác vụ khác). Chỉ hiệu quả khi data lớn, op CPU-bound, op độc lập. KHÔNG dùng cho I/O.
  - **Lỗi:** Parallel stream trong Spring service → đụng `commonPool` với các task khác → thread starvation; thay đổi state ngoài stream trong lambda (race).

- **1.1.3.7 Refactor stream phức tạp về loop**
  - **Khi nào refactor:** Stream > 4-5 op, có side effect, có nhánh business, cần debug/log giữa pipeline.
  - **Hai hướng:**
    1. Giữ stream nhưng tách method: `.filter(this::isEligible).flatMap(this::toValidItems).map(this::toInvoiceLine)`.
    2. Loop truyền thống khi cần early-return, log, debug breakpoint.
  - **Quy tắc vàng:** Reviewer đọc stream 30 giây không hiểu business → refactor.

### 1.2 Module: JVM & concurrent programming

#### Task 1.2.1 — Java Memory Model, volatile, synchronized, happens-before

**Level:** Nâng cao • **Estimate:** 8h • **Deliverable:** Đọc được thread dump, debug race condition, thiết kế concurrency đúng

##### Nhánh: Race condition fundamentals

*Tư duy cốt lõi: 2 nhóm vấn đề — visibility (thread B không thấy data thread A) và atomicity (compound action bị xen ngang). Cần hiểu cả 2.*

- **1.2.1.1 Visibility (CPU cache, main memory, stale read)**
  - **Mô hình:** Main memory ↔ CPU cache/working memory ↔ Thread execution. Thread có thể đọc từ cache, không thấy write mới nhất.
  - **Ví dụ kinh điển:** Flag `volatile boolean running = true;` thread A đổi `false` nhưng thread B vẫn chạy mãi → stale read.
  - **Fix:** `volatile`, `synchronized`, hoặc immutable object.

- **1.2.1.2 Atomicity (`++` không atomic, compound action)**
  - **`counter++` gồm 3 bước:** read → +1 → write. Hai thread có thể cùng đọc 0, cùng ghi 1 → mất 1 increment.
  - **Fix:** `AtomicInteger.incrementAndGet()`, `synchronized`, hoặc `LongAdder` (nếu write ít, read nhiều).
  - **Check-then-act:** `if (map.containsKey(k)) map.put(k, v)` → cũng race. Dùng `putIfAbsent`.

##### Nhánh: Synchronization mechanisms

*Tư duy cốt lõi: volatile cho visibility/ordering đơn giản. synchronized/ReentrantLock cho mutual exclusion thật sự.*

- **1.2.1.3 volatile (visibility + ordering, không thay thế lock)**
  - **Đảm bảo:** visibility (luôn đọc từ main memory), ordering (chặn một số reorder quanh volatile read/write), atomic read/write đơn.
  - **KHÔNG đảm bảo:** atomicity cho compound action (`count++`), mutual exclusion (nhiều thread vẫn vào được).
  - **Khi dùng:** flag đơn (status, ready, shutdown), one-publication (config loader), kết hợp với atomic reference.
  - **Lỗi:** Dùng `volatile int counter;` rồi `counter++` — vẫn race. Dùng `AtomicInteger` thay.

- **1.2.1.4 synchronized / ReentrantLock**
  - **synchronized:** Intrinsic lock gắn với object/Class. Đơn giản, JVM tự release. Không có timeout/interrupt/fairness/condition.
  - **ReentrantLock:** Lock explicit, linh hoạt hơn: `tryLock(timeout)`, `lockInterruptibly()`, `new ReentrantLock(true)` cho fairness, nhiều `Condition`.
  - **Quy tắc:** Lock trên object không đổi, giữ critical section ngắn, tránh gọi external code khi giữ lock (deadlock/inversion).
  - **Lỗi kinh điển:** `synchronized(this)` trong method public → caller cũng có thể lock cùng monitor, không atomic.
  - **Deadlock 4 điều kiện:** mutual exclusion, hold & wait, no preemption, circular wait. Phá 1 trong 4 là hết deadlock.

##### Nhánh: Publication & happens-before

*Tư duy cốt lõi: "Thread B thấy thread A" không phải mặc định. Cần biết rule nào đảm bảo.*

- **1.2.1.5 Happens-before rules**
  - **Định nghĩa:** Nếu A happens-before B thì A's memory effects visible với B, và ordering được tôn trọng.
  - **KHÔNG có nghĩa:** A xảy ra trước B theo wall-clock time. Đây là quan hệ logic.
  - **4 rule thường gặp:**
    - Volatile write → volatile read cùng biến.
    - Monitor unlock → monitor lock cùng object.
    - Thread `start()` → bất kỳ action nào trong thread mới.
    - Action trong thread → `join()` return.
  - **Constructor của object final:** `final` field có safe publication guarantee — sau khi constructor return, các thread khác đọc được đúng giá trị cuối.

- **1.2.1.6 Safe publication (final field, immutable holder, volatile reference)**
  - **3 cách safe publication phổ biến:**
    1. `final` field — JVM đảm bảo.
    2. `volatile` reference — write một reference, các thread khác thấy cả object graph an toàn (nếu object immutable).
    3. `synchronized` block — lock bao trùm write và read.
  - **Pattern immutable holder:** Singleton bằng static field `final Config INSTANCE = new Config();` — JVM đảm bảo safe publication.

#### Task 1.2.2 — ExecutorService, CompletableFuture, thread pool sizing, timeout

**Level:** Nâng cao • **Estimate:** 9h • **Deliverable:** Thiết kế async pipeline cho backend gọi nhiều API downstream

##### Nhánh: Executor & thread pool lifecycle

*Tư duy cốt lõi: Tạo thread tốn kém. Thread pool giúp tái sử dụng, kiểm soát tài nguyên, dự đoán throughput.*

- **1.2.2.1 ExecutorService lifecycle (submit, shutdown, awaitTermination)**
  - **submit:** Gửi task, trả `Future`. Không block.
  - **shutdown():** Không nhận task mới, chạy tiếp task đã nhận.
  - **shutdownNow():** Cố dừng ngay, interrupt task đang chạy, trả task chưa chạy.
  - **awaitTermination(timeout):** Đợi pool kết thúc, dùng kết hợp `shutdown()` để graceful stop.
  - **Lỗi production:** Quên `shutdown()` → JVM không tắt vì non-daemon thread còn sống.

- **1.2.2.2 ThreadPoolExecutor (core/max/queue/rejection)**
  - **7 tham số:** core, max, keepAlive, unit, workQueue, threadFactory, rejectionHandler.
  - **Luồng hoạt động:** Task mới → nếu pool < core → tạo thread; nếu ≥ core → đẩy vào queue; nếu queue đầy → tạo thread mới đến max; nếu max → reject.
  - **RejectionPolicy:** AbortPolicy (throw exception — mặc định), CallerRunsPolicy (chạy ở thread gọi — backpressure), DiscardPolicy (bỏ), DiscardOldestPolicy (bỏ task cũ nhất).
  - **Lỗi:** Dùng `Executors.newFixedThreadPool` không bounded queue → OOM khi task tăng đột biến; dùng unbounded queue với CallerRunsPolicy (không bao giờ reject → overload kéo dài).

- **1.2.2.3 Thread pool sizing**
  - **CPU-bound:** Số thread ≈ số core CPU (hoặc +1 cho tính toán không blocking).
  - **I/O-bound:** Công thức `N_threads = N_cpu * U_cpu * (1 + W/C)` với W=wait time, C=compute time. Ví dụ: 4 core, 50% CPU target, wait 100ms / compute 10ms → 4 * 1 * (1 + 100/10) = 44 thread. Thường thực tế chọn 20-50 thread cho I/O-bound backend.
  - **Lỗi:** Quá nhiều thread → context switch overhead, OOM stack; quá ít → throughput thấp, latency tăng.

##### Nhánh: CompletableFuture composition

*Tư duy cốt lõi: CompletableFuture cho async pipeline không phải `get()` chặn giữa chừng.*

- **1.2.2.4 supplyAsync / thenApply / thenCompose / allOf**
  - **supplyAsync:** Chạy task async, trả `CompletableFuture<T>`.
  - **thenApply:** Biến đổi kết quả (sync, nhanh).
  - **thenCompose:** Khi function trả `CompletableFuture<U>` (flatMap của future).
  - **thenCombine:** Gộp kết quả 2 future độc lập.
  - **allOf:** Đợi tất cả future xong.
  - **anyOf:** Đợi 1 future xong trước.
  - **Lỗi:** `thenApply` thay cho `thenCompose` khi function trả future → nested future `CompletableFuture<CompletableFuture<U>>` không flatten.

- **1.2.2.5 Exception propagation trong Future / CompletableFuture**
  - **Future:** Lỗi đóng gói trong `ExecutionException` khi `get()`.
  - **CompletableFuture:** Có `exceptionally()`, `handle()`, `whenComplete()` để xử lý tại stage mà không cần `get()`.
  - **Quy tắc:** Luôn có terminal stage xử lý exception (exceptionally hoặc handle) — không có → lỗi "nuốt" âm thầm.
  - **Lỗi production:** Quên handle → exception bị log lần đầu rồi "lost" → khó debug.

##### Nhánh: Timeout, cancellation, fallback

*Tư duy cốt lõi: Timeout không phải "giết task". Timeout là "ngừng chờ". Cancellation là cooperative.*

- **1.2.2.6 Timeout, cancellation, fallback khi gọi nhiều API**
  - **Timeout:** Giới hạn thời gian chờ. Quá timeout → coi như thất bại.
  - **Cancellation:** Cooperative — Java gửi interrupt, task phải check `Thread.interrupted()` hoặc `Future.isCancelled()` để dừng.
  - **Fallback:** Giá trị mặc định hoặc cached value khi dependency lỗi.
  - **Lỗi:** Retry không có max attempt + không có backoff → retry storm; fallback trả dữ liệu sai → âm thầm che lỗi nghiệp vụ.

- **1.2.2.7 Thiết kế timeout budget cho fan-out**
  - **Fan-out 3 API song song:** Tổng thời gian ≈ `max(timeoutA, timeoutB, timeoutC) + processing + margin`.
  - **Ví dụ budget 800ms:** Internal 100ms + 3 API song song mỗi 600ms + margin 100ms.
  - **Quy tắc:** Chia budget rõ ràng, đặt deadline ở root context, propagate xuống từng downstream.

#### Task 1.2.3 — GC, heap/stack/metaspace, memory leak, thread/heap dump

**Level:** Nâng cao • **Estimate:** 8h • **Deliverable:** Đọc được thread/heap dump, điều tra OOM/leak, tối ưu GC

##### Nhánh: JVM memory & GC foundation

*Tư duy cốt lõi: GC không fix được memory leak. Leak là vì object vẫn reachable, không phải GC yếu.*

- **1.2.3.1 Memory layout (heap, stack, metaspace, thread stack)**
  - **Heap:** Object, array, field — chia sẻ giữa các thread, GC quản lý. Chia Young (Eden + 2 Survivor) và Old.
  - **Thread stack / JVM stack:** Stack frame, local variable, method call — mỗi thread có stack riêng, không GC trực tiếp.
  - **Metaspace:** Class metadata, method, constant pool — ngoài heap (Java 8+), cấu hình bằng `-XX:MaxMetaspaceSize`.
  - **Native memory (Direct/Off-heap):** `ByteBuffer.allocateDirect`, Netty — không bị GC heap quản lý, tràn thì OOM kiểu khác.
  - **Lỗi:** StackOverflowError do đệ quy vô hạn; OOM PermGen trước Java 8 do class loader leak.

- **1.2.3.2 GC (young/old, pause time, throughput)**
  - **Cơ chế:** Object mới vào Eden. Sống qua Minor GC → Survivor. Đủ tuổi (default 15) → Old. Old đầy → Major GC/Full GC.
  - **Generational hypothesis:** Phần lớn object chết nhanh → Young GC nhanh, ít ảnh hưởng latency.
  - **GC algorithms:** Serial (single thread), Parallel (throughput), G1 (default từ Java 9, balance latency/throughput), ZGC/Shenandoah (low-pause, sub-millisecond).
  - **Tuning:** Kích thước heap, GC algorithm, G1 region size, `-XX:MaxGCPauseMillis` (target, không phải guarantee).

##### Nhánh: Leak investigation artifacts

*Tư duy cốt lõi: 3 câu hỏi khi điều tra memory leak — memory tăng ở vùng nào, ai giữ, tại sao tăng theo thời gian.*

- **1.2.3.3 Memory leak (static reference, cache không TTL, listener không remove)**
  - **Static reference:** Object giữ bởi static field gần như sống mãi.
  - **Cache không TTL/eviction:** Thêm vào mãi, không bao giờ xóa.
  - **Listener không remove:** Observer pattern không cleanup → listener giữ tham chiếu subject.
  - **ThreadLocal không remove:** Web app reuse thread → ThreadLocal tích lũy.
  - **Connection/stream không close:** File handle, JDBC connection.
  - **Fix:** Dùng WeakReference cho cache, TTL/eviction cho mọi cache, clear listener trong `finally`, `remove()` ThreadLocal khi xong.

- **1.2.3.4 Heap dump (dominator tree, retained size, leak suspect)**
  - **Cách lấy:** `jmap -dump:format=b,file=heap.hprof <pid>`, hoặc `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps`.
  - **Phân tích:** Mở bằng Eclipse MAT hoặc VisualVM. Xem dominator tree (object nào giữ nhiều nhất), retained size (memory giải phóng nếu object bị GC), leak suspects report.
  - **Mẹo:** So sánh 2 heap dump cách nhau vài giờ → object nào tăng nhiều nhất → nghi ngờ leak.

##### Nhánh: Thread/runtime incident diagnosis

*Tư duy cốt lõi: Incident 80% là "thấy CPU cao, memory cao, request treo" — phải biết cách đào artifact đúng lúc.*

- **1.2.3.5 Thread dump (BLOCKED, WAITING, TIMED_WAITING, deadlock)**
  - **Cách lấy:** `jstack <pid>`, hoặc `kill -3 <pid>` (SIGQUIT, ghi ra stdout).
  - **Đọc:** Thread name + state + stack. `BLOCKED` = chờ monitor. `WAITING` = `wait()/join()`. `TIMED_WAITING` = `sleep()/wait(timeout)`.
  - **Deadlock:** JVM tự phát hiện và in "Found one Java-level deadlock" + stack của 2 thread giữ chéo monitor.
  - **Pattern đọc:** Nhiều thread cùng chờ 1 monitor → bottleneck ở code giữ lock.

- **1.2.3.6 Quy trình điều tra CPU cao, memory cao, request treo**
  - **CPU cao:** Lấy thread dump → tìm thread RUNNABLE chiếm CPU → đọc stack → xác định method. Thường là regex nặng, JSON serialize lớn, infinite loop, GC.
  - **Memory cao:** Heap dump → dominator tree → tìm object giữ nhiều → check static field, cache, listener.
  - **Request treo:** Thread dump → tìm thread xử lý request → xem đang chờ gì (DB connection, lock, I/O). Nhiều thread treo cùng chỗ → connection pool cạn, deadlock, dependency down.
  - **Quy tắc:** Đừng đoán, lấy evidence đúng thời điểm, lặp lại 2-3 lần để xác nhận pattern.


---

## Track 2: Spring Boot, Spring MVC & Spring Data (4 tuần)

> **Mục tiêu track:** Củng cố nền tảng Spring, xây API chuẩn production, transaction đúng và xử lý lỗi nhất quán.
> **Kỹ năng chính:** `Spring Boot` `Spring Framework` `Spring Web MVC` `Spring Data JPA` `Hibernate` `MyBatis` `JdbcTemplate` `MapStruct`

### 2.1 Module: Spring foundation

#### Task 2.1.1 — IoC/DI, bean lifecycle, profile, configuration properties, auto-configuration

**Level:** Cơ bản • **Estimate:** 7h • **Deliverable:** Bean wiring đúng, config bằng properties chuẩn, hiểu auto-config

##### Nhánh: Container & dependency wiring

*Tư duy cốt lõi: Spring tạo object thay mình. Việc của mình là chỉ cho Spring biết dependency nào cần, bằng constructor injection.*

- **2.1.1.1 IoC/DI (BeanFactory, ApplicationContext, constructor injection)**
  - **BeanFactory:** Container gốc, lazy-init bean.
  - **ApplicationContext:** Mở rộng BeanFactory, eager-init singleton, hỗ trợ event, i18n, profile.
  - **3 kiểu injection:**
    - Constructor (khuyến nghị): bắt buộc dependency, dễ test, immutable.
    - Setter: cho dependency optional hoặc circular.
    - Field (`@Autowired private Foo foo;`): tiện nhưng khó test, ẩn coupling.
  - **Quy tắc:** Constructor injection cho dependency bắt buộc. Tránh field injection (khó mock trong unit test nếu không dùng reflection).

- **2.1.1.2 Bean lifecycle**
  - **Thứ tự:** BeanDefinition → Instantiate → Populate (DI) → Aware callbacks → BeanPostProcessor before init → Init (@PostConstruct, InitializingBean, custom init-method) → BeanPostProcessor after init → Ready → Destroy (@PreDestroy, DisposableBean).
  - **AOP:** Tạo proxy sau init nếu class match pointcut.
  - **Lỗi:** `@PostConstruct` gọi method khác trong cùng class qua `this` → không qua proxy → @Transactional, @Async không có tác dụng.

- **2.1.1.3 Bean scope & lỗi stateful singleton**
  - **Singleton (mặc định):** Một instance cho toàn container. Stateless là chuẩn.
  - **Prototype:** Mỗi lần inject tạo mới. Lifecycle do client quản lý (Spring không gọi destroy method).
  - **Request/Session/Application:** Chỉ có trong web context.
  - **Lỗi kinh điển:** Singleton bean giữ state (counter, list, user data) → request A thấy data request B.

##### Nhánh: Auto-configuration & externalized config

*Tư duy cốt lõi: Spring Boot "auto" không phải magic. Nó là @Conditional check classpath, bean, property.*

- **2.1.1.4 Auto-configuration & conditional**
  - **Cơ chế:** Mỗi `XxxAutoConfiguration` class dùng `@ConditionalOnClass`, `@ConditionalOnBean`, `@ConditionalOnMissingBean`, `@ConditionalOnProperty` để quyết định có apply không.
  - **Ví dụ:** `DataSourceAutoConfiguration` chỉ chạy khi có class `javax.sql.DataSource` và chưa có `DataSource` bean nào.
  - **Custom auto-config:** Tạo `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` (Spring Boot 3) hoặc `spring.factories` (Boot 2).

- **2.1.1.5 Configuration properties (bind, validate, profile, secret)**
  - **Cách dùng:**
    ```java
    @ConfigurationProperties(prefix = "payment.client")
    @Validated
    public record PaymentClientProps(
        @NotBlank String baseUrl,
        @Min(100) @Max(30000) int timeoutMs,
        @NotEmpty Map<String, String> headers
    ) {}
    ```
  - **Bind từ:** `application.yml`, env var (`PAYMENT_CLIENT_BASE_URL`), command-line (`--payment.client.base-url=...`).
  - **Profile:** `@Profile("prod")` để chỉ load bean ở môi trường đó.
  - **Secret:** Không commit secret vào Git. Dùng Vault, K8s Secret, hoặc biến môi trường từ secret manager.

#### Task 2.1.2 — REST API: resource naming, pagination, validation, error response

**Level:** Trung cấp • **Estimate:** 9h • **Deliverable:** REST API nhất quán, validate input chuẩn, error response có traceId

##### Nhánh: API contract design

*Tư duy cốt lõi: API là hợp đồng. Đổi hợp đồng = breaking change. Mọi field thêm vào response đều có thể ảnh hưởng client.*

- **2.1.2.1 Resource naming & HTTP method semantics**
  - **Resource:** Danh từ số nhiều, không chứa động từ: `/customers`, `/accounts/{id}/transactions`.
  - **HTTP method:** GET (đọc, idempotent), POST (tạo), PUT (thay thế toàn bộ), PATCH (cập nhật một phần), DELETE (xóa, idempotent).
  - **Status code:** 200 OK, 201 Created (kèm Location header), 204 No Content (PUT/DELETE thành công), 400 Bad Request (validation), 401 (chưa auth), 403 (không có quyền), 404 (không tìm thấy), 409 (conflict), 422 (validation nghiệp vụ), 500 (lỗi server).
  - **Lỗi:** `GET /getCustomer/{id}` (có động từ), `POST /deleteCustomer/{id}` (sai method), trả 200 cho lỗi.

- **2.1.2.2 Request/Response DTO contract & status code**
  - **Request DTO:** Validate `@Valid`, `@NotNull`, `@Size`, `@Pattern`. Không nhận field ngoài ý muốn.
  - **Response DTO:** Trả đúng field cần. Không trả entity.
  - **Pagination response:** Bao gồm `data`, `page`, `size`, `totalElements`, `totalPages` hoặc cursor.
  - **Lỗi production:** Trả password hash ra response vì field bị leak từ entity.

- **2.1.2.3 API versioning, idempotency, backward compatibility**
  - **Versioning:** URI (`/api/v1/...`), header (`Accept: application/vnd.myapi.v2+json`), query — URI phổ biến nhất.
  - **Idempotency:** `Idempotency-Key` header cho POST tạo giao dịch, lưu cache kết quả để retry không tạo lại.
  - **Backward compatibility:** Thêm field OK. Đổi tên field, đổi kiểu, xóa field = breaking. Luôn khai báo deprecation trước khi xóa.

##### Nhánh: Query input & validation

*Tư duy cốt lõi: Validation ở biên (controller/DTO), không phải trong service. Service chỉ validate nghiệp vụ.*

- **2.1.2.4 Pagination, sorting, filter an toàn**
  - **Pageable:** Spring Data `PageRequest.of(page, size, Sort.by(...))`.
  - **Limit size:** Tối đa size = 100 (hoặc config), chống client gửi size=1000000.
  - **Whitelist sort field:** Cho phép sort theo `createdAt, amount, status` — KHÔNG cho sort trực tiếp theo input raw (SQL injection + performance).
  - **Filter:** Validate từng filter param, dùng Specification hoặc QueryDSL.

- **2.1.2.5 Bean Validation (field, nested, custom)**
  - **Standard annotations:** `@NotNull`, `@NotBlank`, `@NotEmpty`, `@Size`, `@Min/Max`, `@Pattern`, `@Email`, `@Past/@Future`.
  - **Nested:** `@Valid` trên field object để validate cả object con.
  - **Custom:** Implement `ConstraintValidator<A, T>`, dùng `@Constraint(validatedBy = ...)`.
  - **Pattern:**
    ```java
    public class TransferRequest {
        @NotNull @Positive BigDecimal amount;
        @NotBlank @Size(min=10, max=20) String sourceAccount;
        @NotBlank String currency;
    }
    ```
  - **Lỗi:** Quên `@Valid` trên method param → validation không chạy; validate trong service thay vì controller → throw exception không chuẩn.

##### Nhánh: Error model & failure behavior

*Tư duy cốt lõi: Client không quan tâm stack trace. Client quan tâm "lỗi gì, làm gì tiếp, có thể retry không".*

- **2.1.2.6 Global exception handler**
  - **Pattern:**
    ```java
    @RestControllerAdvice
    public class GlobalExceptionHandler {
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiError> handleValidation(...) {
            return ResponseEntity.badRequest().body(new ApiError("VALIDATION_FAILED", errors, traceId));
        }
        @ExceptionHandler(NotFoundException.class)
        public ResponseEntity<ApiError> handleNotFound(...) { ... }
    }
    ```
  - **Mapping:** `NotFoundException → 404`, `ValidationException → 400`, `BusinessRuleException → 422`, mọi thứ khác → 500.
  - **Lỗi:** Trả `e.getMessage()` cho client → leak thông tin nội bộ; không log stack trace → khó debug.

- **2.1.2.7 Chuẩn hóa error code, traceId, retryable flag**
  - **Error response schema:**
    ```json
    {
      "code": "ACCOUNT_INSUFFICIENT_FUNDS",
      "message": "Số dư không đủ",
      "traceId": "7f3c9a2e-...",
      "retryable": false,
      "errors": [{"field": "amount", "reason": "must be positive"}]
    }
    ```
  - **`retryable`:** Client/server biết có nên retry hay không (`retryable=true` cho timeout, `false` cho validation).
  - **`traceId`:** Liên kết client error với log server.

#### Task 2.1.3 — AOP cho logging, audit, masking, correlation ID

**Level:** Trung cấp • **Estimate:** 9h • **Deliverable:** Aspect chuẩn cho log/audit/mask, test được

##### Nhánh: AOP foundation & proxy model

*Tư duy cốt lõi: AOP = code "cắt ngang" nhiều nơi. Spring implement bằng proxy. Proxy có giới hạn — biết trước để không debug bậy.*

- **2.1.3.1 AOP concept (join point, pointcut, advice, proxy)**
  - **Join point:** Điểm có thể chèn advice (method execution, field access...).
  - **Pointcut:** Biểu thức chọn join point (execution, within, @annotation).
  - **Advice:** Code chèn: `@Before`, `@After`, `@AfterReturning`, `@AfterThrowing`, `@Around`.
  - **Proxy:** JDK dynamic proxy (interface) hoặc CGLIB proxy (class). Spring tự chọn.

- **2.1.3.2 Proxy limitation (self-invocation, final method, ordering)**
  - **Self-invocation bug:** `this.methodB()` không qua proxy → advice không chạy. Phải inject bean khác hoặc lấy proxy qua `AopContext.currentProxy()`.
  - **Final method:** Không thể override bằng CGLIB → không qua proxy → advice không chạy.
  - **Lỗi production:** `@Transactional` ở method nội bộ gọi qua `this` → không có transaction. Phải gọi qua bean khác.

- **2.1.3.3 Test & debug aspect**
  - **Test:** Dùng `@SpringBootTest` hoặc aspect test riêng (apply aspect thủ công lên bean test).
  - **Debug:** Bật log `org.springframework.aop` ở DEBUG; dùng `MethodInterceptor` để print before/after.

##### Nhánh: Cross-cutting logging/audit use cases

*Tư duy cốt lõi: Logging/audit ở AOP tránh lặp code, nhưng phải biết "cắt ở đâu" để không miss hoặc log quá nhiều.*

- **2.1.3.4 Logging aspect (input/output, latency, correlation ID)**
  - **Pattern:** `@Around` quanh `@Service` method, log method name, args (masked), return, latency, correlation ID.
  - **Correlation ID:** Lấy từ header `X-Correlation-ID` hoặc sinh UUID, lưu MDC, log tự động kèm.

- **2.1.3.5 Audit aspect (actor, action, resource, outcome)**
  - **Actor:** Từ SecurityContext (`Authentication.getName()`).
  - **Action:** Method name hoặc custom annotation.
  - **Resource:** ID trong args.
  - **Outcome:** Thành công hay thất bại, lý do.
  - **Lưu ý:** Audit log phải immutable, tách khỏi log thường, có thể ghi DB riêng.

##### Nhánh: Sensitive data handling

*Tư duy cốt lõi: PII trong log = vi phạm compliance. Mask từ aspect, đừng hy vọng developer nhớ mask.*

- **2.1.3.6 Masking dữ liệu nhạy cảm**
  - **Mask pattern:** `toJsonString` rồi replace field nhạy cảm, hoặc custom serializer với `JsonSerializer<T>`.
  - **Field cần mask:** `password`, `cardNumber`, `cvv`, `email` (hash), `phone` (một phần), `token`, `idNumber`.
  - **Lỗi production:** Log cả `User(id=1, password='abc123', ...)` → leak password.

- **2.1.3.7 Test masking PII trong log**
  - **Test:** Capture log (Logback `ListAppender`), chạy service, assert log không chứa field nhạy cảm.
  - **Mẹo:** Test với payload đặc biệt: `"PASSWORD=123"`, `"card_number": "4111111111111111"` → verify bị mask.

### 2.2 Module: Persistence layer

#### Task 2.2.1 — Transaction: propagation, isolation, rollback, read-only, self-invocation

**Level:** Nâng cao • **Estimate:** 9h • **Deliverable:** Thiết kế transaction đúng, debug rollback sai

##### Nhánh: Transaction boundary & propagation

*Tư duy cốt lõi: Transaction phải bắt đầu ở đúng tầng. Thường là ở service entry point, không ở repository.*

- **2.2.1.1 Propagation (REQUIRED, REQUIRES_NEW, SUPPORTS, MANDATORY, NESTED)**
  - **REQUIRED (mặc định):** Có tx rồi thì dùng, chưa có thì tạo.
  - **REQUIRES_NEW:** Luôn tạo tx mới, tx cũ suspend. Dùng khi cần commit độc lập (audit log, outbox).
  - **SUPPORTS:** Có thì dùng, không có chạy non-transactional.
  - **MANDATORY:** Bắt buộc phải có tx sẵn, không có → throw.
  - **NESTED:** Savepoint trong tx hiện tại (chỉ một số DB hỗ trợ).
  - **Lỗi:** Dùng `REQUIRES_NEW` quá nhiều → suspend/resume tốn kém; dùng `REQUIRED` cho audit trong cùng business → audit fail theo business fail → mất audit.

- **2.2.1.2 Isolation (dirty read, non-repeatable read, phantom read)**
  - **4 level:** READ_UNCOMMITTED → READ_COMMITTED → REPEATABLE_READ (MySQL default) → SERIALIZABLE.
  - **3 hiện tượng:**
    - Dirty read: đọc dữ liệu chưa commit.
    - Non-repeatable read: cùng query, cùng tx, lần 2 thấy dữ liệu khác.
    - Phantom read: cùng query range, lần 2 thấy thêm row mới.
  - **Banking:** Thường chọn READ_COMMITTED (Oracle) hoặc REPEATABLE_READ (MySQL) + pessimistic lock cho update quan trọng.

##### Nhánh: Rollback & proxy behavior

*Tư duy cốt lõi: Mặc định rollback cho RuntimeException. Checked exception không rollback. Biết để không code nhầm.*

- **2.2.1.3 Rollback rule**
  - **Mặc định:** Rollback cho `RuntimeException` + `Error`. KHÔNG rollback cho checked exception.
  - **Custom:** `@Transactional(rollbackFor = Exception.class)` để rollback cho cả checked.
  - **No rollback:** `@Transactional(noRollbackFor = BusinessValidationException.class)` — dùng khi cần commit dù có lỗi nghiệp vụ cụ thể.
  - **Lỗi production:** Throw `Exception` (checked) → không rollback → DB lưu data lỗi.

- **2.2.1.4 Self-invocation & proxy limitation**
  - **Bug:** Method A trong cùng class gọi `this.methodB()` → methodB có `@Transactional` không có tác dụng.
  - **Fix:** Tách methodB sang bean khác, hoặc inject `self` qua `@Lazy`, hoặc lấy qua `AopContext.currentProxy()` (cần `@EnableAspectJAutoProxy(exposeProxy = true)`).

##### Nhánh: Locking, deadlock, timeout

*Tư duy cốt lõi: Pessimistic lock = khóa từ đầu, an toàn nhưng giảm concurrency. Optimistic lock = check ở commit, nhanh nhưng phải retry. Chọn đúng theo tần suất xung đột.*

- **2.2.1.5 Transaction lock, deadlock, timeout**
  - **Pessimistic:** `SELECT ... FOR UPDATE` → lock row, transaction khác đợi.
  - **Optimistic:** `@Version` column → check version lúc commit, nếu khác → `OptimisticLockException`.
  - **Deadlock:** 2 transaction giữ lock chéo. DB tự phát hiện và rollback 1 bên.
  - **Timeout:** `@Transactional(timeout = 5)` → rollback sau 5s. Phòng lock kẹt lâu.
  - **Lỗi:** Lock quá rộng (`SELECT * FOR UPDATE`) → giảm concurrency; retry không max attempt → kéo dài tải.

- **2.2.1.6 Phân tích deadlock report**
  - **Báo cáo:** DB log hoặc Spring exception cho biết session nào giữ lock nào, đợi lock nào.
  - **Retry:** Có giới hạn (3 lần), backoff, log đầy đủ để debug.
  - **Phòng tránh:** Lock cùng thứ tự ở mọi nơi; giữ critical section ngắn.

#### Task 2.2.2 — Hibernate/JPA: entity state, lazy/eager, N+1, optimistic locking

**Level:** Nâng cao • **Estimate:** 9h • **Deliverable:** Entity đúng state, query performance tốt, conflict handling chuẩn

##### Nhánh: Persistence context & entity lifecycle

*Tư duy cốt lõi: Persistence context là "vùng nhớ tạm" của Hibernate. Hiểu nó để biết khi nào flush, khi nào dirty checking xảy ra.*

- **2.2.2.1 Entity lifecycle (transient, managed, detached, removed)**
  - **Transient:** Vừa `new`, chưa có id, chưa liên kết persistence context.
  - **Managed:** Đã có id, đang được quản lý bởi persistence context, thay đổi field sẽ tự flush thành UPDATE.
  - **Detached:** Có id nhưng không còn trong persistence context (sau transaction, sau `detach()`).
  - **Removed:** Đánh dấu xóa, sẽ DELETE lúc flush.
  - **Lỗi:** Thay đổi entity sau khi transaction đóng → không có tác dụng (detached).

- **2.2.2.2 Persistence context, dirty checking, flush**
  - **Dirty checking:** Hibernate tự so sánh snapshot lúc load và state hiện tại → nếu khác → UPDATE lúc flush.
  - **Flush timing:** Trước commit, trước JPQL query, gọi `entityManager.flush()`. Mặc định auto flush.
  - **Lỗi:** Setter Hibernate sinh ra nhưng entity là record (immutable) → không thể dirty checking.

- **2.2.2.3 Cascade, orphanRemoval, transaction boundary**
  - **Cascade:** Cascade thao tác cha xuống con (PERSIST, MERGE, REMOVE, ALL).
  - **orphanRemoval:** Xóa con khi bị tách khỏi collection cha.
  - **Quy tắc:** Cascade chỉ giữa aggregate root và aggregate child. Không cascade giữa 2 aggregate khác nhau.
  - **Transaction:** Mọi cascade operation phải trong cùng transaction.

##### Nhánh: Fetch strategy & query performance

*Tư duy cốt lõi: 90% bug performance JPA là do lazy loading sai hoặc N+1.*

- **2.2.2.4 Lazy/Eager loading & LazyInitializationException**
  - **Lazy:** Không load quan hệ cho đến khi truy cập. Mặc định cho `@OneToMany`, `@ManyToMany`.
  - **Eager:** Load luôn quan hệ. Mặc định cho `@ManyToOne`, `@OneToOne`.
  - **LazyInitializationException:** Truy cập quan hệ lazy ngoài transaction → throw. Fix: fetch trong transaction hoặc dùng DTO query.
  - **Best practice:** Mặc định LAZY cho mọi quan hệ. Fetch theo query cụ thể (fetch join, entity graph).

- **2.2.2.5 N+1 query — detect & fix**
  - **Phát hiện:** Bật SQL log, thấy 1 query lặp N lần với ID khác nhau.
  - **Fix:**
    - `@EntityGraph(attributePaths = "items")` — Spring Data.
    - `JOIN FETCH` trong JPQL.
    - `@BatchSize` để load theo batch (khi không thể join).
  - **Đo lường:** Spring Boot Actuator + SQL log + JPA statistics.

##### Nhánh: Concurrency conflict handling

*Tư duy cốt lõi: Optimistic locking tốt cho read-then-update ít xung đột. Pessimistic tốt cho xung đột cao và update ngắn.*

- **2.2.2.6 Optimistic locking với `@Version`**
  - **Cơ chế:** Cột version tăng mỗi lần UPDATE. WHERE clause thêm `AND version = ?`. Nếu version đã đổi → update 0 rows → `OptimisticLockingFailureException`.
  - **Khi dùng:** UI edit form, người dùng đọc rồi sửa sau, xung đột thấp.
  - **Retry:** Bắt exception, retry read-update (có max attempt).

- **2.2.2.7 Retry optimistic lock có giới hạn**
  - **Pattern:**
    ```java
    for (int i = 0; i < MAX_RETRY; i++) {
        try {
            // read-modify-write
            return result;
        } catch (OptimisticLockingFailureException e) {
            if (i == MAX_RETRY - 1) throw new ConcurrentModificationException("...");
        }
    }
    ```
  - **Lỗi:** Retry không giới hạn → treo thread; không cho user biết → user bấm nhiều lần không ra.

#### Task 2.2.3 — JdbcTemplate, stored procedure, REF CURSOR, banking mapper

**Level:** Nâng cao • **Estimate:** 8h • **Deliverable:** Adapter gọi stored procedure core banking chuẩn

##### Nhánh: JdbcTemplate foundation

*Tư duy cốt lõi: Khi cần kiểm soát SQL tuyệt đối (core banking adapter), JdbcTemplate là bạn — không che giấu SQL.*

- **2.2.3.1 JdbcTemplate query/update & named parameter**
  - **Query:** `jdbcTemplate.query("SELECT ... WHERE id = ?", rowMapper, id)`.
  - **NamedParameterJdbcTemplate:** Dùng `:name` cho dễ đọc: `query("SELECT * WHERE status = :status", Map.of("status", "ACTIVE"), rowMapper)`.
  - **Batch update:** `jdbcTemplate.batchUpdate(...)` cho insert/update hàng loạt.
  - **Lỗi:** Dùng String concatenation SQL → SQL injection. LUÔN dùng parameter binding.

- **2.2.3.2 Transaction, timeout, exception translation**
  - **JdbcTemplate** tự tham gia transaction Spring nếu có.
  - **Timeout:** `@Transactional(timeout = 5)` hoặc `jdbcTemplate.setQueryTimeout(5)`.
  - **Exception translation:** `SQLException` → `DataAccessException` (Spring's hierarchy).

##### Nhánh: Stored procedure integration

*Tư duy cốt lõi: Core banking thường cung cấp API qua stored procedure. Adapter phải đóng gói gọn, test được.*

- **2.2.3.3 Stored procedure call: SimpleJdbcCall**
  - **Pattern:**
    ```java
    SimpleJdbcCall call = new SimpleJdbcCall(dataSource)
        .withProcedureName("PROC_GET_ACCOUNT")
        .declareParameters(new SqlParameter("p_account_no", Types.VARCHAR));
    Map<String, Object> result = call.execute(Map.of("p_account_no", "1234567890"));
    ```
  - **Output param:** Declare `SqlOutParameter` cho output scalar.
  - **REF CURSOR:** Declare `SqlOutParameter("p_cursor", Types.REF_CURSOR)` rồi map thủ công.

- **2.2.3.4 REF CURSOR mapping sang DTO**
  - **Pattern:**
    ```java
    SimpleJdbcCall call = new SimpleJdbcCall(dataSource)
        .withProcedureName("PROC_LIST_ACCOUNTS")
        .declareParameters(new SqlOutParameter("p_cursor", Types.REF_CURSOR))
        .returningResultSet("p_cursor", new AccountRowMapper());
    List<Account> accounts = (List<Account>) call.execute().get("p_cursor");
    ```
  - **RowMapper:** Implement interface `RowMapper<T>` để map 1 row.

##### Nhánh: Banking mapper & test strategy

*Tư duy cốt lõi: Test adapter = fake database layer. Không cần DB thật để test logic mapping.*

- **2.2.3.5 RowMapper / ResultSetExtractor**
  - **RowMapper:** Map 1 row → 1 object. Dùng cho query đơn giản.
  - **ResultSetExtractor:** Map cả ResultSet → 1 object phức tạp (group, aggregate, multi-level). Dùng cho kết quả gộp.
  - **Lỗi:** Không đóng ResultSet — để JdbcTemplate quản lý; quên `rs.wasNull()` khi check null numeric.

- **2.2.3.6 Test stored procedure adapter bằng fake/stub**
  - **Pattern:** Tách interface `BankingGateway`, có `RealBankingGateway` gọi JdbcTemplate, `FakeBankingGateway` trả data cứng.
  - **Test:** Inject `FakeBankingGateway`, test service không phụ thuộc DB thật.
  - **Mock JdbcTemplate:** Hoặc dùng `H2` + schema test để chạy procedure thật.

#### Task 2.2.4 — MapStruct và request/response contract

**Level:** Trung cấp • **Estimate:** 9h • **Deliverable:** DTO mapping tự động, contract rõ ràng

##### Nhánh: Contract boundary & validation

*Tư duy cốt lõi: Mỗi ranh giới có một loại DTO. Trộn ranh giới = rò rỉ dữ liệu + khó evolve.*

- **2.2.4.1 DTO boundary (request, response, command, event)**
  - **Request:** Từ client vào, validate chặt, chỉ field cho phép.
  - **Response:** Từ server ra, chỉ field muốn expose.
  - **Command:** Internal handler input (CQRS), có thể khác request.
  - **Event:** Message gửi Kafka/Rabbit, có schema version, thường chứa đủ context.
  - **Lỗi:** Dùng chung DTO cho cả request và response → không filter được, validate phải 2 chiều.

- **2.2.4.2 Validation contract giữa DTO và domain**
  - **Quy tắc:** Validate format/required ở DTO (`@NotBlank`). Validate nghiệp vụ ở domain/service (Money không âm, đủ số dư).
  - **Lỗi:** Validate hết ở DTO → service phải validate lại vì DTO chỉ validate format.

- **2.2.4.3 Versioning response contract**
  - **Pattern:** Dùng `record` với field mới là optional, không xóa field cũ (giữ một thời gian deprecation), dùng `JsonInclude.Include.NON_NULL` để không trả null.

##### Nhánh: MapStruct generated mapping

*Tư duy cốt lõi: MapStruct sinh code lúc compile → không reflection runtime, nhanh, debug được.*

- **2.2.4.4 MapStruct basic mapping**
  - **Pattern:**
    ```java
    @Mapper(componentModel = "spring")
    public interface OrderMapper {
        OrderDto toDto(Order order);
        List<OrderDto> toDtos(List<Order> orders);
        @Mapping(target = "id", ignore = true)
        Order toEntity(CreateOrderRequest request);
    }
    ```
  - **Generated:** `mvn compile` → `target/generated-sources/annotations/` có `OrderMapperImpl.java`.
  - **Lỗi:** Map từ entity có field lazy → trigger lazy load ngoài transaction → LazyInitializationException.

- **2.2.4.5 Nested mapping, collection, enum**
  - **Nested:** MapStruct tự map theo cùng tên field; khác tên dùng `@Mapping(source = "customer.name", target = "customerName")`.
  - **Collection:** Tự map `List<A> -> List<B>` nếu có mapper A→B.
  - **Enum:** Map theo tên, hoặc custom với `@ValueMapping`.

##### Nhánh: Partial update & compatibility

*Tư duy cốt lõi: PATCH phân biệt được 3 trạng thái — null (không gửi), missing (không có field), và empty (gửi rỗng để clear).*

- **2.2.4.6 Partial update, nullValuePropertyMappingStrategy**
  - **Pattern:** `MapStruct` config `nullValuePropertyMappingStrategy = IGNORE` → null field không ghi đè lên entity.
  - **Lỗi:** PATCH update không có field → MapStruct set null → mất data cũ.

- **2.2.4.7 PATCH contract: phân biệt null vs missing**
  - **Vấn đề:** JSON `{"name": null}` (clear value) vs `{}` (không đổi) vs không có field (cũng không đổi nhưng Java POJO cả 2 = null).
  - **Pattern:** Dùng `JsonNullable<T>` (openapi-tools) hoặc `Optional<T>` để biểu diễn "có thể set hoặc không".
  - **Backend:** Phân biệt rõ 3 trạng thái; chỉ update field nào client thực sự gửi.


---

## Track 3: Microservices, Spring Cloud & Event-Driven (4 tuần)

> **Mục tiêu track:** Thiết kế service có ranh giới rõ, giao tiếp ổn định, chịu lỗi tốt và phù hợp hệ thống ngân hàng.
> **Kỹ năng chính:** `Microservices` `Spring Cloud` `Spring Cloud Gateway` `Eureka` `OpenFeign` `Apache Kafka` `Resilience4j` `API Gateway`

### 3.1 Module: Thiết kế service

#### Task 3.1.1 — Bounded context, database per service, shared library, contract-first API

**Level:** Trung cấp • **Estimate:** 9h • **Deliverable:** Domain boundary đúng, contract-first OpenAPI/AsyncAPI

##### Nhánh: Domain boundary design

*Tư duy cốt lõi: Microservice thất bại không phải vì "quá nhỏ". Mà vì ranh giới sai → coupling ngầm → deploy mọi thứ cùng nhau.*

- **3.1.1.1 Bounded context & ownership**
  - **Bounded context:** Ranh giới nơi một domain model có ý nghĩa nhất quán. "Account" trong Identity ≠ "Account" trong Banking ≠ "Account" trong Payment.
  - **Ownership:** Mỗi context chịu trách nhiệm về dữ liệu và vòng đời của mình. Không ai khác được sửa.
  - **Pattern:** Vẽ context map (DDD) trước khi code. Mỗi context = 1 service + 1 database.

- **3.1.1.2 Service boundary theo business capability**
  - **Cách cắt:** Theo khả năng nghiệp vụ ("What the business does"), không theo layer kỹ thuật.
  - **Anti-pattern:** Mỗi service = 1 entity (User Service, Order Service, Product Service = trùng bounded context).

- **3.1.1.3 Migration từ monolith sang service nhỏ**
  - **Strangler fig:** Xây service mới bên cạnh monolith, route traffic dần sang, gỡ phần cũ khi ổn.
  - **Bước đầu:** Tách read-only service (query) trước; write-heavy sau.

##### Nhánh: Data ownership & coupling control

*Tư duy cốt lõi: Không bao giờ query trực tiếp DB của service khác. Kể cả "chỉ đọc". Mọi access phải qua API/event.*

- **3.1.1.4 Database per service & dữ liệu duplicate có kiểm soát**
  - **Quy tắc:** Mỗi service sở hữu DB/schema riêng. Service khác muốn dữ liệu → API/event/read model.
  - **Duplicate có kiểm soát:** Service A cần customer name → duplicate vào DB mình, đồng bộ qua event. Có stale, nhưng có ownership rõ.
  - **Anti-pattern:** Nhiều service truy cập cùng DB → coupling DB, deploy coupling, "microservice nhưng chung DB".

- **3.1.1.5 Shared library — khi nào dùng, khi nào coupling**
  - **Nên dùng:** Common logging, exception, security utility, OpenAPI Feign client stub, DTO contract.
  - **KHÔNG nên dùng:** Business logic, entity JPA, repository, config runtime.
  - **Dấu hiệu coupling:** Mỗi lần đổi 1 service, phải bump version shared lib, đổi 5 service khác theo.

##### Nhánh: Contract-first integration

*Tư duy cốt lõi: Contract trước, code sau. Ngược lại = integration hell khi có 10+ team.*

- **3.1.1.6 Contract-first API với OpenAPI/AsyncAPI**
  - **OpenAPI:** Cho REST. File yaml/json mô tả endpoint, schema, security, example. Generator sinh client/server stub, validate payload.
  - **AsyncAPI:** Cho event-driven (Kafka, Rabbit). Mô tả channel, message, schema.
  - **Quy trình:** Designer/maintainer viết yaml → review → commit → CI generate code → team implement.
  - **Lợi ích:** Client biết chính xác format trước khi server code xong; review schema độc lập.

- **3.1.1.7 Consumer-driven contract & backward-compatible**
  - **CDC:** Consumer viết expectation của mình → provider verify → release đảm bảo không break.
  - **Tool:** Pact (Spring Cloud Contract).
  - **Backward compatible:**
    - Thêm field optional OK.
    - Đổi tên field, xóa field, đổi kiểu = breaking.
    - Dùng `JsonAlias` hoặc giữ field cũ + thêm field mới một thời gian.

#### Task 3.1.2 — Spring Cloud Gateway: routing, filter, auth, rate limit

**Level:** Trung cấp • **Estimate:** 8h • **Deliverable:** Gateway chuẩn production với routing, filter, observability

##### Nhánh: Routing & filter chain

*Tư duy cốt lõi: Gateway = single entry point. Mọi request đi qua nó. Mọi policy có thể enforce ở đây.*

- **3.1.2.1 Gateway routing theo path/host/discovery**
  - **Cấu trúc:** `route = predicate + filter + uri`.
  - **Predicate:** `Path=/api/payments/**`, `Host=admin.example.com`, `Method=POST`, header check.
  - **URI:** `lb://payment-service` (load balanced qua Eureka), hoặc `http://10.0.0.5:8080` (direct).
  - **Lỗi:** Route không có filter → vẫn chạy nhưng không xử lý gì; route uri trỏ localhost → không phân biệt môi trường.

- **3.1.2.2 Pre/Post filter & ordering**
  - **Pre:** Trước khi forward (auth, rate limit, correlation ID).
  - **Post:** Sau khi response (log latency, transform response).
  - **Ordering:** `Ordered.HIGHEST_PRECEDENCE` → `LOWEST_PRECEDENCE`. Cùng order, sort theo class name. Quan trọng với auth filter (chạy trước business filter).

##### Nhánh: Policy enforcement at edge

*Tư duy cốt lõi: Gateway chặn request rác, downstream vẫn phải tự bảo vệ.*

- **3.1.2.3 Auth policy tại Gateway vs downstream**
  - **Tại Gateway:** Xác thực JWT, kiểm tra signature, scope cơ bản. Tránh traffic rác đi vào.
  - **Tại downstream:** Authorization chi tiết (object-level — user có quyền truy cập account này không). Không tin Gateway vì service khác có thể gọi trực tiếp.
  - **Lỗi:** Chỉ auth ở Gateway → internal service gọi nhau là anonymous → BOLA (Broken Object Level Authorization).

- **3.1.2.4 Rate limit theo user/client/IP**
  - **Key:** IP, user ID, client ID, hoặc kết hợp.
  - **Algorithm:** Token bucket, sliding window, fixed window.
  - **Tool:** Bucket4j + Redis, hoặc Spring Cloud Gateway `RequestRateLimiter`.
  - **Lỗi:** Rate limit chỉ theo IP → user hợp lệ bị chặn khi dùng chung NAT; rate limit không có fallback khi Redis down → bypass hoàn toàn.

##### Nhánh: Runtime reliability & observability

*Tư duy cốt lõi: Timeout ở Gateway quan trọng hơn service. Vì Gateway gọi tiếp xuống service, nếu Gateway không timeout thì request chờ mãi.*

- **3.1.2.5 Timeout, retry, response mapping tại Gateway**
  - **Timeout:** Đặt ở filter để release connection. Không nên > timeout của downstream service.
  - **Retry:** Chỉ retry method idempotent (GET, PUT, DELETE). KHÔNG retry POST trừ khi có idempotency key.
  - **Response mapping:** Gateway có thể transform response (thêm header, đổi format) nhưng cẩn thận breaking client expectation.

- **3.1.2.6 Observability cho gateway (log, metric, trace)**
  - **Log:** MDC correlation ID, request URI, status, latency, client IP.
  - **Metric:** Request count theo route/status, latency histogram, error rate.
  - **Trace:** OpenTelemetry/Sleuth, propagate trace ID từ Gateway xuống downstream.

#### Task 3.1.3 — Eureka/OpenFeign: discovery, timeout, retry, fallback, error decoder

**Level:** Trung cấp • **Estimate:** 9h • **Deliverable:** Service discovery + Feign client chuẩn production

##### Nhánh: Discovery & client integration

*Tư duy cốt lõi: Eureka trả lời "service X đang ở đâu". Feign giúp gọi service X như gọi Java method.*

- **3.1.3.1 Eureka service registration & heartbeat**
  - **Cơ chế:** Service gửi register + heartbeat định kỳ (default 30s). Eureka lưu registry; nếu 90s không heartbeat → remove.
  - **Self-preservation:** Eureka bật chế độ "bảo vệ bản thân" khi mất nhiều heartbeat cùng lúc (có thể network issue, không phải service chết) → không evict ai.
  - **Lỗi:** Eureka single instance → SPOF; service IP thay đổi → cần health check URL `/actuator/health` để Eureka biết service còn sống.

- **3.1.3.2 Client-side discovery & load balancing**
  - **Pattern:** Client gọi Eureka lấy danh sách instance → chọn instance (random/round-robin/least connection) → gọi trực tiếp. So với server-side (nginx/ELB).
  - **Spring Cloud LoadBalancer:** Thay Ribbon (deprecated).
  - **Lỗi:** Stale registry → gọi vào instance đã chết. Cần retry + circuit breaker.

- **3.1.3.3 OpenFeign contract, encoder/decoder, interceptor**
  - **Declarative HTTP client:** Khai báo interface + annotation, Feign sinh implementation.
  - **Encoder:** Request body → JSON (mặc định Jackson).
  - **Decoder:** Response JSON → object.
  - **Interceptor:** Thêm header, log, correlation ID. Spring Cloud OpenFeign auto-bind `HttpMessageConverters`.
  - **Lỗi:** Đặt Feign ở layer controller → không test được business logic.

##### Nhánh: Timeout/retry resilience

*Tư duy cốt lõi: Connect timeout ngắn (lỗi mạng), read timeout dài hơn (chờ response). Không trộn 2 thành 1 timeout.*

- **3.1.3.4 Timeout tách connect/read**
  - **Connect timeout:** Thời gian chờ thiết lập TCP connection. Ngắn (1-3s).
  - **Read timeout:** Thời gian chờ response. Dài hơn (5-30s).
  - **Pattern (Feign):**
    ```yaml
    feign:
      client:
        config:
          default:
            connectTimeout: 2000
            readTimeout: 8000
    ```
  - **Lỗi:** Timeout chung = 30s → cả connect và read → nếu instance chết, request chờ 30s rồi mới biết.

- **3.1.3.5 Retry/fallback & tránh retry storm**
  - **Retry:** Max 2-3 lần, exponential backoff + jitter. Chỉ retry method idempotent.
  - **Retry storm:** Downstream chậm → retry nhiều → càng chậm hơn → retry nhiều hơn. Fix: circuit breaker mở → fail fast.
  - **Lỗi:** Retry POST tạo giao dịch không có idempotency key → tạo trùng.

##### Nhánh: Downstream error normalization

*Tư duy cốt lõi: Lỗi downstream phải được dịch sang ngôn ngữ domain mình. Đừng để 5xx throw lên UI.*

- **3.1.3.6 ErrorDecoder & chuẩn hóa lỗi**
  - **Pattern:**
    ```java
    public class PaymentErrorDecoder implements ErrorDecoder {
        @Override
        public Exception decode(String methodKey, Response response) {
            return switch (response.status()) {
                case 404 -> new AccountNotFoundException(...);
                case 409 -> new DuplicateRequestException(...);
                case 503 -> new ServiceUnavailableException(...);
                default -> new FeignException(...);
            };
        }
    }
    ```
  - **Quy tắc:** Map status code → domain exception. Đừng để raw `FeignException` chạy khắp codebase.

- **3.1.3.7 Mapping lỗi downstream sang domain error**
  - **Pattern:** Catch exception ở service → map sang `BusinessException` có error code, retryable flag, message phù hợp ngữ cảnh.
  - **Lỗi:** UI hiển thị "Connection refused to 10.0.5.23:8080" → leak thông tin hạ tầng.

### 3.2 Module: Event-driven & resilience

#### Task 3.2.1 — Kafka: topic, partition, consumer group, offset, retry, DLQ

**Level:** Nâng cao • **Estimate:** 9h • **Deliverable:** Kafka pipeline chuẩn production

##### Nhánh: Topic & message contract

*Tư duy cốt lõi: Topic design sai = re-partition toàn hệ thống = downtime. Phải thiết kế trước, đừng "để sau".*

- **3.2.1.1 Topic design, event naming, retention**
  - **Topic design:** 1 topic per business event type (PaymentAuthorized, OrderPlaced). Tránh 1 topic gộp nhiều event.
  - **Naming:** `domain.entity.action` (PaymentAuthorized, AccountDebited). Past tense — sự kiện đã xảy ra.
  - **Retention:** Theo thời gian (7 ngày, 30 ngày) hoặc dung lượng. Hoặc compact cho CDC.
  - **Lỗi:** Topic "events" gộp mọi thứ → consumer phải filter → khó scale, khó replay.

- **3.2.1.2 Schema evolution & compatibility**
  - **Schema registry:** Confluent Schema Registry, Apicurio. Lưu schema version, enforce compatibility.
  - **Backward compatible:** Thêm field optional, đổi tên (dùng alias), dùng default value.
  - **Breaking:** Đổi kiểu field, xóa required field.
  - **Strategy:** Luôn dùng schema registry + test compatibility trong CI.

##### Nhánh: Partition, producer, consumer runtime

*Tư duy cốt lõi: Ordering chỉ trong cùng partition. Cùng business key → cùng partition. Khác business key → có thể khác partition → không đảm bảo ordering.*

- **3.2.1.3 Partition key, ordering, parallelism**
  - **Partition:** Kafka chia topic thành nhiều "log nhỏ" độc lập. Mỗi partition là 1 ordered sequence.
  - **Ordering guarantee:** Trong cùng partition. Không có global order.
  - **Partition key:** Hàm hash của key → partition. Cùng key → cùng partition → cùng order.
  - **Lỗi:** Không set key → partition round-robin → 2 event liên quan có thể đến 2 consumer khác nhau → xử lý sai thứ tự.

- **3.2.1.4 Consumer group, rebalance, offset commit**
  - **Consumer group:** Nhóm consumer chia tải. Mỗi partition cho 1 consumer tại 1 thời điểm.
  - **Rebalance:** Phân phối lại khi consumer join/leave/chết. Trong lúc rebalance, consumer không xử lý.
  - **Offset commit:**
    - Auto commit (default): dễ mất message nếu crash trước commit.
    - Manual commit sau xử lý: an toàn hơn nhưng chậm.
    - Manual commit batch: tốt nhất cho throughput, nhưng mất nếu crash.
  - **Lỗi:** Auto commit trước khi xử lý xong → mất message; commit quá thường xuyên → throughput thấp.

- **3.2.1.5 Producer acks, retries, idempotent producer**
  - **`acks=0`:** Không chờ ack → nhanh nhưng mất message.
  - **`acks=1`:** Chờ leader → leader nhận là xong, replica chưa sync. Cân bằng.
  - **`acks=all` (default):** Chờ tất cả in-sync replica → an toàn nhất, chậm nhất.
  - **Idempotent producer:** `enable.idempotence=true` → producer đảm bảo không duplicate message do retry.
  - **Lỗi:** Dùng `acks=0` cho transaction tiền → mất message, mất tiền trace.

##### Nhánh: Failure handling pipeline

*Tư duy cốt lõi: Retry có giới hạn. Sau giới hạn → DLQ. Operator xử lý DLQ, không phải code retry.*

- **3.2.1.6 Retry topic, backoff, DLQ**
  - **Retry topic:** Topic riêng chứa message lỗi, schedule lại sau backoff (1s, 5s, 30s, 5m).
  - **DLQ:** Message retry hết → chuyển sang DLQ để operator xem xét.
  - **Spring Kafka:** `@RetryableTopic` hoặc `RetryTopicConfiguration` tự động tạo retry topic + DLT.
  - **Lỗi:** Retry vô hạn → message "độc" block partition; DLQ không ai đọc → tích lũy.

- **3.2.1.7 Poison message & DLQ replay**
  - **Poison message:** Message không thể xử lý dù retry bao nhiêu lần (format sai, business rule vi phạm không thể skip).
  - **DLQ replay:** Operator xem, fix root cause, viết tool replay message từ DLQ về main topic.
  - **Tool:** Kafka tool (Conduktor), hoặc custom Spring Boot admin app.

#### Task 3.2.2 — Idempotency, duplicate prevention, outbox, saga compensation

**Level:** Nâng cao • **Estimate:** 8h • **Deliverable:** Đảm bảo exactly-once ở mức business

##### Nhánh: Duplicate-safe request handling

*Tư duy cốt lõi: Network không đảm bảo exactly-once. Client retry, server phải chịu. Idempotency key là cách chuẩn.*

- **3.2.2.1 Idempotency key & request replay**
  - **Cơ chế:** Client gửi `Idempotency-Key` header. Server lưu key + response trong TTL. Nếu key đã thấy → trả lại response cũ, không xử lý lại.
  - **TTL:** Đủ dài để cover retry window (24h thường an toàn).
  - **Storage:** Redis (nhanh) hoặc DB (bền).
  - **Lỗi:** Không có idempotency key cho POST tạo giao dịch → retry tạo trùng → khách hàng bị trừ tiền 2 lần.

- **3.2.2.2 Duplicate prevention ở API, DB, message consumer**
  - **API:** Idempotency key (như trên).
  - **DB:** Unique constraint trên reference_id, idempotency_key.
  - **Consumer:** Lưu processed message ID; check trước khi xử lý; hoặc dùng DB unique constraint cho business key.

##### Nhánh: Outbox event consistency

*Tư duy cốt lõi: "Insert DB rồi publish Kafka" không atomic. Outbox = insert event vào DB cùng transaction, relay đọc và publish.*

- **3.2.2.3 Outbox pattern (write business + event atomically)**
  - **Cơ chế:**
    ```java
    @Transactional
    public void processOrder(Order order) {
        orderRepository.save(order);
        outboxRepository.save(new OutboxEvent("ORDER_PLACED", order.toJson()));
    }
    ```
  - **Relay:** Background job đọc `outbox_events` chưa publish, publish lên Kafka, đánh dấu published.
  - **Lỗi:** Publish trước khi commit DB → DB rollback nhưng event đã bay → mất consistency.

- **3.2.2.4 Outbox relay, ordering, retry**
  - **Ordering:** Relay phải theo thứ tự insert (có thể dùng `created_at` + `id`). Một partition có thể dùng một relay single-thread.
  - **Retry:** Nếu publish fail, retry với backoff. Sau N lần → DLQ outbox.
  - **Tool:** Debezium CDC (đọc binlog), hoặc custom poller.

##### Nhánh: Saga & compensation

*Tư duy cốt lõi: Distributed transaction 2PC không khả thi. Saga = eventual consistency + compensation khi lỗi.*

- **3.2.2.5 Saga orchestration vs choreography**
  - **Orchestration:** Central orchestrator điều phối từng bước. Service thực hiện, báo lại. Dễ theo dõi nhưng coupling.
  - **Choreography:** Mỗi service tự quyết định bước tiếp dựa trên event. Loose coupling nhưng khó trace.
  - **Banking:** Orchestration phù hợp vì cần audit trail rõ ràng.

- **3.2.2.6 Compensation khi một bước fail**
  - **Pattern:** Mỗi step có `compensate()` method (ngược lại của `execute()`). Khi step fail, chạy compensation cho các step đã commit trước đó.
  - **Lỗi:** Compensation cũng fail → cần "saga recovery" process, hoặc manual intervention.
  - **Lưu ý:** Compensation không phải rollback — nó là business action đảo ngược (refund, cancel reservation).

#### Task 3.2.3 — Resilience4j: timeout, retry, circuit breaker, bulkhead, rate limiter

**Level:** Nâng cao • **Estimate:** 9h • **Deliverable:** Resilience layer cho mọi outbound call

##### Nhánh: Latency budget & retry control

*Tư duy cốt lõi: Mỗi call ra ngoài cần timeout. Mỗi retry cần budget. Cộng tất cả lại phải < total request budget.*

- **3.2.3.1 Timeout budget & propagation**
  - **Budget:** Tổng request = 800ms. Internal 100ms + DB 200ms + External 400ms + margin 100ms.
  - **Propagation:** Truyền deadline qua context (ThreadLocal, hoặc Header `X-Request-Deadline`). Mỗi downstream tự cắt deadline còn lại.
  - **Lỗi:** Không có deadline propagation → 5 service cộng timeout 5*5s = 25s, vượt budget.

- **3.2.3.2 Retry policy (max attempts, backoff, jitter)**
  - **Max attempts:** 3 thường đủ. > 3 thì có vấn đề khác (dependency broken).
  - **Backoff:** Exponential (1s, 2s, 4s, 8s).
  - **Jitter:** Random 0-50% để tránh thundering herd.
  - **Lỗi:** Retry không có jitter → nhiều client retry cùng lúc → "synchronized stampede".

##### Nhánh: Failure isolation patterns

*Tư duy cốt lõi: Bulkhead = "vách ngăn". Lỗi 1 chỗ không kéo sập toàn bộ.*

- **3.2.3.3 Circuit breaker states & half-open probe**
  - **3 trạng thái:**
    - CLOSED: Bình thường, đi qua.
    - OPEN: Quá nhiều lỗi → fail fast, không gọi xuống.
    - HALF_OPEN: Sau timeout → cho 1 vài request thử → nếu OK → CLOSED, nếu fail → OPEN lại.
  - **Threshold:** Failure rate (50% trong 100 request) hoặc slow call rate.
  - **Lỗi:** Threshold quá nhạy → circuit mở liên tục; threshold quá lỏng → vẫn gọi vào dependency chết.

- **3.2.3.4 Bulkhead — tách pool để cô lập lỗi**
  - **Cơ chế:** Tách thread pool / connection pool / semaphore cho mỗi dependency. Lỗi 1 dependency chỉ chiếm pool của nó.
  - **Pattern:**
    ```java
    // 3 pool riêng cho 3 downstream khác nhau
    ExecutorService coreBankingPool = Executors.newFixedThreadPool(20);
    ExecutorService esbPool = Executors.newFixedThreadPool(10);
    ExecutorService notificationPool = Executors.newFixedThreadPool(5);
    ```
  - **Lỗi:** Dùng chung pool → lỗi 1 dependency chiếm hết thread → service khác cũng treo.

- **3.2.3.5 Rate limiter theo dependency & tenant**
  - **Per-dependency:** Core Banking có thể chịu 100 req/s, Notification 1000 req/s.
  - **Per-tenant:** VIP customer có quota cao hơn.
  - **Tool:** Bucket4j, Resilience4j RateLimiter.
  - **Lỗi:** Rate limit global → tenant hợp lệ bị chặn vì tenant khác spam.

##### Nhánh: Fallback semantics

*Tư duy cốt lõi: Fallback tốt = giữ hệ thống chạy được. Fallback xấu = trả dữ liệu sai mà không ai biết.*

- **3.2.3.6 Fallback đúng nghĩa, không che lỗi dữ liệu**
  - **Dùng fallback cho:** Lỗi kỹ thuật tạm thời (timeout, 503, connection refused).
  - **KHÔNG dùng fallback cho:** Lỗi nghiệp vụ (insufficient balance, validation failed), lỗi dữ liệu (account not found).
  - **Ví dụ đúng:** Notification lỗi → ghi outbox để gửi sau. Promotion lỗi → trả response không có promotion, không che.
  - **Ví dụ sai:** Core Banking timeout → trả "transaction success" → khách hàng tin là xong nhưng tiền chưa trừ.

- **3.2.3.7 Fallback data correctness & audit signal**
  - **Audit:** Khi fallback xảy ra → log + metric + alert. Operator cần biết hệ thống đang "degraded".
  - **Quy tắc:** Fallback response phải có flag `degraded: true` hoặc `source: cache`. Caller biết mà xử lý.
  - **Lỗi:** Fallback lặng lẽ → user thấy response bình thường, không biết data stale.


---

## Track 4: Database, SQL Performance, Cache & Object Storage (3 tuần)

> **Mục tiêu track:** Tối ưu truy vấn, model dữ liệu giao dịch, cache nhất quán và storage file an toàn.
> **Kỹ năng chính:** `OracleDB` `PostgreSQL` `MySQL` `SQL Server` `Redis` `MinIO` `Pentaho PDI`

### 4.1 Module: SQL & database design

#### Task 4.1.1 — Index, execution plan, join strategy, pagination, transaction lock

**Level:** Trung cấp • **Estimate:** 9h • **Deliverable:** SQL tối ưu, đọc execution plan, phân trang ổn định

##### Nhánh: Index & execution plan reading

*Tư duy cốt lõi: Index không "miễn phí". Mỗi index tăng write cost. Index đúng truy vấn, sai cột phản tác dụng.*

- **4.1.1.1 Index type, selectivity, composite index order**
  - **Loại index:**
    - B-tree: mặc định, range query, equality.
    - Hash: chỉ equality (PostgreSQL, MySQL Memory).
    - Bitmap: cột low-cardinality (status, gender) — Oracle, PostgreSQL.
    - Full-text: tìm kiếm text.
    - Function-based: index trên `LOWER(email)`.
    - Covering/Include: index chứa cả cột SELECT.
  - **Selectivity:** Tỷ lệ row khác nhau / tổng row. Cao → index hiệu quả. Thấp (status='ACTIVE' ở bảng 1M row chỉ có 5 record ACTIVE) → không worth.
  - **Composite index order:** Cột equality trước (WHERE status = ?), rồi range (WHERE created_at > ?), rồi sort (ORDER BY id). Tuân theo ESR (Equality, Sort, Range) — áp dụng tốt cho MySQL.
  - **Lỗi:** Index `(status, created_at)` nhưng query `WHERE created_at = ?` → không dùng index; index `(first_name, last_name)` query `WHERE last_name = ?` → không dùng.

- **4.1.1.2 Execution plan (full scan, index scan, nested loop, hash join)**
  - **Cách đọc:** MySQL `EXPLAIN`, PostgreSQL `EXPLAIN ANALYZE`, Oracle `EXPLAIN PLAN FOR`. Chú ý `type` (ALL = full scan, range, ref, const), `key`, `rows`, `Extra`.
  - **Operator quan trọng:**
    - Table scan / index scan / index only scan.
    - Nested loop: tốt cho ít row, có index.
    - Hash join: tốt cho 2 set lớn, equality join.
    - Sort merge join: tốt cho đã sort.
  - **Dấu hiệu bad plan:** `type=ALL` trên bảng lớn, `Using filesort`, `Using temporary`, `rows` ước lượng sai xa thực tế.
  - **Lỗi:** Update statistics cũ → optimizer chọn plan sai → query chậm đột ngột.

- **4.1.1.3 Join strategy & cardinality**
  - **Cardinality:** Số row ước lượng sau mỗi bước. Càng thấp càng tốt khi đi vào join.
  - **Chiến lược:** Lọc (filter) trước, join sau. Đẩy điều kiện vào ON hoặc WHERE đúng chỗ (INNER vs LEFT).
  - **Anti-pattern:** JOIN trên subquery không cần thiết, dùng OR gây mất index, SELECT *.

##### Nhánh: Pagination strategy

*Tư duy cốt lõi: OFFSET lớn = scan và bỏ row. Keyset = skip trực tiếp đến vị trí cần.*

- **4.1.1.4 Pagination: offset vs keyset**
  - **Offset pagination:** `LIMIT 20 OFFSET 1000`. DB phải scan 1020 row, bỏ 1000. Trang càng sâu càng chậm.
  - **Keyset pagination:** `WHERE id > 1000 ORDER BY id LIMIT 20`. DB dùng index skip trực tiếp. Nhanh cả ở trang sâu.
  - **Trade-off:** Offset cho phép jump đến trang bất kỳ (UI có "trang 5"), keyset chỉ next/previous.
  - **Banking:** Dùng keyset cho transaction history dài, offset cho admin page nhỏ.

- **4.1.1.5 Pagination ổn định khi dữ liệu thay đổi**
  - **Vấn đề:** Offset 100 với data liên tục insert → lặp/duplicate row khi user phân trang.
  - **Fix:** Keyset (id là cursor) + stable sort.
  - **Quy tắc:** KHÔNG dùng rowid/rownum làm cursor nếu row có thể bị xóa.

##### Nhánh: Transaction lock & slow query triage

*Tư duy cốt lõi: Slow query không phải lúc nào cũng do thiếu index. Có thể do lock, statistic, network, code sinh SQL kém.*

- **4.1.1.6 Transaction lock, isolation, deadlock**
  - **Lock type:** Row lock (index scan + lock), table lock (DDL, lock escalation), gap lock (MySQL RR), predicate lock.
  - **Deadlock prevention:** Lock theo thứ tự nhất quán, giữ transaction ngắn, dùng index tránh full table scan lock.
  - **Lỗi production:** Lock quá rộng (`SELECT ... FOR UPDATE` không WHERE) → block toàn bộ table; 2 transaction lock ngược chiều → deadlock.

- **4.1.1.7 Slow query checklist cho production**
  - **Checklist:**
    1. SQL đơn giản? Thiếu WHERE?
    2. Index phù hợp? EXPLAIN cho thấy dùng index?
    3. Cardinality ước lượng đúng? Statistics cập nhật?
    4. Lock/blocking? Có transaction khác giữ?
    5. Network/IO giữa app và DB? Latency cao?
    6. Connection pool cạn?
    7. Data tăng đột biến? Hot row?
  - **Lỗi:** Query nhanh ở test (1M row) chậm ở prod (100M row) do statistic sai hoặc data skew.

#### Task 4.1.2 — Schema cho giao dịch tài chính: audit, status history, immutable ledger

**Level:** Nâng cao • **Estimate:** 9h • **Deliverable:** Schema transaction chuẩn ngân hàng với audit/ledger

##### Nhánh: Transaction schema core

*Tư duy cốt lõi: Giao dịch tài chính KHÔNG được sửa sau khi ghi. Đó là invariant quan trọng nhất của core banking.*

- **4.1.2.1 Transaction table schema (immutable amount, account, reference)**
  - **Field bất biến sau commit:** `transaction_id`, `source_account_id`, `destination_account_id`, `amount`, `currency`, `reference_id`, `external_reference`, `transaction_type`, `created_at`.
  - **Field có thể đổi:** `status` (có status_history riêng), `last_updated_at`, `reversal_transaction_id`.
  - **Quy tắc:** Không có `UPDATE` trên transaction. Reversal = tạo transaction mới với amount âm + reference đến transaction cũ.

- **4.1.2.2 Idempotency/unique key cho financial transaction**
  - **Unique constraint:** `(source_account_id, external_reference, business_date)` — đảm bảo không tạo 2 transaction cùng ngữ cảnh.
  - **Idempotency key:** Lưu ở DB hoặc Redis, check trước khi insert.
  - **Lỗi:** Không có unique constraint → retry tạo 2 transaction cùng amount → khách hàng bị trừ 2 lần.

- **4.1.2.3 Reconciliation fields & traceability**
  - **Field cần có:** `external_reference` (mã giao dịch core banking), `reconciliation_id` (mã đối soát), `batch_id` (mã lô), `trace_id` (mã trace request).
  - **Traceability:** Mỗi transaction phải trace được từ API request → service xử lý → DB → core banking → notification.

##### Nhánh: Audit/status history

*Tư duy cốt lõi: Status history là "vết thời gian" của transaction. Không có nó thì khi audit không biết ai đổi trạng thái, đổi khi nào.*

- **4.1.2.4 Status history table & state transition**
  - **Pattern:** Bảng riêng `transaction_status_history(transaction_id, from_status, to_status, changed_by, changed_at, reason)`.
  - **Audit:** Insert 1 row mỗi lần status đổi.
  - **Query:** Lấy toàn bộ lịch sử để trace, hoặc lấy latest để biết trạng thái hiện tại (vẫn nên dùng cột `current_status` ở bảng transaction để query nhanh).

- **4.1.2.5 State machine cho status history giao dịch**
  - **Định nghĩa:** Cho phép transition nào? `PENDING → AUTHORIZED → CAPTURED → COMPLETED`, `PENDING → FAILED`, `COMPLETED → REVERSED`.
  - **Validate:** Không cho `PENDING → COMPLETED` skip bước.
  - **Quy tắc:** State machine validate ở application layer (không phải DB trigger).

##### Nhánh: Ledger, partitioning, archive

*Tư duy cốt lõi: Ledger là nguồn sự thật cuối cùng. Balance là derived data từ ledger. Đổi balance trực tiếp = mất audit.*

- **4.1.2.6 Immutable ledger (debit/credit entry, balance derivation)**
  - **Double-entry:** Mỗi transaction tạo ≥ 2 ledger entries (1 debit + 1 credit), tổng debit = tổng credit trong cùng journal.
  - **Balance:** Sum(debit) - Sum(credit) của account = balance. Lưu cache ở bảng account để query nhanh, nhưng luôn derive được từ ledger.
  - **Lỗi:** Update balance trực tiếp không từ ledger → mất audit trail → không reconcile được.

- **4.1.2.7 Partitioning/archive theo ngày giao dịch**
  - **Pattern:** Bảng transaction partition theo `transaction_date` (range partition theo tháng/năm).
  - **Lợi ích:** Query theo tháng chỉ scan 1 partition; archive/drop partition cũ dễ dàng.
  - **Lỗi:** Partition key không khớp query thường dùng → full scan all partitions.

#### Task 4.1.3 — PL/SQL/stored procedure: package, cursor, exception, bulk

**Level:** Nâng cao • **Estimate:** 7h • **Deliverable:** Tích hợp core banking qua stored procedure chuẩn

##### Nhánh: PL/SQL package & cursor boundary

*Tư duy cốt lõi: Stored procedure là API do core banking expose. Java adapter phải đóng gói gọn, test được.*

- **4.1.3.1 PL/SQL package spec/body & API boundary**
  - **Spec:** Khai báo procedure/function/cursor — tương tự interface trong Java.
  - **Body:** Implementation ẩn. Caller chỉ thấy spec.
  - **Quy tắc:** Procedure public trong spec, helper private trong body.

- **4.1.3.2 Cursor, REF CURSOR, lifecycle**
  - **Cursor:** Con trỏ tới result set trong session.
  - **REF CURSOR:** Cho phép pass cursor giữa procedure. Phải close sau khi dùng (Java `JdbcTemplate` tự close).
  - **Lỗi:** Quên close → cursor leak → session hết cursor → ORA-01000.

##### Nhánh: Error & transaction behavior

*Tư duy cốt lõi: Exception trong PL/SQL mặc định rollback transaction. Biết để xử lý đúng.*

- **4.1.3.3 Exception handling, error code, rollback**
  - **3 lớp:**
    1. Exception handling: WHEN ... THEN ... cho từng loại.
    2. Error code: `SQLCODE`, `SQLERRM`, custom error code (e.g., -20001).
    3. Rollback behavior: exception mặc định rollback toàn transaction.
  - **Quy tắc:** Bắt exception cụ thể, re-raise sau khi log/cleanup. Không `WHEN OTHERS THEN NULL` (che lỗi).
  - **Lỗi production:** Bắt `OTHERS` rồi commit lại → swallow error nhưng data đã đổi.

- **4.1.3.4 Transaction control trong procedure**
  - **COMMIT/ROLLBACK trong procedure:** Cẩn thận — ảnh hưởng transaction của caller.
  - **Pattern:** Procedure nên để caller quyết định commit, trừ khi procedure là "autonomous transaction".
  - **Autonomous transaction:** `PRAGMA AUTONOMOUS_TRANSACTION` cho transaction độc lập (audit log).

##### Nhánh: Bulk performance & test cases

*Tư duy cốt lõi: Bulk collect + FORALL tăng tốc hàng chục lần so với row-by-row.*

- **4.1.3.5 Bulk collect, FORALL, batch performance**
  - **Row-by-row:** `SELECT INTO ... FROM ...` trong loop → nhiều context switch.
  - **BULK COLLECT:** Load nhiều row vào PL/SQL collection 1 lần.
  - **FORALL:** Thực hiện INSERT/UPDATE/DELETE theo batch.
  - **Lỗi:** `LIMIT` không đặt → bulk collect 1 triệu row → OOM trong PGA.

- **4.1.3.6 Testing procedure với input/output case table**
  - **Pattern:** Bảng `test_cases(proc_name, input_json, expected_output)` chạy script test tự động.
  - **Cover:** Valid case, edge case (null, empty, max length), invalid (raise expected error code).

### 4.2 Module: Cache, storage & ETL

#### Task 4.2.1 — Redis: cache aside, TTL, invalidation, distributed lock, session store

**Level:** Trung cấp • **Estimate:** 9h • **Deliverable:** Redis integration chuẩn production cho cache/lock/session

##### Nhánh: Cache lifecycle strategy

*Tư duy cốt lõi: Cache không phải source of truth. DB mới là. Cache miss ≠ bug, cache stale = bug.*

- **4.2.1.1 Cache-aside (read/write flow)**
  - **Read:** App → cache → hit → return. Miss → DB → cache.set → return.
  - **Write:** DB write trước, rồi cache.delete (không update). Read tiếp theo tự load lại.
  - **Lý do delete thay vì update:** Tránh race condition giữa 2 writer, delete + lazy load đơn giản hơn.
  - **Lỗi:** Update cache trước rồi DB → DB fail → cache có data mới nhưng DB không có → stale mãi mãi.

- **4.2.1.2 TTL strategy & cache stampede**
  - **TTL:** Set expire cho mọi cache key, không bao giờ để cache sống mãi.
  - **Cache stampede:** Nhiều key cùng expire → cùng lúc miss → cùng lúc query DB → DB spike.
  - **Fix:** Jitter TTL (`EXPIRE key base+random(0, base/4)`); early refresh; single-flight (chỉ 1 thread load, các thread khác chờ).

- **4.2.1.3 Invalidation theo event hoặc write-through hook**
  - **Event-driven:** DB write commit → publish event "customer updated" → consumer delete cache key tương ứng.
  - **Write-through hook:** Application gọi cache.delete ngay sau DB commit.
  - **Trade-off:** Event-driven phức tạp nhưng đảm bảo ngay cả khi write ở service khác. Write-through đơn giản nhưng chỉ hoạt động trong cùng service.

##### Nhánh: Distributed coordination

*Tư duy cốt lõi: Distributed lock = "ai đang giữ resource này". Cẩn thận split-brain khi Redis cluster mạng.*

- **4.2.1.4 Distributed lock (SET NX PX, safe release)**
  - **Acquire:** `SET lock:resource unique-token NX PX 30000`.
    - NX: chỉ set nếu key chưa tồn tại.
    - PX: TTL millisecond.
    - unique-token: client generate, để biết mình đang giữ lock.
  - **Release:** Chỉ delete nếu token match (dùng Lua script để atomic): `if redis.call('get', key) == token then redis.call('del', key) end`.
  - **Lỗi:** `DEL lock:resource` không check token → thread A giữ, thread B xóa nhầm.

- **4.2.1.5 Lock expiry, fencing token, split-brain risk**
  - **Lock expiry:** TTL quá ngắn → lock hết hạn trước khi xử lý xong → 2 thread cùng giữ.
  - **Fencing token:** Token tăng dần theo lock acquisition. Resource server check token mỗi lần write → từ chối nếu token cũ.
  - **Split-brain:** Redis cluster partition → 2 master, 2 client tưởng mình đang giữ lock → conflict. Redlock (Redisson) giảm rủi ro nhưng không loại bỏ hoàn toàn.
  - **Lỗi banking:** Lock hết hạn → 2 worker cùng transfer → âm tiền.

##### Nhánh: Session store & Redis failure modes

*Tư duy cốt lõi: Redis down ≠ service down. Phải có fallback. Nhưng cũng đừng để fallback trả "OK mặc định".*

- **4.2.1.6 Session store & token/session expiry**
  - **Session store:** `sessionId → {userId, roles, device, expiresAt, revoked}`. Redis phù hợp (TTL, fast).
  - **Tokens:** Access token short-lived (15-60 min), refresh token long-lived (7-30 ngày).
  - **Logout:** Set `revoked=true` hoặc xóa session khỏi Redis. Token blacklist cho access token chưa expire.

- **4.2.1.7 Redis failure mode & fallback về DB**
  - **Khi Redis down:**
    - Cache: degrade thành read-through DB, slower nhưng OK.
    - Lock: không có lock → từ chối request quan trọng (fail safe) hoặc cho qua (fail open).
    - Session: mất session state → user phải login lại.
  - **Quy tắc:** Phân biệt rõ "cache có thể miss" vs "lock không thể fail open" vs "session không thể bịa".
  - **Lỗi:** Cache-aside mà fallback "luôn trả rỗng" → user thấy empty page, không biết lỗi.

#### Task 4.2.2 — MinIO: bucket policy, presigned URL, multipart upload, metadata, antivirus

**Level:** Trung cấp • **Estimate:** 8h • **Deliverable:** Object storage integration cho KYC/contract/claim documents

##### Nhánh: Object storage access model

*Tư duy cốt lõi: Presigned URL = "vé tạm thời". URL leak = leak quyền trong thời gian đó. Minimize scope + expiry.*

- **4.2.2.1 Bucket design, naming, policy**
  - **Naming:** Theo domain (`banking-kyc-prod`, `banking-claim-prod`). Không chứa thông tin nhạy cảm.
  - **Bucket policy:** Quyền ai được làm gì. Service dùng IAM role, không hardcode credential.
  - **Versioning:** Bật để có khả năng recover.
  - **Lifecycle:** Auto-archive sau N ngày, auto-delete sau M ngày.

- **4.2.2.2 Presigned URL (expiry, method, content-type)**
  - **Cấu trúc:** URL đã ký với credential, có expiry (5-15 phút cho download, 30-60 phút cho upload), method (GET/PUT), content-type.
  - **Lỗi:** Expiry quá dài (24h) → URL leak nguy hiểm; expiry quá ngắn (1 phút) → user không upload kịp với mạng chậm.
  - **Quy tắc:** Presigned URL chỉ cho upload/download, không cho list/delete.

##### Nhánh: Upload integrity & metadata

*Tư duy cốt lõi: Multipart upload = chia file lớn thành part nhỏ. Mỗi part retry độc lập. Phải complete đúng cách.*

- **4.2.2.3 Multipart upload & retry/resume**
  - **Flow:** Init → upload parts (parallel) → complete.
  - **Retry:** Mỗi part fail → retry riêng part đó.
  - **Resume:** Lưu upload ID + part đã upload → resume từ part fail.
  - **Abort:** Có upload chưa complete → abort để giải phóng storage.
  - **Lỗi:** Quên abort → storage leak (vẫn tính tiền dù không ai dùng).

- **4.2.2.4 Metadata (checksum, owner, domain reference)**
  - **Custom metadata:** Lưu business info (`customerId`, `documentType`, `uploadedBy`) trong object metadata để query.
  - **Checksum:** SHA-256 để verify integrity.
  - **Tag:** MinIO/S3 tag để query phục vụ admin/report.

##### Nhánh: Security scanning, retention, audit

*Tư duy cốt lõi: File upload = security boundary. Phải scan virus + validate type + isolate trước khi cho dùng.*

- **4.2.2.5 Antivirus hook & quarantine flow**
  - **Flow:** Upload → lưu vào "pending" bucket → scan antivirus → nếu sạch → chuyển "approved" → nếu nhiễm → chuyển "quarantine" + alert.
  - **Lỗi:** Để user truy cập file ngay sau upload mà chưa scan → malware có thể lây qua browser.

- **4.2.2.6 Retention, cleanup, audit download**
  - **Retention policy:** File KYC lưu 5 năm, file claim 10 năm. Auto-delete sau khi hết.
  - **Cleanup job:** Chạy định kỳ xóa abandoned upload, file không có owner.
  - **Audit log:** Ghi lại ai download file gì, khi nào, từ IP nào. Audit log riêng, immutable.

#### Task 4.2.3 — ETL với Pentaho PDI: extract, transform, load, schedule, retry

**Level:** Trung cấp • **Estimate:** 9h • **Deliverable:** ETL pipeline chuẩn production

##### Nhánh: ETL data movement stages

*Tư duy cốt lõi: ETL là vận chuyển dữ liệu. Extract đúng → transform đúng → load đúng. Sai 1 khâu → corrupt downstream.*

- **4.2.3.1 Extract (source connector, incremental key, watermark)**
  - **Source connector:** Database, file (CSV/Excel), API, message queue.
  - **Incremental key:** Cột timestamp hoặc sequence để lấy data mới từ lần trước.
  - **Watermark:** Lưu lại giá trị incremental key đã extract → lần sau lấy `> watermark`.
  - **Lỗi:** Watermark không persist (lưu trong memory) → restart pipeline → extract lại từ đầu hoặc miss data.

- **4.2.3.2 Transform (normalize, validate, enrich, reject row)**
  - **Normalize:** Date format, encoding (UTF-8), case (upper/lower), trim whitespace.
  - **Validate:** Not null, length, regex, business rule.
  - **Enrich:** JOIN với dimension table (city name, product info).
  - **Reject row:** Row vi phạm rule → tách ra reject file (không block pipeline).
  - **Quy tắc:** Reject file là artifact phải review hàng ngày, không phải "gửi mail rồi thôi".

- **4.2.3.3 Load (batch insert, upsert, transaction size)**
  - **Batch insert:** Insert nhiều row 1 lần thay vì row-by-row (1000 row/lần thường tốt).
  - **Upsert:** `INSERT ... ON DUPLICATE KEY UPDATE` (MySQL), `MERGE` (Oracle/SQL Server).
  - **Transaction size:** Không batch quá lớn (10k+ → lock contention, memory).
  - **Lỗi:** Load không idempotent → retry → duplicate.

##### Nhánh: Scheduling & recovery

*Tư duy cốt lõi: ETL phải idempotent. Chạy lại phải cho cùng kết quả. Không idempotent = disaster khi retry.*

- **4.2.3.4 Schedule & dependency giữa job**
  - **Scheduler:** Cron expression. Job chạy theo giờ cố định.
  - **Dependency:** Job B phụ thuộc A xong → dùng "job waiter" hoặc scheduler DAG.
  - **Lỗi:** Job chạy song song khi không nên → race condition; job chạy khi upstream chưa sẵn sàng → load data thiếu.

- **4.2.3.5 Retry, checkpoint, idempotent load**
  - **Retry:** Network fail, DB temporarily unavailable → retry với backoff.
  - **Checkpoint:** Lưu lại progress (đã process đến row nào) để resume.
  - **Idempotent:** Dùng upsert hoặc check exists trước insert. Pipeline chạy lại không tạo duplicate.

##### Nhánh: Data quality & reconciliation

*Tư duy cốt lõi: Không có reconciliation = không biết data có đúng không. Reconcile count là minimum viable quality check.*

- **4.2.3.6 Data quality report & reconciliation count**
  - **Report:** Số row extract, transform (success/reject), load. Thời gian từng stage. Error breakdown.
  - **Reconciliation:** Count(source) == Count(target). Tổng amount (source) == Tổng amount (target).
  - **Lỗi:** Match-by-count dễ pass khi cùng số row nhưng data khác. Phải reconcile cả giá trị quan trọng.

- **4.2.3.7 Reject file/report cho dòng ETL lỗi**
  - **Reject file:** CSV/JSON chứa row lỗi + lý do. Cho phép re-process sau khi fix.
  - **Quy tắc:** KHÔNG drop reject row âm thầm. Phải có alert + người xem hàng ngày.


---

## Track 5: Security, Identity & API Protection (2 tuần)

> **Mục tiêu track:** Nâng cấp năng lực bảo mật API, identity, token, encryption và bảo vệ dữ liệu nhạy cảm.
> **Kỹ năng chính:** `Spring Security` `Keycloak OIDC` `JWT / Nimbus JOSE` `RSA` `ECDH Encryption` `reCAPTCHA v3` `Bucket4j`

### 5.1 Module: Identity & access control

#### Task 5.1.1 — Spring Security filter chain, authentication provider, authorization manager

**Level:** Trung cấp • **Estimate:** 9h • **Deliverable:** Security pipeline chuẩn, test security rule đầy đủ

##### Nhánh: Authentication pipeline

*Tư duy cốt lõi: Security filter chain có thứ tự cố định. Hiểu order để debug "tại sao filter X không chạy".*

- **5.1.1.1 Spring Security filter chain ordering**
  - **Thứ tự (Spring Security 6):** DisableEncodeUrlFilter → WebAsyncManagerIntegrationFilter → SecurityContextHolderFilter → HeaderWriterFilter → CorsFilter → CsrfFilter → LogoutFilter → UsernamePasswordAuthenticationFilter → DefaultLoginPageGeneratingFilter → DefaultLogoutPageGeneratingFilter → BasicAuthenticationFilter → RequestCacheAwareFilter → SecurityContextHolderAwareRequestFilter → JaasApiIntegrationFilter → RememberMeAuthenticationFilter → AnonymousAuthenticationFilter → SessionManagementFilter → ExceptionTranslationFilter → AuthorizationFilter.
  - **Quy tắc:** Custom filter phải đặt đúng chỗ. Auth filter trước, Authorization filter cuối.
  - **Lỗi:** Đặt custom auth filter sau AuthorizationFilter → không chạy vì đã reject.

- **5.1.1.2 AuthenticationProvider & UserDetailsService**
  - **Responsibility split:**
    - `AuthenticationProvider`: validate credential, return `Authentication` (principal + authorities).
    - `UserDetailsService`: load user từ DB (chỉ trả về `UserDetails`, không check password).
  - **Pattern:** `DaoAuthenticationProvider` + custom `UserDetailsService` cho phần lớn use case.
  - **Lỗi:** Trộn logic load và validate trong UserDetailsService → khó test, khó swap data source.

- **5.1.1.3 SecurityContext lifecycle & stateless session**
  - **Stateless:** Không lưu session. Mỗi request tự xác thực (qua JWT, API key).
  - **Stateful:** Lưu session ở server (HttpSession hoặc external session store).
  - **API banking:** Mặc định stateless với JWT. Nếu cần revoke ngay → dùng session store.
  - **Lỗi:** Stateless API mà vẫn dùng session cookie → không scale ngang.

##### Nhánh: Authorization & exception semantics

*Tư duy cốt lõi: 401 vs 403 là 2 trạng thái khác nhau. Sai status code = client xử lý sai.*

- **5.1.1.4 AuthorizationManager (role, permission, resource owner)**
  - **Quyết định:** User có được làm action này trên resource này không?
  - **3 level:**
    - Role: `hasRole('ADMIN')`.
    - Permission: `hasAuthority('payment:write')`.
    - Resource owner: Check `resource.ownerId == currentUser.id`.
  - **Pattern (method security):**
    ```java
    @PreAuthorize("hasRole('ADMIN') or #accountId == authentication.principal.userId")
    public Account getAccount(Long accountId) { ... }
    ```

- **5.1.1.5 Exception handling (401 vs 403)**
  - **401 Unauthorized:** Chưa xác thực hợp lệ (token missing/expired/invalid).
  - **403 Forbidden:** Đã xác thực nhưng không có quyền.
  - **Quy tắc:** Trả đúng status. Không trả 401 cho "đúng user nhưng không có quyền" → phải 403.
  - **Lỗi:** Trả 403 cho token expired → client tưởng bị chặn quyền → không refresh token.

##### Nhánh: Security test coverage

*Tư duy cốt lõi: Security rule mà không test = không tồn tại. Một ngày nào đó rule bị xóa → security hole không ai biết.*

- **5.1.1.6 Test security rule bằng MockMvc**
  - **Pattern:** `mockMvc.perform(get("/api/admin")).andExpect(status().isForbidden())` với user thường.
  - **JWT test:** Tạo token giả với claim phù hợp, inject vào header.
  - **Coverage:** Mỗi endpoint phải test với: anonymous, authenticated user thường, authenticated admin, authenticated owner.

- **5.1.1.7 Test matrix cho role, ownership, anonymous access**
  - **Ma trận test:**
    - Anonymous + endpoint public → 200.
    - Anonymous + endpoint private → 401.
    - User A + resource của A → 200.
    - User A + resource của B → 403 (BOLA prevention).
    - Admin + resource bất kỳ → 200.
  - **Quy tắc:** Không có test cho negative case = không có security.

#### Task 5.1.2 — Keycloak OIDC: realm, client, role, token claim, JWKS

**Level:** Trung cấp • **Estimate:** 8h • **Deliverable:** Keycloak setup chuẩn + Spring Boot integration

##### Nhánh: OIDC client setup & flow

*Tư duy cốt lõi: OAuth2 = authorization ("được làm gì"). OIDC = authentication + identity ("là ai"). Không nhầm.*

- **5.1.2.1 Realm, client, redirect URI**
  - **Realm:** Namespace trong Keycloak, có user/role/client riêng. 1 realm = 1 environment hoặc 1 tenant.
  - **Client:** App đăng ký với realm, có client ID + secret. Cấu hình redirect URI chính xác.
  - **Redirect URI:** Phải khớp whitelist. Sai 1 ký tự → Keycloak reject.
  - **Lỗi:** Wildcard redirect URI (`https://*.example.com`) → mở rộng attack surface cho token theft.

- **5.1.2.2 OIDC flow (authorization code + PKCE, client credentials)**
  - **Authorization Code + PKCE:** Cho user-facing app (web, mobile). Auth ở browser, exchange code lấy token. PKCE chống authorization code interception.
  - **Client Credentials:** Cho service-to-service. Client xin token bằng chính credential.
  - **Implicit (deprecated):** Không dùng cho app mới.
  - **Quy tắc:** User-facing = auth code + PKCE. Service = client credentials.

##### Nhánh: Role & claim modeling

*Tư duy cốt lõi: Token claim là "passport". Đừng nhét thông tin quá nhiều (token lớn, leak), cũng đừng nhét quá ít (phải gọi userinfo mỗi request).*

- **5.1.2.3 Role mapping (realm role, client role, group)**
  - **Realm role:** Global trong realm.
  - **Client role:** Scope cho client cụ thể.
  - **Group:** Gom nhiều user, gán role cho group.
  - **Lỗi:** Dùng realm role cho mọi client → coupling giữa các app.

- **5.1.2.4 Token claim design & mapper**
  - **Claim cần thiết:** `sub` (user ID), `preferred_username`, `email`, `realm_access.roles` hoặc custom role claim.
  - **Custom mapper:** Thêm claim từ user attribute (e.g., `customerId`, `branchCode`).
  - **Quy tắc:** Claim sensitive (account number, balance) KHÔNG cho vào access token (luôn gọi API riêng).

##### Nhánh: Token validation & session lifecycle

*Tư duy cốt lõi: JWKS rotate là chuyện thường. Service phải tự refresh key, không hard-code public key.*

- **5.1.2.5 JWKS validation & key rotation**
  - **JWKS endpoint:** Keycloak expose `/realms/{realm}/protocol/openid-connect/certs`.
  - **Resource server:** Tự fetch JWKS, cache public key, refresh khi `kid` không tìm thấy.
  - **Key rotation:** Keycloak tự rotate (default 90 ngày). Service phải support kid lookup.

- **5.1.2.6 Logout/session revocation**
  - **Logout:** Keycloak session invalidate + refresh token revoke.
  - **Front-channel logout:** Browser gọi Keycloak logout endpoint.
  - **Back-channel:** Service gọi Keycloak revoke token.
  - **Lỗi:** Logout chỉ clear cookie phía client → token vẫn valid trên server.

#### Task 5.1.3 — JWT/Nimbus JOSE: signing, encryption, refresh, rotation, revocation

**Level:** Nâng cao • **Estimate:** 9h • **Deliverable:** Token infrastructure đầy đủ

##### Nhánh: JWT/JWS/JWE foundation

*Tư duy cốt lõi: JWT là format, không phải algorithm. JWS = signed, JWE = encrypted. Biết để chọn đúng.*

- **5.1.3.1 JWT structure (header, payload, signature)**
  - **Format:** `base64url(header).base64url(payload).base64url(signature)`.
  - **Header:** Algorithm (`alg`), key ID (`kid`), type (`typ`).
  - **Payload:** Claims (data, không mã hóa).
  - **Signature:** HMAC hoặc RSA/ECDSA.
  - **Lỗi:** Tin tưởng `alg: none` → JWT không có signature → giả mạo được.

- **5.1.3.2 Signing algorithm & key management**
  - **HS256:** HMAC + shared secret. Dùng cho service-to-service nội bộ.
  - **RS256/ES256:** RSA/ECDSA + public/private key. Dùng cho public API, OIDC.
  - **Lưu trữ key:** Private key trong Keycloak/HSM/Vault. Public key qua JWKS.
  - **Lỗi:** Hardcode secret trong code → leak khi commit, khó rotate.

- **5.1.3.3 JWE encryption bằng Nimbus JOSE**
  - **JWE:** Mã hóa payload, chỉ recipient mới đọc được. Dùng khi claim chứa PII nhạy cảm.
  - **Pattern:** RSA-OAEP + AES-GCM (Nimbus JOSE support).
  - **Trade-off:** Token lớn hơn, xử lý chậm hơn. Chỉ dùng khi cần.

##### Nhánh: Refresh token & revocation strategy

*Tư duy cốt lõi: Access token short-lived, refresh token rotation. Refresh token reuse = token theft.*

- **5.1.3.4 Refresh token rotation & reuse detection**
  - **Rotation:** Mỗi lần dùng refresh → trả refresh mới, invalidate refresh cũ.
  - **Reuse detection:** Nếu refresh token cũ được dùng lại → tất cả token của user đó bị revoke (nghi ngờ theft).
  - **Pattern (OAuth 2.0 BCP/RFC 9700):** Authorization server enforce rotation.

- **5.1.3.5 Revocation list, token version, session invalidation**
  - **Revocation list:** Blacklist access token chưa expire (Redis). Check mỗi request.
  - **Token version:** User có field `token_version`, token chứa version. Revoke tất cả token → bump version.
  - **Lỗi:** Chỉ dựa vào `exp` → không thể revoke khi user bị disable/logout.

##### Nhánh: Time-based validation

*Tư duy cốt lõi: Clock skew là thực tế. Validate với leeway nhỏ, nhưng đừng để leeway lớn đến mức token hết hạn vẫn dùng được.*

- **5.1.3.6 Clock skew, exp/nbf/iat validation**
  - **Claim:**
    - `iat`: issued at.
    - `nbf`: not before.
    - `exp`: expiration.
  - **Validate:** Server check `now > nbf`, `now < exp`. Cho leeway 30-60s cho clock skew.
  - **Lỗi:** Validate `exp` không có leeway → token hợp lệ bị reject do clock lệch vài giây.

- **5.1.3.7 Clock skew policy giữa service & IdP**
  - **Policy:** Dùng NTP đồng bộ thời gian. Leeway config ở service.
  - **Lỗi:** Service và IdP chênh 5 phút → token validate sai toàn bộ.

### 5.2 Module: API hardening

#### Task 5.2.1 — OWASP API Top 10 & mapping vào ngân hàng

**Level:** Trung cấp • **Estimate:** 8h • **Deliverable:** OWASP checklist áp dụng vào banking API

##### Nhánh: Authorization & authentication risks

*Tư duy cốt lõi: API1 (BOLA) là #1 trong OWASP API ranking. Phải test kỹ mỗi endpoint có object-level authz.*

- **5.2.1.1 Broken Object Level Authorization (BOLA) trong banking API**
  - **Lỗi:** User A đăng nhập, đổi ID trong URL từ account của A sang account của B → truy cập được.
  - **Fix:**
    - Kiểm tra `account.ownerId == authentication.principal.userId` ở service hoặc DB query.
    - Dùng indirection: trả `accountId` ẩn, dùng token để map.
  - **Test:** Mỗi endpoint có resource ID phải test với user khác owner.

- **5.2.1.2 Broken Authentication & session/token risk**
  - **Rủi ro:** Token không expire, credential leak qua log, password yếu, không có MFA cho sensitive operation.
  - **Fix:** Short-lived access token, refresh rotation, MFA cho transaction lớn, audit login.

##### Nhánh: Data exposure & input binding risks

*Tư duy cốt lõi: Excessive data exposure + mass assignment = 2 lỗi phổ biến nhất do DTO sai.*

- **5.2.1.3 Excessive Data Exposure & response DTO hardening**
  - **Lỗi:** Trả entity JPA ra response → leak password hash, internal flag, field admin-only.
  - **Fix:** Response DTO chỉ chứa field muốn expose. Không trả entity.
  - **Test:** Tạo user test với mọi field, kiểm tra response không chứa field nhạy cảm.

- **5.2.1.4 Mass Assignment & input binding control**
  - **Lỗi:** Backend bind toàn bộ request body vào entity → attacker gửi thêm `role=admin`, `isAdmin=true`.
  - **Fix:**
    - Dùng DTO thay vì bind trực tiếp entity.
    - Whitelist field được phép update.
    - `@JsonIgnoreProperties(ignoreUnknown = true)` chỉ ignore, không whitelist.

##### Nhánh: Configuration & review checklist

*Tư duy cốt lõi: Security misconfiguration = default config không an toàn cho production. Phải hardening theo checklist.*

- **5.2.1.5 Security Misconfiguration trong gateway/service**
  - **Hay gặp:**
    - Actuator endpoint `/env`, `/heapdump` public.
    - CORS allow all (`*`).
    - Debug mode on ở production.
    - Default password chưa đổi.
    - HTTPS không bắt buộc.
  - **Fix:** Config riêng cho prod, disable debug, expose actuator qua internal network, bắt buộc HTTPS.

- **5.2.1.6 Mapping OWASP risk vào checklist review**
  - **Checklist review mỗi PR:**
    - Endpoint có authn? Có authz (đúng user, đúng object)?
    - Input validation đầy đủ?
    - Output có leak field nhạy cảm?
    - Có log PII không?
    - Có sensitive operation → cần MFA?
    - Rate limit?
    - Audit log?

#### Task 5.2.2 — Rate limit, reCAPTCHA, input validation, masking, audit log

**Level:** Trung cấp • **Estimate:** 9h • **Deliverable:** API protection toàn diện

##### Nhánh: Abuse prevention controls

*Tư duy cốt lõi: Rate limit không chỉ là "block attacker". Rate limit còn giữ service sống khi traffic spike.*

- **5.2.2.1 Rate limit theo IP, user, client, endpoint**
  - **Key:** IP (gateway), user (sau auth), client_id (mobile/web), endpoint.
  - **Ví dụ:** User A: 100 req/min, IP 1.2.3.4: 60 req/min, endpoint `/login`: 5 req/min/IP.
  - **Tool:** Bucket4j + Redis, Spring Cloud Gateway RequestRateLimiter.
  - **Lỗi:** Rate limit quá thấp → user hợp lệ bị block; quá cao → không cản được attack.

- **5.2.2.2 reCAPTCHA v3 score, action, fallback**
  - **Cơ chế:** Frontend gọi reCAPTCHA âm thầm → Google trả token → backend verify → score 0.0-1.0.
  - **Score threshold:** ≥ 0.5 → cho qua; 0.3-0.5 → thêm verification; < 0.3 → block.
  - **Action:** Gắn action name (`login`, `transfer`) để Google phân tích risk per action.
  - **Lỗi:** Dùng reCAPTCHA v2 checkbox → UX kém, dễ bypass; không check action name → attacker dùng token của action khác.

- **5.2.2.3 Abuse case test cho form/API public**
  - **Test case:** SQL injection, XSS, CSRF, brute force, mass assignment, large payload, slowloris.
  - **Tool:** OWASP ZAP, Burp Suite (community edition).
  - **Quy tắc:** Test abuse case trong CI ít nhất 1 lần/release.

##### Nhánh: Input & data-protection controls

*Tư duy cốt lõi: Validation = whitelist. Blacklist = chắc chắn miss.*

- **5.2.2.4 Input validation (whitelist, length, format, canonicalization)**
  - **Whitelist:** Chỉ cho phép giá trị trong danh sách. Ví dụ: status chỉ là `ACTIVE, PENDING, CLOSED`.
  - **Length:** Max length để chống DoS.
  - **Format:** Regex cho phone, email, account number.
  - **Canonicalization:** Decode input nhiều lần (`%252F` → `%2F` → `/`) để bypass filter. Validate sau khi decode cuối cùng.
  - **Lỗi:** Validate trên raw input chưa decode → attacker bypass filter bằng double encoding.

- **5.2.2.5 Masking dữ liệu nhạy cảm trong response/log**
  - **Field mask:** `password`, `cvv`, `token`, `idNumber`, `cardNumber` (giữ 4 số cuối).
  - **Pattern:** Custom Jackson serializer hoặc Aspect (như Track 2 đã học).
  - **Test:** Gửi payload với field nhạy cảm, verify response và log không chứa giá trị thật.

##### Nhánh: Auditability

*Tư duy cốt lõi: Audit log phải trace được actor → action → resource → outcome. Và phải chống sửa.*

- **5.2.2.6 Audit log chống sửa/xóa & trace actor**
  - **Schema:** `(timestamp, actor_id, actor_type, action, resource_type, resource_id, before_state, after_state, ip, user_agent, trace_id)`.
  - **Anti-tamper:** Write-only (chỉ insert), hash chain (mỗi record hash của record trước), lưu ở DB riêng với quyền write-only.
  - **Lỗi:** Audit log cùng DB business table → attacker xóa log sau khi xóa data.

- **5.2.2.7 Audit log schema cho hành động nhạy cảm**
  - **Hành động cần audit:** Login, logout, password change, transfer, role change, admin override, configuration change.
  - **Pattern:** Aspect hoặc explicit `auditService.record(...)` trong code, không dựa vào log thường.

#### Task 5.2.3 — RSA/ECDH, request signing, timestamp, nonce, replay prevention

**Level:** Nâng cao • **Estimate:** 9h • **Deliverable:** API request signing chuẩn cho partner integration

##### Nhánh: Cryptographic key & signing foundation

*Tư duy cốt lõi: Request signing = chống tamper. Timestamp + nonce = chống replay. Cả 2 phối hợp.*

- **5.2.3.1 RSA signing & key pair lifecycle**
  - **Cơ chế:** Private key SIGN, public key VERIFY.
  - **Key pair:** Generate, distribute public key qua partner, private key trong HSM/Vault.
  - **Rotation:** Định kỳ rotate (90 ngày), overlap period 2 key cùng valid.
  - **Lỗi:** Hardcode key trong source → leak; share private key cho nhiều service.

- **5.2.3.2 ECDH key agreement & shared secret derivation**
  - **Cơ chế:** 2 bên generate key pair, exchange public key, derive shared secret mà không truyền qua mạng.
  - **Dùng cho:** Encryption channel giữa 2 service không có TLS ngược (legacy system, batch transfer).
  - **Lỗi:** Dùng ECDH mà không qua ephemeral key → forward secrecy không có.

- **5.2.3.3 Canonical request trước khi ký**
  - **Cần thiết:** Client và server phải "serialize" request giống nhau trước khi ký (sort header, lowercase method, normalized URL).
  - **Pattern (giống AWS Signature v4):**
    1. Canonical method, URL, query string.
    2. Canonical headers (sorted, lowercase).
    3. Hashed payload.
    4. String-to-sign = algorithm + timestamp + scope + hash(canonical request).
    5. Sign = HMAC(string-to-sign, signing key).
  - **Lỗi:** Không canonical → client và server hash khác nhau → signature mismatch.

##### Nhánh: Freshness controls

*Tư duy cốt lõi: Timestamp chống replay cũ. Nonce chống replay mới. Cần cả 2.*

- **5.2.3.4 Timestamp window & clock skew**
  - **Window:** Cho phép timestamp trong khoảng `now ± N minutes` (thường 5 phút).
  - **Clock skew:** Service phải sync NTP.
  - **Lỗi:** Window quá rộng → replay attack trong thời gian đó. Window quá hẹp → request hợp lệ bị reject.

- **5.2.3.5 Nonce store, TTL, duplicate detection**
  - **Nonce:** Random unique ID gửi kèm request. Server lưu nonce đã thấy trong TTL = window timestamp.
  - **Duplicate detection:** Nếu nonce đã tồn tại → reject (replay).
  - **Storage:** Redis với TTL = timestamp window.
  - **Lỗi:** Nonce không TTL → store tăng mãi → OOM; TTL < window → attacker replay ngay sau khi nonce expire.

##### Nhánh: Replay defense design

*Tư duy cốt lõi: Replay attack = dùng request đã capture lại. Phòng thủ nhiều lớp: TLS, timestamp, nonce, idempotency.*

- **5.2.3.6 Replay attack scenario & defense-in-depth**
  - **Tấn công:** Attacker capture request hợp lệ → gửi lại.
  - **Phòng thủ nhiều lớp:**
    - HTTPS: chống sniff (lớp transport).
    - Timestamp window: chống replay cũ.
    - Nonce: chống replay trong window.
    - Idempotency key: chống duplicate side-effect.
    - Short-lived token: giảm thời gian capture có giá trị.

- **5.2.3.7 Replay test case**
  - **Test:**
    - Request cũ (timestamp quá window) → 401.
    - Request cùng timestamp, cùng nonce → 409.
    - Request hợp lệ, replay trong window nhưng khác timestamp → fail signature.
    - Request hợp lệ → pass.


---

## Track 6: DevOps, Kubernetes & Observability (3 tuần)

> **Mục tiêu track:** Tự tin đóng gói, triển khai, quan sát và vận hành service production.
> **Kỹ năng chính:** `Docker` `Kubernetes` `GitLab CI/CD` `ELK Stack` `Actuator` `Micrometer` `Prometheus` `Maven`

### 6.1 Module: Build & deployment

#### Task 6.1.1 — Maven lifecycle, dependency management, multi-module, build profile

**Level:** Cơ bản • **Estimate:** 8h • **Deliverable:** Maven project chuẩn, multi-module clean, build profile

##### Nhánh: Maven lifecycle & dependency graph

*Tư duy cốt lõi: Maven có 3 lifecycle built-in: `default` (build chính), `clean`, `site`. Hiểu phase nào chạy gì để debug build.*

- **6.1.1.1 Maven lifecycle (validate, compile, test, package, verify)**
  - **`default` lifecycle:** validate → initialize → generate-sources → process-sources → generate-resources → process-resources → compile → process-classes → generate-test-sources → process-test-sources → generate-test-resources → process-test-resources → test-compile → process-test-classes → test → prepare-package → package → pre-integration-test → integration-test → post-integration-test → verify → install → deploy.
  - **Quy tắc:** Mỗi plugin bind vào phase cụ thể. Hiểu phase để biết plugin nào chạy khi `mvn package`.
  - **Lỗi:** Chạy `mvn package` mà skip test → thấy pass nhưng không có integration test.

- **6.1.1.2 Dependency scope & transitive**
  - **Scope:**
    - `compile`: default, dùng mọi lúc, đóng gói vào artifact.
    - `provided`: runtime cung cấp (Servlet API, JUnit trong test).
    - `runtime`: cần khi chạy nhưng compile dùng interface (JDBC driver).
    - `test`: chỉ test (JUnit, Mockito).
    - `system`: scope giống provided nhưng JAR local, không khuyến khích.
    - `import`: chỉ trong `<dependencyManagement>`.
  - **Transitive:** A → B → C → A tự động nhận C. Trừ khi `exclude` hoặc scope không kéo theo.
  - **Lỗi:** Scope sai → class không tìm thấy khi chạy; transitive đưa vào 2 version khác nhau → conflict.

- **6.1.1.3 DependencyManagement & version alignment**
  - **`<dependencyManagement>`:** Khai báo version để submodule dùng mà không cần khai version. Không kéo dependency, chỉ là "rule".
  - **BOM (Bill of Materials):** Import BOM để nhận toàn bộ version đã align. Ví dụ: `spring-boot-dependencies`.
  - **Quy tắc:** Multi-module dùng parent POM với dependencyManagement, submodule chỉ khai groupId + artifactId.

- **6.1.1.4 Debug dependency conflict bằng dependency tree**
  - **Tool:** `mvn dependency:tree`, `mvn dependency:analyze`.
  - **Pattern:** Tìm duplicate version → dùng `<exclusion>` hoặc `dependencyManagement` để pin version.
  - **Lỗi:** 2 version của cùng lib → classloader ambiguity, NoSuchMethodError lúc chạy.

##### Nhánh: Project structure & build profiles

*Tư duy cốt lõi: Multi-module giúp team scale. Mỗi module có trách nhiệm rõ, build độc lập.*

- **6.1.1.5 Multi-module project structure**
  - **Pattern:**
    ```
    banking-system/
    ├── pom.xml (parent)
    ├── common-lib/
    ├── payment-service/
    ├── account-service/
    └── ...
    ```
  - **Quy tắc:** Module con không phụ thuộc lẫn nhau qua lại (cyclic). Module common chỉ chứa utility không có business.

- **6.1.1.6 Build profile cho local/staging/prod**
  - **Pattern:** Trong POM hoặc `~/.m2/settings.xml` định nghĩa profile với property khác nhau.
  - **Activate:** `-Pprod`, hoặc theo environment.
  - **Lỗi:** Hardcode URL/property trong code → phải build lại khi đổi env.

#### Task 6.1.2 — Dockerfile tối ưu: layer, non-root, healthcheck, env config

**Level:** Trung cấp • **Estimate:** 9h • **Deliverable:** Docker image production-ready

##### Nhánh: Image build optimization

*Tư duy cốt lõi: Image càng nhỏ càng tốt. Pull nhanh, scan nhanh, deploy nhanh. Distroless hoặc JRE-alpine là chuẩn.*

- **6.1.2.1 Base image & size**
  - **Lựa chọn:**
    - `eclipse-temurin:21-jre`: 250MB, đầy đủ JRE.
    - `eclipse-temurin:21-jre-alpine`: 180MB, nhỏ hơn nhưng có glibc compatibility issue.
    - `gcr.io/distroless/java21-debian12`: 200MB, không shell, không package manager — an toàn nhất.
  - **Quy tắc:** Prod dùng distroless hoặc JRE-alpine; dev có thể dùng JDK đầy đủ để debug.

- **6.1.2.2 Layer caching & COPY/RUN order**
  - **Cơ chế:** Mỗi instruction là 1 layer. Layer cache invalid nếu content hoặc context thay đổi.
  - **Tối ưu:**
    1. Copy `pom.xml` (hoặc `build.gradle`) trước.
    2. Download dependencies (cache layer này).
    3. Copy source code sau.
    4. Build.
  - **Lỗi:** Copy source trước khi download dependency → mỗi lần đổi code, phải download lại dependency.

- **6.1.2.3 Multi-stage build cho Java app**
  - **Pattern:**
    ```dockerfile
    # Stage 1: build
    FROM maven:3.9-eclipse-temurin-21 AS build
    WORKDIR /app
    COPY pom.xml .
    RUN mvn dependency:go-offline
    COPY src ./src
    RUN mvn package -DskipTests
    
    # Stage 2: runtime
    FROM eclipse-temurin:21-jre
    COPY --from=build /app/target/*.jar app.jar
    ENTRYPOINT ["java", "-jar", "app.jar"]
    ```
  - **Lợi ích:** Image runtime không chứa Maven, source code, dependency cache → nhỏ + an toàn.

##### Nhánh: Runtime hardening

*Tư duy cốt lõi: Container chạy với root = lỗ hổng. Container escape → attacker có root trên host.*

- **6.1.2.4 Non-root user & filesystem permission**
  - **Pattern:** Tạo user trong Dockerfile, dùng `USER appuser` trước ENTRYPOINT.
  - **Lỗi:** Mặc định chạy root → container escape = root host.

- **6.1.2.5 Runtime env config & secret injection**
  - **Env:** Truyền qua `-e`, `--env-file`, hoặc ConfigMap/Secret trong K8s.
  - **Secret:** KHÔNG commit vào image. Mount từ secret manager (Vault, K8s Secret).
  - **Pattern:** App đọc env `DB_PASSWORD` từ K8s Secret mounted.

##### Nhánh: Container health behavior

*Tư duy cốt lõi: Pod bị kill đột ngột = mất request. Graceful shutdown = hoàn thành request đang xử lý trước khi chết.*

- **6.1.2.6 Healthcheck & graceful shutdown**
  - **Healthcheck:** `HEALTHCHECK CMD curl -f http://localhost:8080/actuator/health || exit 1`.
  - **Graceful shutdown:** Nhận SIGTERM → ngừng nhận request mới → hoàn thành request đang xử lý → đóng connection → thoát.
  - **Spring Boot:** `server.shutdown=graceful` + `spring.lifecycle.timeout-per-shutdown-phase=30s`.
  - **Lỗi:** K8s gửi SIGTERM, app thoát ngay → request đang xử lý bị client thấy 502.

- **6.1.2.7 Graceful shutdown với in-flight request**
  - **Pattern:**
    1. K8s gửi SIGTERM.
    2. Readiness probe fail ngay → service không nhận request mới.
    3. Đợi in-flight request xử lý xong (hoặc timeout).
    4. Đóng connection pool, flush log.
    5. Exit.
  - **`preStop` hook:** Chạy script trước khi SIGTERM, có thể sleep vài giây để LB cập nhật.

#### Task 6.1.3 — Kubernetes: deployment, service, configmap, secret, ingress, probes

**Level:** Trung cấp • **Estimate:** 9h • **Deliverable:** K8s manifest chuẩn production

##### Nhánh: Workload & networking basics

*Tư duy cốt lõi: Deployment → ReplicaSet → Pod là chuỗi quản lý. Hiểu để debug "Pod không lên".*

- **6.1.3.1 Deployment, ReplicaSet, rollout strategy**
  - **Deployment:** Khai báo desired state (image, replicas).
  - **ReplicaSet:** Đảm bảo số pod = desired.
  - **Rollout strategy:**
    - Recreate: Stop all, start new (downtime).
    - RollingUpdate: Stop old one-by-one, start new (zero downtime).
  - **Quy tắc:** RollingUpdate mặc định. Cấu hình `maxSurge`, `maxUnavailable`.
  - **Lỗi:** Recreate cho prod = downtime; không set `maxSurge` → không scale up được.

- **6.1.3.2 Service type & internal DNS**
  - **ClusterIP:** Internal, mặc định.
  - **NodePort:** Expose ra port node.
  - **LoadBalancer:** Cloud provider cấp LB.
  - **DNS:** Service tự có DNS `<service-name>.<namespace>.svc.cluster.local`. Pod resolve được.

- **6.1.3.3 Ingress rule, TLS, path routing**
  - **Ingress:** HTTP routing rule (path, host, header).
  - **TLS:** Cert qua cert-manager + Let's Encrypt hoặc cert manual.
  - **Pattern:**
    ```yaml
    apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
      name: payment-api
    spec:
      tls:
        - hosts: [api.example.com]
          secretName: api-tls
      rules:
        - host: api.example.com
          http:
            paths:
              - path: /api/payments
                pathType: Prefix
                backend:
                  service:
                    name: payment-service
                    port:
                      number: 8080
    ```

##### Nhánh: Configuration delivery

*Tư duy cốt lõi: ConfigMap đổi không tự reload app phải restart. Có nhiều cách reload, biết trade-off.*

- **6.1.3.4 ConfigMap/Secret & reload limitation**
  - **ConfigMap mount env/file:** Mặc định KHÔNG reload app. App phải watch file hoặc có actuator refresh endpoint.
  - **Spring Cloud Kubernetes Reload:** Watch ConfigMap → trigger `@RefreshScope` → reload bean.
  - **Trade-off:** Auto reload = unexpected config change; không reload = phải restart pod.

- **6.1.3.5 Secret rotation & config drift**
  - **Rotation:** Định kỳ rotate (90 ngày), overlap period 2 secret cùng valid.
  - **Config drift:** Config khác nhau giữa các môi trường. Dùng Helm/Kustomize + GitOps (ArgoCD) để track.

##### Nhánh: Health & resource management

*Tư duy cốt lõi: 3 probe giải 3 bài toán khác nhau. Trộn lẫn = restart loop hoặc mất traffic.*

- **6.1.3.6 Liveness/readiness/startup probes**
  - **Liveness:** "Có nên kill container không?". Fail → restart. Check deadlock, JVM freeze.
  - **Readiness:** "Có nên gửi traffic không?". Fail → bỏ khỏi Service endpoint. Check dependency ready, cache warm.
  - **Startup:** "Container đã khởi động xong chưa?". Cho phần init chậm. Sau khi pass, liveness/readiness mới bắt đầu.
  - **Lỗi:** Liveness check DB → DB down → tất cả pod restart loop.

- **6.1.3.7 Resource request/limit & OOMKilled**
  - **Request:** CPU/memory "đặt chỗ" cho scheduler.
  - **Limit:** Tối đa được dùng.
  - **CPU:** Compressible, vượt limit = throttle.
  - **Memory:** Không compressible, vượt limit = OOMKilled.
  - **Quy tắc:** Đặt request = typical usage; limit = 1.5-2x typical, KHÔNG cao quá (giảm scheduling efficiency).
  - **Lỗi:** Không set limit → container dùng hết node memory → node OOM → evict các pod khác.

#### Task 6.1.4 — GitLab CI/CD: build, test, scan, push, deploy

**Level:** Trung cấp • **Estimate:** 9h • **Deliverable:** CI/CD pipeline chuẩn

##### Nhánh: Pipeline quality gates

*Tư duy cốt lõi: Mỗi stage phải có gate. Fail gate = không đi tiếp. Đừng để broken code lên prod.*

- **6.1.4.1 Pipeline stages (build, test, scan, package, deploy)**
  - **5 stage chính:**
    1. **Build:** Compile source.
    2. **Test:** Unit + integration test.
    3. **Scan:** Static (SAST), dependency (SCA), container.
    4. **Package:** Build artifact (JAR/Docker image), push registry.
    5. **Deploy:** Deploy theo environment.
  - **Quy tắc:** Mỗi stage là 1 job riêng, artifact chuyển giữa stage.

- **6.1.4.2 Cache dependency & artifact handoff**
  - **Cache:** Maven dependency, npm module → cache giữa các run để build nhanh.
  - **Artifact handoff:** `artifacts.paths: target/*.jar` để job sau dùng.
  - **Lỗi:** Không cache → build chậm; cache không keyed theo hash → cache sai.

- **6.1.4.3 Static scan, dependency scan, container scan**
  - **3 lớp scan:**
    - SAST (Static Application Security Testing): phân tích source code (SonarQube, Checkmarx).
    - SCA (Software Composition Analysis): quét dependency có CVE (OWASP Dependency-Check, Snyk).
    - Container scan: quét image có package vulnerable (Trivy, Clair).
  - **Quy tắc:** Critical CVE = block pipeline. High = cảnh báo + review.

##### Nhánh: Image release & environment promotion

*Tư duy cốt lõi: 1 image, nhiều môi trường. Tag image theo git commit, không theo "version 1.2".*

- **6.1.4.4 Docker build/push & tag strategy**
  - **Tag pattern:** `image:tag = <repo>/<app>:<git-sha>` hoặc `<repo>/<app>:<semver>`.
  - **Immutability:** Tag cố định theo git SHA → không bao giờ re-tag image cũ.
  - **Quy tắc:** KHÔNG dùng `latest` cho production.

- **6.1.4.5 Environment promotion (dev, staging, prod)**
  - **Pattern:** Build 1 lần → deploy nhiều môi trường. Mỗi env có config riêng (qua K8s ConfigMap/Secret).
  - **Promotion:** Dev → Staging (auto) → Prod (manual approval).

##### Nhánh: Production control & rollback

*Tư duy cốt lõi: Rollback phải 1 lệnh, không phải build lại. Blue/green hoặc canary giúp rollback không downtime.*

- **6.1.4.6 Rollback, manual approval, protected branch**
  - **Rollback:** `kubectl rollout undo deployment/payment-service`. Hoặc redeploy image tag cũ.
  - **Manual approval:** Prod deploy cần human click "Approve". Bảo vệ khỏi auto-deploy do lỗi pipeline.
  - **Protected branch:** Main/master không push trực tiếp → phải qua MR/PR.

- **6.1.4.7 Blue/green hoặc canary rollback criteria**
  - **Blue/Green:** 2 environment (blue = current, green = new). Switch traffic khi green ready. Rollback = switch về blue.
  - **Canary:** Deploy 5% traffic cho version mới, monitor, tăng dần. Rollback = giảm về 0%.
  - **Criteria:** Error rate < threshold, latency p99 < threshold, business metric ổn định.

### 6.2 Module: Logging, metrics & runbook

#### Task 6.2.1 — Actuator/Micrometer/Prometheus: custom metric, health, alert

**Level:** Trung cấp • **Estimate:** 9h • **Deliverable:** Observability chuẩn production

##### Nhánh: Actuator & metric instrumentation

*Tư duy cốt lõi: Actuator = production-ready feature. Expose đúng chỗ, bảo vệ sai chỗ.*

- **6.2.1.1 Actuator endpoints & exposure policy**
  - **Endpoint quan trọng:** `/health`, `/info`, `/metrics` (hoặc `/prometheus`), `/loggers`, `/env`, `/heapdump`, `/threaddump`.
  - **Exposure policy:**
    - `/health`, `/info`, `/prometheus`: expose qua K8s service (cho Prometheus scrape).
    - `/env`, `/heapdump`, `/threaddump`: KHÔNG public (lộ secret, dump memory có thể treo JVM).
  - **Config:**
    ```yaml
    management:
      endpoints:
        web:
          exposure:
            include: health,info,prometheus
      endpoint:
        health:
          show-details: when-authorized
    ```

- **6.2.1.2 Micrometer (counter, timer, gauge)**
  - **Counter:** Đếm tăng dần. Số lượng request, số lỗi.
  - **Timer:** Đo latency. Có percentile (p50, p95, p99).
  - **Gauge:** Giá trị hiện tại (số connection pool đang dùng, queue size).
  - **Pattern:**
    ```java
    Counter.builder("payment.attempt").tag("currency", "VND").register(meterRegistry).increment();
    Timer.Sample sample = Timer.start(meterRegistry);
    // ... code ...
    sample.stop(meterRegistry.timer("payment.process", "status", "success"));
    ```

- **6.2.1.3 Custom business metric cho payment/API**
  - **Metric theo nghiệp vụ:** `payment.amount.total` (sum), `payment.success.rate` (gauge), `account.active.count` (gauge).
  - **Tag:** `currency`, `payment_method`, `customer_segment`. Cẩn thận high cardinality (user ID → không bao giờ).

##### Nhánh: Health checks & Prometheus

*Tư duy cốt lõi: HealthIndicator cho mỗi dependency. Prometheus scrape theo interval — không phải realtime.*

- **6.2.1.4 HealthIndicator cho DB, Kafka, Core Banking**
  - **Mỗi dependency có HealthIndicator riêng:** DB ping, Kafka metadata fetch, Core Banking API health.
  - **Component health:** `/actuator/health/db`, `/actuator/health/kafka`.
  - **Lỗi:** Chỉ check application status → không biết DB có down không → user thấy 500.

- **6.2.1.5 Prometheus scrape & label cardinality**
  - **Scrape:** Prometheus gọi `/actuator/prometheus` định kỳ (15s default).
  - **Label cardinality:** Tag có nhiều giá trị → series explosion → Prometheus OOM.
  - **Quy tắc:** Tránh tag có user ID, request ID, account ID. Dùng bounded enum (status, currency, method).

##### Nhánh: Alert design

*Tư duy cốt lõi: Alert không phải "có gì đó lạ". Alert phải actionable: có runbook, có người respond.*

- **6.2.1.6 Alert signal (latency, error rate, saturation)**
  - **3 tín hiệu (USE/RED):**
    - Latency: p95/p99 latency > threshold.
    - Error rate: 5xx > X%.
    - Saturation: CPU, memory, connection pool > Y%.
  - **Quy tắc:** Alert dựa trên SLO. Ví dụ: "99% request < 500ms trong 5 phút" → vi phạm = alert.

- **6.2.1.7 Alert runbook link & severity mapping**
  - **Severity:** Critical (page on-call), Warning (Slack channel), Info (email).
  - **Runbook link:** Mỗi alert có link đến runbook (xem Task 6.2.3).
  - **Quy tắc:** Alert không có runbook = noise. Operator nhận alert nhưng không biết làm gì.

#### Task 6.2.2 — ELK logging: structured log, correlation ID, masking, search

**Level:** Trung cấp • **Estimate:** 9h • **Deliverable:** Logging stack chuẩn production

##### Nhánh: Structured logging foundation

*Tư duy cốt lõi: Log không có cấu trúc = không search được. JSON log = Elasticsearch parse được, Kibana visualize được.*

- **6.2.2.1 Structured log fields & JSON layout**
  - **JSON layout:** Logback với `logstash-logback-encoder` → output JSON.
  - **Field chuẩn:** `timestamp`, `level`, `service`, `env`, `traceId`, `spanId`, `correlationId`, `userId`, `message`, `error`.
  - **Pattern (application.yml):**
    ```yaml
    logging:
      pattern:
        console: ""  # default
      config: classpath:logback-spring.xml
    ```

- **6.2.2.2 Correlation ID propagation**
  - **Flow:** Gateway đọc `X-Correlation-ID` (hoặc sinh) → set vào MDC → propagate xuống service qua header → service lưu vào MDC → log tự có correlation ID.
  - **Spring Cloud Sleuth / OpenTelemetry:** Tự động inject và propagate.
  - **Lỗi:** Không propagate → không trace request xuyên qua nhiều service.

- **6.2.2.3 Log level strategy & sampling**
  - **Level:** ERROR cho lỗi nghiệp vụ, WARN cho lỗi recoverable, INFO cho business event, DEBUG chỉ dev.
  - **Sampling:** Production không log DEBUG (volume lớn). Sample INFO ở mức chấp nhận được.
  - **Quy tắc:** Log "request" + "response" ở INFO với duration. Log payload chi tiết ở DEBUG.

##### Nhánh: Sensitive data protection

*Tư duy cốt lõi: PII trong log = GDPR violation + vi phạm nội quy ngân hàng. Mask từ đầu, đừng quét log.*

- **6.2.2.4 Masking rule cho PII/secret/token**
  - **Pattern:** Custom Logback encoder wrap message, regex mask trước khi write.
  - **Field mask:** `password=***`, `card=****1234`, `token=***`, `email=***@***.com`.
  - **Quy tắc:** Encrypt-at-rest cho log (Elasticsearch encrypted volume).

- **6.2.2.5 Log redaction test bằng sample payload**
  - **Test:** Capture log output, gửi request với payload nhạy cảm, assert log không chứa giá trị thật.
  - **CI:** Test masking mỗi PR (Logback `ListAppender` capture log, regex check).

##### Nhánh: Incident search & dashboards

*Tư duy cốt lõi: Khi incident, query phải trả lời được "có gì, khi nào, ở đâu". Elasticsearch + Kibana giúp query nhanh.*

- **6.2.2.6 Elasticsearch query cho incident**
  - **Query pattern:**
    - Tất cả error của service X trong khoảng thời gian: `service:payment AND level:ERROR AND @timestamp:[now-1h TO now]`.
    - Theo trace ID: `traceId:7f3c9a2e-...`.
    - Theo user gặp lỗi: `userId:12345 AND level:ERROR`.
  - **Mẹo:** Index theo `traceId`, `userId`, `correlationId` để search nhanh.

- **6.2.2.7 Dashboard/search pattern cho giao dịch lỗi**
  - **Dashboard:**
    - Error rate theo service, theo endpoint.
    - Top error message.
    - Latency p95/p99 theo endpoint.
    - Top user bị lỗi.
  - **Alert rule:** Tạo saved search + alert → khi error rate > threshold.

#### Task 6.2.3 — Runbook vận hành

**Level:** Nâng cao • **Estimate:** 9h • **Deliverable:** Runbook đầy đủ cho mọi tình huống

##### Nhánh: Availability incidents

*Tư duy cốt lõi: Một runbook tốt phải trả lời nhanh 3 câu: phát hiện sao, ảnh hưởng ai, làm gì.*

- **6.2.3.1 Runbook service down**
  - **Phát hiện:** Alert từ Prometheus (liveness fail, latency spike), dashboard status.
  - **Ảnh hưởng:** Bao nhiêu user, feature nào, mức độ nghiêm trọng.
  - **Hành động:**
    1. Check pod status (`kubectl get pods`).
    2. Check log gần nhất.
    3. Check dependency (DB, Kafka, external API).
    4. Rollback nếu vừa deploy.
    5. Scale nếu quá tải.
    6. Nếu không hiểu → escalate on-call senior.

- **6.2.3.2 Runbook high CPU/memory**
  - **High CPU:** Lấy thread dump → tìm thread RUNNABLE chiếm CPU → đọc stack.
  - **High memory:** Lấy heap dump → tìm dominator tree → nghi ngờ leak.
  - **Mitigation:** Restart pod để recover nhanh, root cause sau.

##### Nhánh: Dependency & data-layer incidents

*Tư duy cốt lõi: Kafka lag, DB lock, timeout core banking — 3 incident thường gặp nhất của banking backend.*

- **6.2.3.3 Runbook Kafka lag**
  - **Phát hiện:** Consumer lag > threshold, metric `kafka.consumer.lag`.
  - **Nguyên nhân:** Consumer chậm, partition bị stick 1 consumer (sau rebalance), consumer crash.
  - **Hành động:**
    1. Check consumer group health.
    2. Scale consumer (tăng partition hoặc instance).
    3. Nếu 1 consumer lag → có thể cần restart.
    4. Check log consumer có lỗi retry/DLQ không.

- **6.2.3.4 Runbook DB lock blocking**
  - **Phát hiện:** Alert từ DB (active session > threshold, lock wait > Xs), user thấy timeout.
  - **Hành động:**
    1. Query blocking session: `SELECT ... FROM v$lock WHERE ...`.
    2. Identify blocking vs waiting session.
    3. Kill blocking session nếu cần thiết (cẩn thận với production).
    4. Fix root cause: SQL lock quá rộng, thiếu index, transaction quá dài.
  - **Phòng tránh:** Lock cùng thứ tự, index tránh full scan, transaction ngắn.

- **6.2.3.5 Runbook timeout core banking**
  - **Tư duy cốt lõi:** Timeout KHÔNG có nghĩa transaction thất bại. Nghĩa là trạng thái chưa rõ.
  - **Quy trình:**
    1. KHÔNG rollback tự động.
    2. KHÔNG retry mù quáng (có thể duplicate).
    3. Inquiry trạng thái qua core banking API.
    4. Nếu inquiry cũng timeout → escalate sang team core banking.
    5. Nếu inquiry thành công → reconcile với transaction của mình.
  - **Quy tắc:** Mọi timeout core banking đều phải có bước inquiry + reconcile. Không tự kết luận thất bại.

##### Nhánh: Post-incident improvement

*Tư duy cốt lõi: Postmortem không phải "tìm ai sai". Là "tìm hệ thống nào fail để không lặp lại".*

- **6.2.3.6 Post-incident action item & owner**
  - **Schema:** `(incident_date, summary, timeline, root_cause, contributing_factors, action_items[])`.
  - **Action item:** Phải có owner, deadline, measurable (không "xem xét", mà "thêm probe X" hoặc "set threshold Y").

- **6.2.3.7 Postmortem không đổ lỗi & action item đo được**
  - **Quy tắc:**
    - Blameless: tập trung vào hệ thống, không đổ lỗi cá nhân.
    - Action items SMART: Specific, Measurable, Achievable, Relevant, Time-bound.
    - Owner rõ, deadline rõ.
    - Follow-up: review action items ở sprint tiếp theo.

---

## Phụ lục: Task chưa hoàn thành

Danh sách 6 task/nhánh chưa hoàn thành trong `skill-roadmap-progress.json`:

- `db-003.bulk-collect-forall-va` (bản gốc tên `db-003.bulk-performance-va-test-cases` — task cha về bulk performance chưa đóng)
- `db-004.cache-lifecycle-strategy` (nhánh cache lifecycle chưa có note hoàn chỉnh)
- `db-004.distributed-coordination` (nhánh distributed coordination — có 1 lá nhưng nhánh chưa đóng)
- `db-004.session-store-va-redis-failure` (nhánh session store + Redis failure modes)
- `db-005.object-storage-access-model` (nhánh bucket design/presigned URL của MinIO)
- `ms-003` (task cha Eureka/OpenFeign — chưa đóng)

## Hướng dẫn sử dụng file này

1. **Ôn trước phỏng vấn senior backend:** Đọc lại "Tư duy cốt lõi" của mỗi nhánh. Nhớ nguyên tắc trước, chi tiết sau.
2. **Review PR:** Mở track tương ứng, đọc checklist ở các lá để biết cần check gì.
3. **Điều tra incident:** Mở Track 1 (JVM/concurrency) cho memory/CPU/thread issue, Track 4 cho DB/cache issue, Track 6 cho K8s/runbook.
4. **Thiết kế feature mới:** Đọc pattern chuẩn ở track liên quan (Track 2 cho REST, Track 3 cho microservice, Track 5 cho security).
5. **Bổ sung task chưa hoàn thành:** Quay lại 6 task ở phụ lục, đọc note gốc trong `skill-roadmap-progress.json` và viết tổng hợp tương tự.

---

> **Tổng thời gian tổng hợp:** File này cô đọng 295 note (~5MB raw notes) xuống ~50KB tài liệu tham khảo nhanh. Khi cần chi tiết hơn, luôn có thể quay lại note gốc trong `skill-roadmap-progress.json` để đọc sâu hơn.
