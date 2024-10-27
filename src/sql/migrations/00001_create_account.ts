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
        interests text,
        is_email_verified boolean default false,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      );
    `,
    orElse: () => sql``,
  });
});

export default program;
