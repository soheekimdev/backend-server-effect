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
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'challenge_participant'
      AND table_schema = 'public'
  )
      THEN
  
-------------------------------------------------------------------------
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
-------------------------------------------------------------------------  


-------------------------------------------------------------------------
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
-------------------------------------------------------------------------  
  


-------------------------------------------------------------------------
CREATE VIEW challenge_like_counts AS
WITH total_participants AS (
  -- Calculate total participants per challenge, including challenges with zero participants
  SELECT
    challenge.id AS challenge_id,
    COUNT(challenge_participant.id)::float AS total_participants
  FROM
    challenge
  LEFT JOIN challenge_participant ON challenge.id = challenge_participant.challenge_id
  GROUP BY
    challenge.id
),
event_checked_counts AS (
  -- Calculate number of checked participants per event, including events with zero participants
  SELECT
    challenge.id AS challenge_id,
    challenge_event.id AS event_id,
    COUNT(CASE WHEN challenge_event_participant.is_checked = TRUE THEN 1 END)::float AS num_checked
  FROM
    challenge
  LEFT JOIN challenge_event ON challenge.id = challenge_event.challenge_id
  LEFT JOIN challenge_event_participant ON challenge_event.id = challenge_event_participant.challenge_event_id
  GROUP BY
    challenge.id,
    challenge_event.id
),
event_fractions AS (
  -- Calculate fraction of checked participants per event, handling division by zero
  SELECT
    event_checked_counts.challenge_id,
    event_checked_counts.event_id,
    CASE
      WHEN total_participants.total_participants > 0 THEN (event_checked_counts.num_checked / total_participants.total_participants)
      ELSE 0
    END AS fraction
  FROM
    event_checked_counts
  LEFT JOIN total_participants ON event_checked_counts.challenge_id = total_participants.challenge_id
),
average_fractions AS (
  -- Calculate average fraction per challenge
  SELECT
    challenge_id,
    AVG(fraction) AS average_fraction
  FROM
    event_fractions
  GROUP BY
    challenge_id
),
like_counts AS (
  -- Calculate like and dislike counts per challenge
  SELECT
    challenge_id,
    SUM(CASE WHEN "like".type = 'like' THEN "like".count ELSE 0 END) AS like_count,
    SUM(CASE WHEN "like".type = 'dislike' THEN "like".count ELSE 0 END) AS dislike_count
  FROM
    "like"
  GROUP BY
    challenge_id
),
challenge_event_counts AS (
  -- Count the number of events per challenge
  SELECT
    challenge_id,
    COUNT(challenge_event.id) AS challenge_event_count
  FROM
    challenge_event
  GROUP BY
    challenge_id
),
challenge_participant_counts AS (
  -- Count the number of participants per challenge
  SELECT
    challenge_id,
    COUNT(challenge_participant.id) AS challenge_participant_count
  FROM
    challenge_participant
  GROUP BY
    challenge_id
)
SELECT
  challenge.*,
  account.username AS account_username,
  COALESCE(like_counts.like_count, 0)::integer AS like_count,
  COALESCE(like_counts.dislike_count, 0)::integer AS dislike_count,
  (COALESCE(like_counts.like_count, 0) - COALESCE(like_counts.dislike_count, 0))::integer AS pure_like_count,
  (COALESCE(like_counts.like_count, 0) + COALESCE(like_counts.dislike_count, 0))::integer AS controversial_count,
  COALESCE(challenge_event_counts.challenge_event_count, 0)::integer AS challenge_event_count,
  COALESCE(challenge_participant_counts.challenge_participant_count, 0)::integer AS challenge_participant_count,
  COALESCE(average_fractions.average_fraction, 0) AS challenge_event_checked_participants_fraction
FROM
  challenge
LEFT JOIN account ON challenge.account_id = account.id
LEFT JOIN like_counts ON challenge.id = like_counts.challenge_id
LEFT JOIN challenge_event_counts ON challenge.id = challenge_event_counts.challenge_id
LEFT JOIN challenge_participant_counts ON challenge.id = challenge_participant_counts.challenge_id
LEFT JOIN average_fractions ON challenge.id = average_fractions.challenge_id;
-------------------------------------------------------------------------

-------------------------------------------------------------------------
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
-------------------------------------------------------------------------

