import { ConfigService } from '@/misc/config-service.mjs';
import { Effect, Layer } from 'effect';
import { createClient } from '@supabase/supabase-js';

const make = Effect.gen(function* () {
  const configService = yield* ConfigService;
  const { supabase } = configService;

  const supabaseClient = createClient(
    `https://${supabase.id}.supabase.co`,
    supabase.anon,
  );

  return supabaseClient;
});

export class SupabaseService extends Effect.Tag('SupabaseService')<
  SupabaseService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(SupabaseService, make);
  static Live = this.layer.pipe(Layer.provide(ConfigService.Live));
}
