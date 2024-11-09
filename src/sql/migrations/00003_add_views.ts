import { SqlClient } from '@effect/sql';
import { Effect } from 'effect';

const program = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  yield* sql.onDialectOrElse({
    pg: () => sql`
ALTER TABLE post
ADD COLUMN view_count INT DEFAULT 0;

CREATE VIEW post_like_counts AS
SELECT
  post.*,
  COALESCE(SUM(CASE WHEN "like".type = 'like' THEN "like".count ELSE 0 END), 0) AS like_count,
  COALESCE(SUM(CASE WHEN "like".type = 'dislike' THEN "like".count ELSE 0 END), 0) AS dislike_count
FROM
  post
LEFT JOIN
  "like" ON post.id = "like".post_id
GROUP BY
  post.id;

CREATE VIEW post_comment_counts AS
SELECT
  post.*,
  COALESCE(COUNT(comment.id), 0) AS comment_count
FROM
  post
LEFT JOIN
  comment ON post.id = comment.post_id
GROUP BY
  post.id;

CREATE VIEW comment_like_counts AS
SELECT
  comment.*,
  COALESCE(SUM(CASE WHEN "like".type = 'like' THEN "like".count ELSE 0 END), 0) AS like_count,
  COALESCE(SUM(CASE WHEN "like".type = 'dislike' THEN "like".count ELSE 0 END), 0) AS dislike_count
FROM
  comment
LEFT JOIN
  "like" ON comment.id = "like".comment_id
GROUP BY
  comment.id;

CREATE VIEW challenge_like_counts AS
SELECT
  challenge.*,
  COALESCE(SUM(CASE WHEN "like".type = 'like' THEN "like".count ELSE 0 END), 0) AS like_count,
  COALESCE(SUM(CASE WHEN "like".type = 'dislike' THEN "like".count ELSE 0 END), 0) AS dislike_count
FROM
  challenge
LEFT JOIN
  "like" ON challenge.id = "like".challenge_id
GROUP BY
  challenge.id;

CREATE VIEW challenge_event_like_counts AS
SELECT
  challenge_event.*,
  COALESCE(SUM(CASE WHEN "like".type = 'like' THEN "like".count ELSE 0 END), 0) AS like_count,
  COALESCE(SUM(CASE WHEN "like".type = 'dislike' THEN "like".count ELSE 0 END), 0) AS dislike_count
FROM
  challenge_event
LEFT JOIN
  "like" ON challenge_event.id = "like".challenge_event_id
GROUP BY
  challenge_event.id;
`,
    orElse: () => sql``,
  });
});

export default program;
