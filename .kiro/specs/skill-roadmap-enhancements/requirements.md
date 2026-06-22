# Requirements Document

## Introduction

Tài liệu yêu cầu cho các cải tiến trải nghiệm người dùng trên ứng dụng Skill Roadmap. Bao gồm 7 nhóm tính năng: điều hướng quay lại từ note preview, hệ thống comment/AI cho flashcard và trắc nghiệm, cấu hình cho phép trùng câu hỏi khi generate, thanh tiến độ flashcard dạng phân đoạn, tối giản hiển thị task cha, đếm mục con trực tiếp, và tính toán tiến độ chỉ cho task lá.

## Glossary

- **Note_Preview_Screen**: Màn hình xem trước nội dung note Markdown của một task (`/skill-roadmap/notes/[taskId]`)
- **Task_Detail_Screen**: Màn hình chi tiết task (`/skill-roadmap/tasks/[taskId]`)
- **Flashcard_Screen**: Màn hình học flashcard (`/skill-roadmap/tasks/[taskId]/flashcards`)
- **Quiz_Screen**: Màn hình làm bài trắc nghiệm (`/skill-roadmap/tasks/[taskId]/quiz`)
- **Comment_System**: Hệ thống comment/hỏi AI dạng thread, hiện có tại Note_Preview_Screen
- **Quiz_Attempt**: Một lượt làm bài trắc nghiệm, bao gồm thời gian bắt đầu, câu trả lời và điểm số
- **Parent_Task**: Task có chứa mục con (children), hiển thị dưới dạng node có thể expand/collapse trong cây phân cấp
- **Leaf_Task**: Task không chứa mục con, là task thấp nhất trong cây phân cấp
- **Direct_Children**: Các mục con trực tiếp cấp kế tiếp ngay bên dưới một task cha, không bao gồm mục con của mục con
- **Progress_Panel**: Khu vực hiển thị tổng quan tiến độ ôn tập (tỷ lệ hoàn thành, số task, số giờ, lộ trình tuần) tại RoadmapHeroCard
- **Segmented_Progress_Bar**: Thanh tiến độ dạng phân đoạn, mỗi đoạn tương ứng với một câu hỏi flashcard
- **Duplicate_Detection**: Cơ chế kiểm tra trùng lặp câu hỏi đã tạo khi generate bộ câu hỏi mới bằng AI
- **AI_Provider**: Dịch vụ AI bên ngoài (Kilo AI, OpenRouter) dùng để generate nội dung và trả lời comment

## Requirements

### Requirement 1: Điều hướng quay lại task detail từ Note Preview

**User Story:** As a learner, I want to navigate back to the task detail screen or flashcard/quiz screens from the note preview, so that I can quickly switch between related learning views without going through the roadmap page.

#### Acceptance Criteria

1. WHEN the user is on the Note_Preview_Screen, THE Note_Preview_Screen SHALL display a navigation link to the Task_Detail_Screen of the corresponding task
2. WHEN the user is on the Note_Preview_Screen, THE Note_Preview_Screen SHALL display a navigation link to the Flashcard_Screen of the corresponding task
3. WHEN the user is on the Note_Preview_Screen, THE Note_Preview_Screen SHALL display a navigation link to the Quiz_Screen of the corresponding task
4. WHEN the user clicks a navigation link, THE Note_Preview_Screen SHALL navigate to the selected destination without full page reload delay

### Requirement 2: Comment/AI tại Flashcard và Quiz

**User Story:** As a learner, I want to comment or ask AI questions about each flashcard or quiz question while studying, so that I can clarify doubts in context without leaving the study flow.

#### Acceptance Criteria

1. WHEN the user is viewing a flashcard on the Flashcard_Screen, THE Flashcard_Screen SHALL display a comment/AI interaction section for the currently active flashcard card
2. WHEN the user submits a comment on a flashcard, THE Comment_System SHALL store the comment associated with that specific flashcard card identifier
3. WHEN the user is viewing a quiz question on the Quiz_Screen, THE Quiz_Screen SHALL display a comment/AI interaction section for the currently active quiz question
4. WHEN the user submits a comment on a quiz question, THE Comment_System SHALL store the comment associated with that specific quiz question identifier and the current Quiz_Attempt identifier
5. WHEN the user switches to a different Quiz_Attempt for the same quiz deck, THE Comment_System SHALL display only comments belonging to that specific Quiz_Attempt
6. THE Comment_System SHALL send the content of the specific flashcard card or quiz question as context to the AI_Provider when requesting an AI response
7. THE Comment_System SHALL NOT send the entire note or unrelated cards as context when responding to a flashcard or quiz comment

