// YouthLoop Schema v0.1 (Prisma-like DSL for design)
// Notes:
// - This is NOT executable Prisma schema, only for Obsidian readability.
// - Enums are stored as smallint in DB (hard-coded mapping in app).
// - UUID primary keys.
// - "date in DB" fields are Asia/Shanghai local DATE (no time component).
//
// Schema ownership (PostgreSQL schemas):
// - shared: user/auth/verification/terms (cross-service minimal identity set)
// - social: content/activity/interaction/points/recommendation/ops/outbox (Social service owned)

// schema: shared
model user {
  id            String   @id @default(uuid)
  role          Int      @default(1) // 1=user 2=host 3=admin
  status        Int      @default(1) // 1=active 2=blocked
  last_login_at DateTime?
  created_at    DateTime
  updated_at    DateTime

  profile       user_profile?
  identities    user_identity[]
  password      user_password?
  refreshTokens auth_refresh_token[]
}

// schema: shared
model user_profile {
  user_id    String  @id
  nickname   String?
  avatar_url String?
  gender     Int?    // 0/null unknown, 1 male, 2 female
  birthday   DateTime?
  hometown   String?
  created_at DateTime
  updated_at DateTime

  user user @relation(fields: [user_id], references: [id])
}

// schema: shared
model user_identity {
  id                 String   @id @default(uuid)
  user_id            String
  identity_type      Int      // 1=EMAIL 2=PHONE 3=GOOGLE
  identity_identifier String  // email(lowercased) / phone(E.164) / google_sub
  verified_at        DateTime?
  is_primary         Boolean  @default(false)
  created_at         DateTime
  updated_at         DateTime

  @@unique([identity_type, identity_identifier])
  user user @relation(fields: [user_id], references: [id])
}

// schema: shared
model user_password {
  user_id       String  @id
  password_hash String
  set_at        DateTime
  updated_at    DateTime

  user user @relation(fields: [user_id], references: [id])
}

// schema: shared
model auth_refresh_token {
  id         String   @id @default(uuid)
  user_id    String
  token_hash String   @unique
  device_id  String?
  expires_at DateTime
  revoked_at DateTime?
  created_at DateTime

  user user @relation(fields: [user_id], references: [id])

  @@index([user_id, created_at])
  @@index([expires_at])
}

// schema: shared
model verification_code {
  id         String   @id @default(uuid)
  account    String   // email/phone
  channel    Int      // 1=email 2=sms
  purpose    Int      // 1=register 2=login 3=reset_pwd
  code_hash  String
  expires_at DateTime
  attempts   Int      @default(0)
  created_at DateTime

  @@index([account, purpose, created_at])
  @@index([expires_at])
}

// schema: social
model host_profile {
  user_id      String @id
  display_name String?
  org_name     String?
  org_logo_url String?
  intro        String?
  created_at   DateTime
  updated_at   DateTime

  user user @relation(fields: [user_id], references: [id])
}

// schema: social
// Host verification + review (v0.1 needs this).
model host_verification {
  user_id       String @id
  org_name      String
  contact_name  String
  contact_phone String
  doc_urls      Json?  // array of object-storage urls
  status        Int    @default(1) // 1=pending 2=approved 3=rejected 4=revoked
  submitted_at  DateTime
  reviewed_by   String?
  reviewed_at   DateTime?
  review_note   String?
  created_at    DateTime
  updated_at    DateTime

  user user @relation(fields: [user_id], references: [id])

  @@index([status, submitted_at])
}

// schema: social
model home_banner {
  id          String   @id @default(uuid)
  title       String?
  image_url   String
  link_type   Int      // 1=none 2=content 3=activity 4=url
  link_target String?
  sort_order  Int      @default(0)
  is_enabled  Boolean  @default(true)
  start_at    DateTime?
  end_at      DateTime?
  created_by  String?
  updated_by  String?
  created_at  DateTime
  updated_at  DateTime

  @@index([is_enabled, sort_order])
  @@index([start_at, end_at])
}

// schema: social
model content {
  id           String   @id @default(uuid)
  type         Int      // 1=news 2=dynamic 3=policy 4=wiki
  title        String
  summary      String?
  cover_url    String?
  body         String
  source_type  Int      // 1=manual 2=crawled
  source_url   String?  @unique
  published_at DateTime?
  status       Int      @default(1) // 1=published 2=draft 3=hidden
  fts          String?  // tsvector in DB
  created_at   DateTime
  updated_at   DateTime

  stats content_stats?

  @@index([type, published_at])
  @@index([status, published_at])
  @@index([fts]) // in PostgreSQL: GIN index on tsvector
}

