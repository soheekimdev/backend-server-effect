import { SqlClient } from '@effect/sql';
import { Effect } from 'effect';

const program = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  yield* sql.onDialectOrElse({
    pg: () => sql`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'post'
      AND table_schema = 'public'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'comment'
      AND table_schema = 'public'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'challenge'
      AND table_schema = 'public'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'challenge_event'
      AND table_schema = 'public'
  ) THEN
  

CREATE VIEW post_like_counts AS
SELECT
  post.*,
  account.username AS account_username,
  COALESCE(like_counts.like_count, 0)::integer AS like_count,
  COALESCE(like_counts.dislike_count, 0)::integer AS dislike_count,
  COALESCE(like_counts.like_count, 0)::integer - COALESCE(like_counts.dislike_count, 0)::integer AS pure_like_count,
  COALESCE(like_counts.like_count, 0)::integer + COALESCE(like_counts.dislike_count, 0)::integer AS conteroversial_count,
  COALESCE(comment_counts.comment_count, 0)::integer AS comment_count
FROM
  post
LEFT JOIN
  account ON post.account_id = account.id
LEFT JOIN (
  SELECT
    post_id,
    SUM(CASE WHEN "like".type = 'like' THEN "like".count ELSE 0 END) AS like_count,
    SUM(CASE WHEN "like".type = 'dislike' THEN "like".count ELSE 0 END) AS dislike_count
  FROM
    "like"
  GROUP BY
    post_id
) AS like_counts ON post.id = like_counts.post_id
LEFT JOIN (
  SELECT
    post_id,
    COUNT(DISTINCT comment.id) AS comment_count
  FROM
    comment
  GROUP BY
    post_id
) AS comment_counts ON post.id = comment_counts.post_id
GROUP BY
  post.id,
  account.id,
  like_counts.like_count,
  like_counts.dislike_count,
  comment_counts.comment_count;
  
CREATE VIEW comment_like_counts AS
SELECT
  comment.*,
  account.username as account_username,
  COALESCE(SUM(CASE WHEN "like".type = 'like' THEN "like".count ELSE 0 END), 0)::integer AS like_count,
  COALESCE(SUM(CASE WHEN "like".type = 'dislike' THEN "like".count ELSE 0 END), 0)::integer AS dislike_count,
  COALESCE(SUM(CASE WHEN "like".type = 'like' THEN "like".count ELSE 0 END), 0)::integer -  COALESCE(SUM(CASE WHEN "like".type = 'dislike' THEN "like".count ELSE 0 END), 0)::integer as pure_like_count
FROM
  comment
LEFT JOIN
  "like" ON comment.id = "like".comment_id
LEFT JOIN
  account ON comment.account_id = account.id
GROUP BY
  comment.id,
  account.id;
  
  
CREATE VIEW challenge_like_counts AS
SELECT
  challenge.*,
  account.username as account_username,
  COALESCE(like_counts.like_count, 0)::integer as like_count,
  COALESCE(like_counts.dislike_count, 0)::integer as dislike_count,
  COALESCE(like_counts.like_count, 0)::integer - COALESCE(like_counts.dislike_count, 0)::integer as pure_like_count,
  COALESCE(like_counts.like_count, 0)::integer + COALESCE(like_counts.dislike_count, 0)::integer as controversial_count,
  COALESCE(challenge_event_counts.challenge_event_count, 0)::integer as challenge_event_count,
  COALESCE(challenge_participant_counts.challenge_participant_count, 0)::integer as challenge_participant_count
FROM
  challenge
LEFT JOIN
  account ON challenge.account_id = account.id
LEFT JOIN (
  SELECT
    challenge_id,
    SUM(CASE WHEN "like".type = 'like' THEN "like".count ELSE 0 END) AS like_count,
    SUM(CASE WHEN "like".type = 'dislike' THEN "like".count ELSE 0 END) AS dislike_count
  FROM
    "like"
  GROUP BY
    challenge_id
) as like_counts ON challenge.id = like_counts.challenge_id
LEFT JOIN (
  SELECT
    challenge_id,
    COUNT(challenge_event.id) AS challenge_event_count
  FROM
    challenge_event
  GROUP BY
    challenge_id
) as challenge_event_counts ON challenge.id = challenge_event_counts.challenge_id
LEFT JOIN (
  SELECT
    challenge_id,
    COUNT(challenge_participant.id) AS challenge_participant_count
  FROM
    challenge_participant
  GROUP BY
    challenge_id
) as challenge_participant_counts ON challenge.id = challenge_participant_counts.challenge_id
GROUP BY
  challenge.id, 
  account.id,
  like_counts.like_count,
  like_counts.dislike_count,
  challenge_event_counts.challenge_event_count,
  challenge_participant_counts.challenge_participant_count;
  
  CREATE VIEW challenge_event_like_counts AS
  SELECT
    challenge_event.*,
    challenge.title as challenge_title,
    account.username as account_username,
    COALESCE(SUM(CASE WHEN "like".type = 'like' THEN "like".count ELSE 0 END), 0)::integer AS like_count,
    COALESCE(SUM(CASE WHEN "like".type = 'dislike' THEN "like".count ELSE 0 END), 0)::integer AS dislike_count,
    COALESCE(SUM(CASE WHEN "like".type = 'like' THEN "like".count ELSE 0 END), 0)::integer - COALESCE(SUM(CASE WHEN "like".type = 'dislike' THEN "like".count ELSE 0 END), 0)::integer as pure_like_count
  FROM
    challenge_event
  LEFT JOIN
    "like" ON challenge_event.id = "like".challenge_event_id
  LEFT JOIN
    challenge ON challenge_event.challenge_id = challenge.id
  LEFT JOIN
    account ON challenge.account_id = account.id
  GROUP BY
    challenge_event.id,
    challenge.id,
    account.id;  
  
  END IF;
END $$;

`,
    orElse: () => sql``,
  });
});

export default program;