-------------------------------------------------------------------------
CREATE VIEW challenge_event_participation_stats AS
WITH total_participants AS (
  -- Calculate total participants per challenge
  SELECT
    challenge_id,
    COUNT(*)::float AS total_participants
  FROM
    challenge_participant
  GROUP BY
    challenge_id
),
event_checked_counts AS (
  -- Calculate number of checked participants per event
  SELECT
    ce.challenge_id,
    ce.id AS event_id,
    COUNT(cep.account_id)::float AS num_checked
  FROM
    challenge_event ce
  LEFT JOIN challenge_event_participant cep ON
    ce.id = cep.challenge_event_id AND cep.is_checked = TRUE
  GROUP BY
    ce.challenge_id,
    ce.id
),
event_fractions AS (
  -- Calculate fraction of checked participants per event
  SELECT
    ecc.challenge_id,
    ecc.event_id,
    ecc.num_checked,
    tp.total_participants,
    CASE
      WHEN tp.total_participants > 0 THEN (ecc.num_checked / tp.total_participants)
      ELSE 0
    END AS fraction
  FROM
    event_checked_counts ecc
  JOIN total_participants tp ON
    ecc.challenge_id = tp.challenge_id
),
challenge_averages AS (
  -- Calculate average fraction per challenge
  SELECT
    challenge_id,
    COUNT(event_id) AS number_of_events,
    MAX(total_participants) AS total_participants,
    AVG(fraction) AS average_fraction
  FROM
    event_fractions
  GROUP BY
    challenge_id
)
SELECT
  -- Combine challenge averages with event details for verification
  ca.challenge_id,
  ca.total_participants as challenge_participants,
  ca.number_of_events as challenge_events_count,
  ca.average_fraction as challenge_event_participant_check_average,
  ef.event_id as challenge_event_id,
  ef.num_checked as challenge_event_checked_participants_count,
  ef.fraction AS challenge_event_checked_participants_fraction
FROM
  challenge_averages ca
  JOIN event_fractions ef ON ca.challenge_id = ef.challenge_id
ORDER BY
  ca.challenge_id,
  ef.event_id;
-------------------------------------------------------------------------



-------------------------------------------------------------------------
CREATE VIEW challenge_event_checked_participants_fraction AS
WITH challenge_list AS (
  -- Get all challenges
  SELECT
    *
  FROM
    challenge ch
),
total_participants AS (
  -- Calculate total participants per challenge, including challenges with zero participants
  SELECT
    cl.id as challenge_id,
    COUNT(cp.id)::float AS total_participants
  FROM
    challenge_list cl
    LEFT JOIN challenge_participant cp ON cl.id = cp.challenge_id
  GROUP BY
    cl.id
),
event_checked_counts AS (
  -- Calculate number of checked participants per event, including events with zero participants
  SELECT
    cl.id,
    ce.id AS event_id,
    COUNT(CASE WHEN cep.is_checked = TRUE THEN 1 END)::float AS num_checked
  FROM
    challenge_list cl
    LEFT JOIN challenge_event ce ON cl.id = ce.challenge_id
    LEFT JOIN challenge_event_participant cep ON ce.id = cep.challenge_event_id
  GROUP BY
    cl.id,
    ce.id
),
event_fractions AS (
  -- Calculate fraction of checked participants per event, handling division by zero
  SELECT
    ecc.id,
    ecc.event_id,
    CASE
      WHEN tp.total_participants > 0 THEN (ecc.num_checked / tp.total_participants)
      ELSE 0
    END AS fraction
  FROM
    event_checked_counts ecc
    LEFT JOIN total_participants tp ON ecc.id = tp.challenge_id
),
average_fractions AS (
  -- Calculate average fraction per challenge
  SELECT
    event_fractions.id as challenge_id,
    AVG(fraction) AS average_fraction
  FROM
    event_fractions
  GROUP BY
    challenge_id
)
SELECT
  cl.*,
  COALESCE(af.average_fraction, 0) AS challenge_event_checked_participants_fraction
FROM
  challenge_list cl
LEFT JOIN average_fractions af ON cl.id = af.challenge_id
ORDER BY
  average_fraction DESC
  ;
-------------------------------------------------------------------------
  END IF;
END $$;

`,
    orElse: () => sql``,
  });
});

export default program;