// schema: social
model content_stats {
  content_id    String @id
  like_count    Int    @default(0)
  fav_count     Int    @default(0)
  down_count    Int    @default(0)
  comment_count Int    @default(0)
  hot_score     BigInt @default(0)
  hot_rule_id   String?
  updated_at    DateTime

  content content @relation(fields: [content_id], references: [id])

  @@index([hot_score])
  @@index([hot_rule_id])
}

// schema: social
model activity {
  id           String   @id @default(uuid)
  source_type  Int      // 1=crawled 2=hosted
  title        String
  category     Int      // 1..8
  topic        String?
  signup_policy Int     @default(1) // 1=auto_approve 2=manual_review
  start_time   DateTime? // nullable (TBD allowed)
  end_time     DateTime?
  location     String?
  description  String?
  poster_urls  Json?
  source_url   String?  @unique
  host_user_id String?
  status       Int      @default(1) // 1=published 2=hidden 3=ended
  fts          String?  // tsvector in DB
  created_at   DateTime
  updated_at   DateTime

  stats   activity_stats?
  sessions activity_session[]
  signups activity_signup[]

  @@index([category, start_time])
  @@index([host_user_id, created_at])
  @@index([status, created_at])
  @@index([fts]) // in PostgreSQL: GIN index on tsvector
}

// Hosted activity can have multiple sessions/time-slots that users choose from.
// Crawled activity usually has no sessions (or is read-only).
// schema: social
model activity_session {
  id          String   @id @default(uuid)
  activity_id String
  title       String?
  start_time  DateTime
  end_time    DateTime?
  capacity    Int?
  status      Int      @default(1) // 1=enabled 2=disabled
  created_at  DateTime
  updated_at  DateTime

  activity activity @relation(fields: [activity_id], references: [id])

  @@index([activity_id, start_time])
}

// schema: social
model activity_stats {
  activity_id   String @id
  like_count    Int    @default(0)
  fav_count     Int    @default(0)
  down_count    Int    @default(0)
  comment_count Int    @default(0)
  hot_score     BigInt @default(0)
  hot_rule_id   String?
  updated_at    DateTime

  activity activity @relation(fields: [activity_id], references: [id])

  @@index([hot_score])
  @@index([hot_rule_id])
}

// schema: social
model activity_signup {
  id          String   @id @default(uuid)
  activity_id String
  session_id  String?  // required when activity has sessions (hosted time-slot)
  user_id     String?   // guest allowed
  // For guest signups: email is required (for dedup + reminder).
  // For logged-in signups: email can be omitted (derive from identity if needed).
  email       String?
  nickname    String?
  real_name   String
  phone       String
  join_time   DateTime? // optional snapshot; usually equals session.start_time
  status      Int      @default(1) // 1=pending 2=approved 3=rejected 4=canceled
  audited_by  String?  // host/admin user_id
  audited_at  DateTime?
  audit_note  String?
  canceled_at DateTime?
  cancel_note String?
  updated_at  DateTime
  created_at  DateTime

  // Strong dedup in DB without partial unique index:
  // Policy: one signup per activity per user/guest (NOT per session).
  // - logged-in: dedup_key = "U:{user_id}"
  // - guest:     dedup_key = "E:{normalized_email}"
  dedup_key   String
  @@unique([activity_id, dedup_key])
  @@index([activity_id, created_at])
  @@index([activity_id, status, created_at])
  @@index([session_id])

  activity activity @relation(fields: [activity_id], references: [id])
}

// schema: social
model comment {
  id          String   @id @default(uuid)
  target_type Int      // 1=content 2=activity
  target_id   String
  user_id     String   // must login
  parent_id   String?
  root_id     String?
  depth       Int      @default(0) // app enforces <=2 (3 levels)
  body        String
  status      Int      @default(1) // 1=visible 2=hidden
  created_at  DateTime
  updated_at  DateTime

  stats comment_stats?

  @@index([target_type, target_id, created_at])
  @@index([root_id, created_at])
  @@index([parent_id, created_at])
  @@index([user_id, created_at])
}

// schema: social
model comment_stats {
  comment_id  String @id
  like_count  Int    @default(0)
  down_count  Int    @default(0)
  reply_count Int    @default(0)
  hot_score   BigInt @default(0)
  hot_rule_id String?
  updated_at  DateTime

  comment comment @relation(fields: [comment_id], references: [id])

  @@index([hot_score])
  @@index([hot_rule_id])
}

// Configurable hot-score rule to support manual tuning / algorithm iteration.
// Worker can recompute hot_score for content/activity/comment by active rule.
// schema: social
model hot_score_rule {
  id           String   @id @default(uuid)
  target_type  Int      // 1=content 2=activity 3=comment
  name         String
  version      Int      @default(1)
  formula_json Json     // e.g. {"likeWeight":1,"commentWeight":2,"decay":"..."} or expression AST
  is_active    Boolean  @default(false)
  created_at   DateTime
  updated_at   DateTime

  @@index([target_type, is_active])
}