### Requirement 3: Cấu hình cho phép trùng câu hỏi khi generate

**User Story:** As a learner, I want to toggle duplicate detection on or off when generating new flashcard or quiz decks, so that I can reduce AI context size and allow repeated questions for reinforcement when desired.

#### Acceptance Criteria

1. THE Flashcard_Screen SHALL display a toggle control for enabling or disabling Duplicate_Detection before generating a new deck
2. THE Quiz_Screen SHALL display a toggle control for enabling or disabling Duplicate_Detection before generating a new quiz
3. WHILE Duplicate_Detection is enabled, THE system SHALL send the list of existing questions to the AI_Provider when generating new flashcards or quizzes
4. WHILE Duplicate_Detection is disabled, THE system SHALL NOT send the list of existing questions to the AI_Provider when generating new flashcards or quizzes
5. THE system SHALL persist the Duplicate_Detection setting in localStorage so the preference is retained across sessions
6. THE Duplicate_Detection toggle SHALL default to enabled on first use

### Requirement 4: Thanh tiến độ flashcard dạng phân đoạn

**User Story:** As a learner, I want to see a segmented progress bar where each segment represents a flashcard, color-coded by my rating, so that I can visually track my study progress and jump to any card directly.

#### Acceptance Criteria

1. THE Flashcard_Screen SHALL replace the existing continuous progress bar with a Segmented_Progress_Bar containing one segment per flashcard card in the active deck
2. WHEN a flashcard has not been rated, THE Segmented_Progress_Bar SHALL display that segment in the default unrated color (gray)
3. WHEN a flashcard has been rated as "good" (đã nhớ), THE Segmented_Progress_Bar SHALL display that segment in green
4. WHEN a flashcard has been rated as "hard" (khó nhớ), THE Segmented_Progress_Bar SHALL display that segment in orange
5. WHEN the user clicks on a segment of the Segmented_Progress_Bar, THE Flashcard_Screen SHALL navigate to the corresponding flashcard card
6. THE Segmented_Progress_Bar SHALL visually indicate the currently active card segment with a distinct border or highlight

### Requirement 5: Ẩn prompt AI và link note tại task cha khi không vào chi tiết

**User Story:** As a learner, I want parent tasks in the task tree to show only essential information without the AI prompt section or note link, so that the hierarchy view is compact and not cluttered.

#### Acceptance Criteria

1. WHILE a task is a Parent_Task and is displayed in the roadmap tree view, THE TaskNode SHALL NOT display the AI learning prompt section
2. WHILE a task is a Parent_Task and is displayed in the roadmap tree view, THE TaskNode SHALL NOT display the note textarea or note link
3. WHEN the user navigates to the Task_Detail_Screen of a Parent_Task, THE Task_Detail_Screen SHALL display the full AI prompt section and note content
4. WHILE a task is a Leaf_Task, THE TaskNode SHALL continue to display the AI prompt section and note content as currently implemented

### Requirement 6: Đếm mục con trực tiếp thay vì toàn bộ descendants

**User Story:** As a learner, I want the child count badge on parent tasks to show only Direct_Children count, so that the count accurately represents the immediate sub-items visible when I expand that node.

#### Acceptance Criteria

1. THE TaskNode SHALL display the count of Direct_Children (immediate children) in the child count badge
2. THE TaskNode SHALL NOT include descendants of child tasks in the child count badge total
3. THE TaskNode SHALL display the completed count based on completed Direct_Children only
4. WHEN a parent task has 3 direct children where 2 have their own children totaling 8 descendants, THE TaskNode SHALL display "X/3 mục con" where X is the number of completed direct children

### Requirement 7: Tiến độ tổng quan chỉ tính task lá

**User Story:** As a learner, I want the progress panel metrics to count only leaf tasks, so that the completion rate, task count, and study hours reflect actual learning items rather than organizational groupings.

#### Acceptance Criteria

1. THE Progress_Panel SHALL calculate completion rate based on completed Leaf_Task count divided by total Leaf_Task count
2. THE Progress_Panel SHALL display total task count as the number of Leaf_Task items only
3. THE Progress_Panel SHALL calculate study hours based on estimateHours of Leaf_Task items only
4. THE Progress_Panel SHALL NOT include Parent_Task items in completion rate, task count, or study hours calculations
5. WHEN a Parent_Task is marked as completed but its leaf descendants are not, THE Progress_Panel SHALL NOT count that Parent_Task toward the completion metrics
