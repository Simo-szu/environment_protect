// YouthLoop Schema v0.1 (Prisma-like DSL for design)
// Notes:
// - This is NOT executable Prisma schema, only for Obsidian readability.
// - Enums are stored as smallint in DB (hard-coded mapping in app).
// - UUID primary keys.

model yl_user {
  id            String   @id @default(uuid)
  role          Int      @default(1) // 1=user 2=host 3=admin
  status        Int      @default(1) // 1=active 2=blocked
  last_login_at DateTime?
  created_at    DateTime
  updated_at    DateTime

  profile       yl_user_profile?
  identities    yl_user_identity[]
  password      yl_user_password?
  refreshTokens yl_auth_refresh_token[]
}

model yl_user_profile {
  user_id    String  @id
  nickname   String?
  avatar_url String?
  gender     Int?    // 0/null unknown, 1 male, 2 female
  birthday   DateTime?
  hometown   String?
  created_at DateTime
  updated_at DateTime

  user yl_user @relation(fields: [user_id], references: [id])
}

model yl_user_identity {
  id                 String   @id @default(uuid)
  user_id            String
  identity_type      Int      // 1=EMAIL 2=PHONE 3=GOOGLE
  identity_identifier String  // email(lowercased) / phone(E.164) / google_sub
  verified_at        DateTime?
  is_primary         Boolean  @default(false)
  created_at         DateTime
  updated_at         DateTime

  @@unique([identity_type, identity_identifier])
  user yl_user @relation(fields: [user_id], references: [id])
}

model yl_user_password {
  user_id       String  @id
  password_hash String
  set_at        DateTime
  updated_at    DateTime

  user yl_user @relation(fields: [user_id], references: [id])
}

model yl_auth_refresh_token {
  id         String   @id @default(uuid)
  user_id    String
  token_hash String   @unique
  device_id  String?
  expires_at DateTime
  revoked_at DateTime?
  created_at DateTime

  user yl_user @relation(fields: [user_id], references: [id])
}

model yl_verification_code {
  id         String   @id @default(uuid)
  account    String   // email/phone
  channel    Int      // 1=email 2=sms
  purpose    Int      // 1=register 2=login 3=reset_pwd
  code_hash  String
  expires_at DateTime
  attempts   Int      @default(0)
  created_at DateTime
}

model yl_content {
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

  stats yl_content_stats?
}

model yl_content_stats {
  content_id    String @id
  like_count    Int    @default(0)
  fav_count     Int    @default(0)
  comment_count Int    @default(0)
  hot_score     BigInt @default(0)
  updated_at    DateTime

  content yl_content @relation(fields: [content_id], references: [id])
}

model yl_activity {
  id           String   @id @default(uuid)
  source_type  Int      // 1=crawled 2=hosted
  title        String
  category     Int      // 1..8
  topic        String?
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

  stats   yl_activity_stats?
  signups yl_activity_signup[]
}

model yl_activity_stats {
  activity_id   String @id
  like_count    Int    @default(0)
  fav_count     Int    @default(0)
  comment_count Int    @default(0)
  hot_score     BigInt @default(0)
  updated_at    DateTime

  activity yl_activity @relation(fields: [activity_id], references: [id])
}

model yl_activity_signup {
  id          String   @id @default(uuid)
  activity_id String
  user_id     String?   // guest allowed
  email       String    // required for guest + reminder
  nickname    String?
  real_name   String
  phone       String
  join_time   DateTime
  created_at  DateTime

  // Dedup rules:
  // - logged-in: unique(activity_id, user_id) WHERE user_id != null
  // - guest: unique(activity_id, email)
  activity yl_activity @relation(fields: [activity_id], references: [id])
}

model yl_comment {
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

  stats yl_comment_stats?
}

model yl_comment_stats {
  comment_id  String @id
  like_count  Int    @default(0)
  down_count  Int    @default(0)
  reply_count Int    @default(0)
  hot_score   BigInt @default(0)
  updated_at  DateTime

  comment yl_comment @relation(fields: [comment_id], references: [id])
}

model yl_reaction {
  id            String   @id @default(uuid)
  user_id       String
  target_type   Int      // 1=content 2=activity 3=comment
  target_id     String
  reaction_type Int      // 1=like 2=fav 3=downvote
  created_at    DateTime

  @@unique([user_id, target_type, target_id, reaction_type])
}

model yl_points_account {
  user_id    String @id
  balance    BigInt @default(0)
  updated_at DateTime
}

model yl_points_ledger {
  id         String   @id @default(uuid)
  user_id    String
  delta      Int
  reason     Int      // 1=signin 2=task 3=quiz 4=admin 5=other
  ref_type   Int?
  ref_id     String?
  memo       String?
  created_at DateTime
}

model yl_signin_record {
  user_id      String
  signin_date  DateTime // date in DB
  is_signed    Boolean  @default(true)
  streak_count Int      @default(0)
  created_at   DateTime

  @@id([user_id, signin_date])
}

model yl_daily_task {
  id         String   @id @default(uuid)
  code       String   @unique
  name       String
  rule_json  Json
  points     Int
  is_enabled Boolean  @default(true)
  created_at DateTime
}

model yl_daily_task_progress {
  user_id    String
  task_date  DateTime // date in DB
  task_id    String
  progress   Int      @default(0)
  target     Int      @default(1)
  status     Int      @default(1) // 1=doing 2=claimable 3=done
  updated_at DateTime

  @@id([user_id, task_date, task_id])
}

model yl_daily_quiz {
  quiz_date DateTime @id  // date in DB
  question  Json
  answer    Json
  points    Int      @default(5)
  created_at DateTime
}

model yl_daily_quiz_record {
  user_id     String
  quiz_date   DateTime
  user_answer Json
  is_correct  Boolean
  points      Int
  created_at  DateTime

  @@id([user_id, quiz_date])
}

model yl_badge {
  id         String   @id @default(uuid)
  series     Int      // 1=points 2=signin
  name       String
  threshold  Json     // {"points":1000} or {"streak":7}
  sort_order Int      @default(0)
  created_at DateTime
}

model yl_user_badge {
  user_id     String
  badge_id    String
  unlocked_at DateTime

  @@id([user_id, badge_id])
}

model yl_user_event {
  id          String   @id @default(uuid)
  user_id     String?
  event_type  String   // VIEW_CONTENT/VIEW_ACTIVITY/LIKE/FAV/COMMENT_CREATE/SIGNUP_ACTIVITY/SIGNIN/...
  target_type Int?
  target_id   String?
  meta        Json?
  created_at  DateTime

  // VIEW dedup is done via Redis 10min window (not DB constraint)
}

model yl_weekly_recommendation {
  user_id    String
  week_start DateTime // date in DB
  items      Json     // may include activity + content
  created_at DateTime
  updated_at DateTime

  @@id([user_id, week_start])
}
model yl_outbox_event {
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