// schema: social
model reaction {
  id            String   @id @default(uuid)
  user_id       String
  target_type   Int      // 1=content 2=activity 3=comment
  target_id     String
  reaction_type Int      // 1=like 2=fav 3=downvote
  created_at    DateTime

  @@unique([user_id, target_type, target_id, reaction_type])
  @@index([target_type, target_id, created_at])
  @@index([user_id, created_at])
}

// Used by "My Replies" (red-dot + list).
// Created when someone replies to your comment (or future: mention/system notice).
// schema: social
model notification {
  id             String   @id @default(uuid)
  user_id        String   // recipient
  type           Int      // 1=comment_reply 2=comment_mention 3=system
  actor_user_id  String?  // who triggered it (null for system)
  target_type    Int?     // 1=content 2=activity
  target_id      String?  // content_id / activity_id
  comment_id     String?  // the new comment (reply)
  root_comment_id String?
  meta           Json?
  read_at        DateTime?
  created_at     DateTime

  @@index([user_id, read_at, created_at])
  @@index([comment_id])
}

// Compliance/audit: "I agree to Terms" at registration or when terms update.
// schema: shared
model user_terms_acceptance {
  id          String   @id @default(uuid)
  user_id     String
  doc_type    Int      // 1=terms 2=privacy
  doc_version String
  accepted_at DateTime
  ip          String?
  user_agent  String?

  @@index([user_id, doc_type, accepted_at])
}

// schema: social
model points_account {
  user_id    String @id
  balance    BigInt @default(0)
  updated_at DateTime
}

// schema: social
model points_ledger {
  id         String   @id @default(uuid)
  user_id    String
  delta      Int
  reason     Int      // 1=signin 2=task 3=quiz 4=admin 5=other
  ref_type   Int?
  ref_id     String?
  memo       String?
  created_at DateTime

  @@index([user_id, created_at])
}

// schema: social
model signin_record {
  user_id      String
  signin_date  DateTime // date in DB (Asia/Shanghai local date)
  is_signed    Boolean  @default(true)
  signed_at    DateTime // actual action time
  is_makeup    Boolean  @default(false)
  streak_count Int      @default(0)
  created_at   DateTime

  @@id([user_id, signin_date])
  @@index([user_id, signed_at])
}

// schema: social
model daily_task {
  id         String   @id @default(uuid)
  code       String   @unique
  name       String
  rule_json  Json
  points     Int
  is_enabled Boolean  @default(true)
  created_at DateTime
}

// schema: social
model daily_task_progress {
  user_id    String
  task_date  DateTime // date in DB (Asia/Shanghai local date)
  task_id    String
  progress   Int      @default(0)
  target     Int      @default(1)
  status     Int      @default(1) // 1=doing 2=claimable 3=done
  updated_at DateTime

  @@id([user_id, task_date, task_id])
}

// schema: social
model daily_quiz {
  quiz_date DateTime @id  // date in DB (Asia/Shanghai local date)
  question  Json
  answer    Json
  points    Int      @default(5)
  created_at DateTime
}

// schema: social
model daily_quiz_record {
  user_id     String
  quiz_date   DateTime
  user_answer Json
  is_correct  Boolean
  points      Int
  created_at  DateTime

  @@id([user_id, quiz_date])
}

// schema: social
model badge {
  id         String   @id @default(uuid)
  series     Int      // 1=points 2=signin
  name       String
  threshold  Json     // {"points":1000} or {"streak":7}
  sort_order Int      @default(0)
  created_at DateTime
}

// schema: social
model user_badge {
  user_id     String
  badge_id    String
  unlocked_at DateTime

  @@id([user_id, badge_id])
}

// schema: social
model user_event {
  id          String   @id @default(uuid)
  user_id     String?
  event_type  String   // VIEW_CONTENT/VIEW_ACTIVITY/LIKE/FAV/COMMENT_CREATE/SIGNUP_ACTIVITY/SIGNIN/...
  target_type Int?
  target_id   String?
  meta        Json?
  created_at  DateTime

  // VIEW dedup is done via Redis 10min window (not DB constraint)

  @@index([user_id, created_at])
  @@index([event_type, created_at])
}

// schema: social
model weekly_recommendation {
  user_id    String
  week_start DateTime // date in DB
  items      Json     // may include activity + content
  created_at DateTime
  updated_at DateTime

  @@id([user_id, week_start])
}
// schema: social
model outbox_event {
  id           String  @id @default(uuid)
  event_type   String
  payload      Json
  status       Int     @default(1) // 1=pending 2=processing 3=done 4=dead
  retry_count  Int     @default(0)
  next_retry_at DateTime?
  last_error   String?
  created_at   DateTime
  updated_at   DateTime

  @@index([status, created_at])
  @@index([next_retry_at])
}
