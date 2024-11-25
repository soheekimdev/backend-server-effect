import { SqlClient } from '@effect/sql';
import { Effect } from 'effect';

const program = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql.onDialectOrElse({
    pg: () =>
      sql`      
      create table account (
  id uuid primary key default gen_random_uuid (),
  email text not null unique,
  password_hash text not null,
  password_salt text not null,
  profile_image_url text,
  main_language text,
  nationality text,
  bio text,
  external_urls text[],
  is_private boolean default false,
  is_email_verified boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  role text check (role in ('admin', 'user', 'banned')) default 'user'
);

create table challenge (
  id uuid primary key default gen_random_uuid (),
  title text,
  description text,
  challenge_image_url text,
  type text,
  start_date date,
  end_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  account_id uuid,
  is_deleted boolean default false,
  is_published boolean default false,
  is_finished boolean default false,
  constraint fk_challenge_writer_account_id foreign key (account_id) references account (id)
);

create table message_channel (
  id uuid primary key default gen_random_uuid (),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_deleted boolean default false,
  is_blocked boolean default false,
  is_muted boolean default false,
  type text,
  name text,
  description text,
  image_url text,
  is_private boolean default false,
  challenge_id uuid,
  account_id uuid,
  constraint fk_message_channel_account_id foreign key (account_id) references account (id),
  constraint fk_message_channel_challenge_id foreign key (challenge_id) references challenge (id)
);

create table message_channel_member (
  id uuid primary key default gen_random_uuid (),
  account_id uuid,
  message_channel_id uuid,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_deleted boolean default false,
  is_blocked boolean default false,
  is_muted boolean default false,
  constraint fk_message_channel_member_account_id foreign key (account_id) references account (id),
  constraint fk_message_channel_member_message_channel_id foreign key (message_channel_id) references message_channel (id)
);

create table account_verification (
  id uuid primary key default gen_random_uuid (),
  account_id uuid not null,
  email text not null,
  is_sent boolean default false,
  verification_code text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_verified boolean default false,
  valid_until timestamp with time zone default (now() + interval '1 day'),
  constraint fk_account_verification_account_id foreign key (account_id) references account (id)
);

create table account_block (
  id uuid primary key default gen_random_uuid (),
  blocker_account_id uuid not null,
  blocked_account_id uuid not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_deleted boolean default false,
  constraint fk_account_block_blocker_account_id foreign key (blocker_account_id) references account (id),
  constraint fk_account_block_blocked_account_id foreign key (blocked_account_id) references account (id)
);

create table post (
  id uuid primary key default gen_random_uuid (),
  title text,
  content text,
  content_type text,
  external_link text,
  is_deleted boolean default false,
  type text,
  is_comment_allowed boolean default true,
  is_like_allowed boolean default true,
  view_count int4 DEFAULT 0 NULL,
  challenge_id uuid,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  account_id uuid,
  constraint fk_post_challenge_id foreign key (challenge_id) references challenge (id),
  constraint fk_post_account_id foreign key (account_id) references account (id)
);

create table comment (
  id uuid primary key default gen_random_uuid (),
  content text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  account_id uuid,
  post_id uuid,
  is_deleted boolean default false,
  parent_comment_id uuid,
  constraint fk_comment_account_id foreign key (account_id) references account (id),
  constraint fk_comment_post_id foreign key (post_id) references post (id),
  constraint fk_comment_parent_comment_id foreign key (parent_comment_id) references comment (id)
);

create table "like" (
  id uuid primary key default gen_random_uuid (),
  account_id uuid not null,
  post_id uuid,
  comment_id uuid,
  challenge_id uuid,
  challenge_event_id uuid,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  type text check (type in ('like', 'dislike')),
  count integer default 1,
  constraint fk_like_account_id foreign key (account_id) references account (id),
  constraint fk_like_post_id foreign key (post_id) references post (id),
  constraint fk_like_comment_id foreign key (comment_id) references comment (id)
);

create table follow (
  id uuid primary key default gen_random_uuid (),
  follower_id uuid,
  following_id uuid,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_follow_accepted boolean,
  is_follow_requested boolean,
  constraint fk_follow_follower_id foreign key (follower_id) references account (id),
  constraint fk_follow_following_id foreign key (following_id) references account (id)
);

create table notification (
  id uuid primary key default gen_random_uuid (),
  sender_account_id uuid,
  receiver_account_id uuid,
  type text check (
    type in (
      'like',
      'comment',
      'follow',
      'mention',
      'reply',
      'share',
      'system',
      'message',
      'advertisement',
      'other'
    )
  ),
  message text,
  link_to text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_read boolean default false,
  is_deleted boolean default false,
  constraint fk_notification_receiver_account_id foreign key (receiver_account_id) references account (id),
  constraint fk_notification_sender_account_id foreign key (sender_account_id) references account (id)
);

create table challenge_event (
  id uuid primary key default gen_random_uuid (),
  title text,
  description text,
  check_type text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  challenge_id uuid not null,
  account_id uuid not null,
  is_deleted boolean default false,
  is_published boolean default false,
  is_finished boolean default false,
  start_datetime timestamp with time zone,
  end_datetime timestamp with time zone,
  coordinate extensions.geography NULL,
  constraint fk_challenge_event_account_id foreign key (challenge_id) references challenge (id),
  constraint fk_challenge_event_challenge_id foreign key (challenge_id) references challenge (id)
);

create table challenge_participant (
  id uuid primary key default gen_random_uuid (),
  account_id uuid,
  challenge_id uuid,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_deleted boolean default false,
  status text,
  is_winner boolean default false,
  is_finished boolean default false,
  constraint fk_challenge_participant_account_id foreign key (account_id) references account (id),
  constraint fk_challenge_participant_challenge_id foreign key (challenge_id) references challenge (id)
);

create table challenge_event_participant (
  id uuid primary key default gen_random_uuid (),
  account_id uuid not null,
  challenge_event_id uuid not null,
  challenge_id uuid not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_checked boolean default false,
  unique (account_id, challenge_event_id),
  constraint fk_challenge_event_participant_account_id foreign key (account_id) references account (id),
  constraint fk_challenge_event_participant_challenge_event_id foreign key (challenge_event_id) references challenge_event (id),
  constraint fk_challenge_event_participant_challenge_id foreign key (challenge_id) references challenge (id)
);

CREATE TABLE tag (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,
  CONSTRAINT unique_name UNIQUE (name)
);

create table account_interest_tag (
  id uuid primary key default gen_random_uuid (),
  account_id uuid not null,
  tag_id uuid not null,
  unique (account_id, tag_id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_deleted boolean default false,
  constraint fk_account_interest_tag_account_id foreign key (account_id) references account (id),
  constraint fk_account_interest_tag_tag_id foreign key (tag_id) references tag (id)
);

create table tag_target (
  id uuid primary key default gen_random_uuid (),
  post_id uuid,
  challenge_id uuid,
  challenge_event_id uuid,
  tag_id uuid not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_deleted boolean default false,
  constraint fk_tag_target_post_id foreign key (post_id) references post (id),
  constraint fk_tag_target_tag_id foreign key (tag_id) references tag (id),
  constraint fk_tag_target_challenge_id foreign key (challenge_id) references challenge (id)
);

create table message (
  id uuid primary key default gen_random_uuid (),
  sender_account_id uuid,
  receiver_account_id uuid,
  content text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_deleted boolean default false,
  is_read boolean default false,
  is_sent boolean default false,
  is_received boolean default false,
  child_message_id uuid,
  is_system_message boolean default false,
  message_channel_id uuid,
  constraint fk_message_sender_account_id foreign key (sender_account_id) references account (id),
  constraint fk_message_receiver_account_id foreign key (receiver_account_id) references account (id),
  constraint fk_message_child_message_id foreign key (child_message_id) references message (id),
  constraint fk_message_message_channel_id foreign key (message_channel_id) references message_channel (id)
);`,
    orElse: () => sql``,
  });
});

export default program;
