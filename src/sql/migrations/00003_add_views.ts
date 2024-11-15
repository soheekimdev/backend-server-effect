import { SqlClient } from '@effect/sql';
import { Effect } from 'effect';

const program = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  yield* sql.onDialectOrElse({
    pg: () => sql`
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'post' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE post
    ADD COLUMN view_count INT DEFAULT 0;
  END IF;
END $$;

CREATE VIEW post_like_counts AS
SELECT
  post.*,
  account.username as account_username,
  COALESCE(SUM(CASE WHEN "like".type = 'like' THEN "like".count ELSE 0 END), 0)::integer AS like_count,
  COALESCE(SUM(CASE WHEN "like".type = 'dislike' THEN "like".count ELSE 0 END), 0)::integer AS dislike_count,
  COALESCE(SUM(CASE WHEN "like".type = 'like' THEN "like".count ELSE 0 END), 0)::integer - COALESCE(SUM(CASE WHEN "like".type = 'dislike' THEN "like".count ELSE 0 END), 0)::integer as pure_like_count,
  COALESCE(COUNT(comment.id), 0)::integer AS comment_count
FROM
  post
LEFT JOIN
  "like" ON post.id = "like".post_id
LEFT JOIN
  account ON post.account_id = account.id
LEFT JOIN
  comment ON post.id = comment.post_id
GROUP BY
  post.id,
  account.id;

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
  account.id


CREATE VIEW challenge_like_counts AS
SELECT
  challenge.*,
  account.username as account_username,
  COALESCE(SUM(CASE WHEN "like".type = 'like' THEN "like".count ELSE 0 END), 0)::integer AS like_count,
  COALESCE(SUM(CASE WHEN "like".type = 'dislike' THEN "like".count ELSE 0 END), 0)::integer AS dislike_count,
  COALESCE(SUM(CASE WHEN "like".type = 'like' THEN "like".count ELSE 0 END), 0)::integer - COALESCE(SUM(CASE WHEN "like".type = 'dislike' THEN "like".count ELSE 0 END), 0)::integer as pure_like_count
FROM
  challenge
LEFT JOIN
  "like" ON challenge.id = "like".challenge_id
LEFT JOIN
  account ON challenge.account_id = account.id
GROUP BY
  challenge.id,
  account.id;

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
`,
    orElse: () => sql``,
  });
});

export default program;
