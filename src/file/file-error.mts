import { HttpApiSchema } from '@effect/platform';
import { Schema } from 'effect';

export class FileUploadError extends Schema.TaggedError<FileUploadError>()(
  'FileUploadError',
  // This is from StorageError in @supabase/storage-js
  /**
   * export class StorageError extends Error {
   *   protected __isStorageError = true
   *   constructor(message: string) {
   *     super(message)
   *     this.name = 'StorageError'
   *   }
   * }
   */
  {
    name: Schema.String,
    message: Schema.String,
  },
  HttpApiSchema.annotations({
    status: 409,
    title: 'Invalid File Upload',
    description: '파일 업로드가 실패했습니다.',
  }),
) {}

export class FileInfoFetchingError extends Schema.TaggedError<FileInfoFetchingError>()(
  'FileInfoFetchingError',
  {
    name: Schema.String,
    message: Schema.String,
  },
  HttpApiSchema.annotations({
    status: 404,
    title: 'File Not Found',
    description: '파일을 찾을 수 없습니다.',
  }),
) {}

export class FileTypeMismatchError extends Schema.TaggedError<FileTypeMismatchError>()(
  'FileTypeMismatchError',
  {
    name: Schema.String,
    message: Schema.String,
  },
  HttpApiSchema.annotations({
    status: 409,
    title: 'File Type Mismatch',
    description: '파일 타입이 맞지 않습니다.',
  }),
) {}
