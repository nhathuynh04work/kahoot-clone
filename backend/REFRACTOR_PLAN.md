### Phase 1: Breaking the "God Class" (`GameService`)
*Refactoring `backend/src/game/game.service.ts` into single-responsibility domains.*

- [x] **Create `LobbyService`**
    - [x] Move `createLobby` method here (DB creation logic).
    - [x] Move `getValidLobby` and `changeLobbyStatus` here.
    - [x] Ensure this service **only** talks to the Database (Prisma), not Sockets.
- [x] **Create `SocketManagerService`**
    - [x] Move `hostSocketMap` and `playerSocketMap` logic here.
    - [x] Create methods like `registerSocket(userId, socketId)` and `getSocketId(userId)`.
    - [x] Abstract the socket storage so it can be swapped for Redis later.
- [x] **Create `GameSessionService`**
    - [x] Move game loop logic here (`startGame`, `nextQuestion`, `submitAnswer`).
    - [x] Move the `calculateScore` logic here.
- [ ] **Refactor `GameGateway`**
    - [ ] Update dependency injection to use the new services above.
    - [ ] Remove all business logic (e.g., `setTimeout` inside `handleDisconnect`). It should only route events.

### Phase 2: Scalability & State Management
*Moving from In-Memory Maps to Redis for multi-instance support.*

- [ ] **Infrastructure Setup**
    - [ ] Install Redis and run a local instance (or use Docker).
    - [ ] Install `@nestjs/bull` (or BullMQ) and a Redis client (e.g., `ioredis`).
- [ ] **Implement Redis State Adapter**
    - [ ] Replace `hostSocketMap` (Map) with Redis `SET`/`GET` operations.
    - [ ] Replace `connectedPlayerIds` (Set) with Redis Sets.
- [ ] **Fix Game Timers**
    - [ ] Remove `setTimeout` from `playCurrentQuestion` in `GameService`.
    - [ ] Create a BullMQ queue (e.g., `game-timer-queue`).
    - [ ] When a question starts, add a delayed job to the queue.
    - [ ] Create a Processor/Consumer that listens for the job completion and triggers the "Time Up" event.

### Phase 3: Performance Optimization (The N+1 Fix)
*Optimizing `backend/src/question/question.service.ts`.*

- [ ] **Implement Quiz Caching**
    - [ ] In `startGame`, fetch the **entire** quiz (questions + options + correct answers) from Prisma.
    - [ ] Store this full object in Redis under a key like `game:{pin}:data`.
- [ ] **Optimize Grading**
    - [ ] Rewrite `gradeAnswer` to fetch data from the Redis cache instead of `prisma.question.findUnique`.
    - [ ] Perform the correct/incorrect check in memory.

### Phase 4: Code Quality & Clean Code
*Fixing maintenance issues in `GameGateway` and `QuizService`.*

- [ ] **Event-Driven Disconnect**
    - [ ] In `GameGateway.handleDisconnect`, remove the 60s `setTimeout`.
    - [ ] Emit an internal domain event (e.g., `Events.HOST_DISCONNECTED`).
    - [ ] Create a listener that handles the waiting period and lobby closing logic separately.
- [ ] **Standardize Constants**
    - [ ] Create a shared constants file (e.g., `backend/src/common/constants.ts`).
    - [ ] Define enums for all Socket Events (`'createLobby'`, `'game.questionTimeUp'`, etc.).
    - [ ] Replace all "magic strings" in the Gateway and Frontend with these enums.
- [ ] **Simplify `QuizService.update`**
    - [ ] Break down the massive `update` transaction.
    - [ ] Consider separating endpoints: `PUT /quiz/:id` (metadata), `POST /quiz/:id/questions` (add question).

### Phase 5: Security & Authorization
*Decoupling auth checks from business logic in `QuizService`.*

- [ ] **Implement CASL / Policy Guard**
    - [ ] Create a `PoliciesGuard` or a custom decorator (e.g., `@CanManageQuiz()`).
- [ ] **Refactor Services**
    - [ ] Remove manual checks like `if (quiz.userId !== userId)` from `QuizService`.
    - [ ] Rely on the Guard to reject the request before it reaches the Service.