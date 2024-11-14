import { SupabaseService } from '@/supabase/supabase-service.mjs';
import { Effect, Layer } from 'effect';
import { FileInfoFetchingError, FileUploadError } from './file-error.mjs';
import { ImagePath } from './image-path-schema.mjs';
import { ImageUploadTarget } from './image-target-schema.mjs';
import { ImageInfoSchema } from './image-info-schema.mjs';

const make = Effect.gen(function* () {
  const supabaseService = yield* SupabaseService;

  const getImageAllInfo = (imagePath: ImagePath) =>
    Effect.gen(function* () {
      const path = `${imagePath.type}/${imagePath.id}/${imagePath.filename}.${imagePath.extension}`;
      const {
        data: { publicUrl },
      } = yield* Effect.sync(() =>
        supabaseService.storage.from('image').getPublicUrl(path),
      );

      const infoPath = `${imagePath.type}/${imagePath.id}/${imagePath.filename}.${imagePath.extension}`;

      const result = yield* Effect.tryPromise(async () =>
        supabaseService.storage.from('public/image').info(infoPath),
      );

      if (result.error) {
        return yield* Effect.fail(
          new FileInfoFetchingError({
            message: result.error.message,
            name: result.error.name,
          }),
        );
      }

      return yield* Effect.succeed(
        // @ts-expect-error
        ImageInfoSchema.make({
          ...result.data,
          url: publicUrl,
        }),
      );
    }).pipe(
      Effect.catchAll((error) => {
        return Effect.fail(
          new FileInfoFetchingError({
            message: error.message,
            name: error.name,
          }),
        );
      }),
      Effect.withSpan('FileService.getImageAllInfo'),
    );

  const uploadImage = (image: File, target: ImageUploadTarget) =>
    Effect.gen(function* () {
      const uploaded = yield* Effect.tryPromise(async () => {
        const path = `${target.type}/${target.id}/${target.filename}.${target.extension}`;
        const result = await supabaseService.storage
          .from('image')
          .upload(path, image, {
            upsert: false,
            metadata: {
              ...target,
            },
            contentType: `image/${target.extension}`,
          });

        return result;
      });

      if (uploaded.error) {
        return yield* Effect.fail(
          new FileUploadError({
            message: uploaded.error.message,
            name: 'FileUploadError',
          }),
        );
      }

      if (!uploaded.data.path) {
        return yield* Effect.fail(
          new FileInfoFetchingError({
            message: `Upload was successful, but the file ${image.name} was not found in the response.`,
            name: `FileNotFound`,
          }),
        );
      }

      const {
        data: { publicUrl: newPublicUrl },
      } = supabaseService.storage
        .from('image')
        .getPublicUrl(uploaded.data.path);

      return newPublicUrl;
    }).pipe(
      Effect.catchAll((error) => {
        return Effect.fail(
          new FileUploadError({
            message: error.message,
            name: error.name,
          }),
        );
      }),
      Effect.withSpan('FileService.uploadImage'),
    );

  return {
    uploadImage,
    getImageAllInfo,
  } as const;
});

export class FileService extends Effect.Tag('FileService')<
  FileService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(FileService, make);
  static Live = this.layer.pipe(Layer.provide(SupabaseService.Live));
}
