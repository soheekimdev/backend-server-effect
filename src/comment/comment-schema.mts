import { AccountId } from '@/account/account-schema.mjs';
import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';
import { PostId } from '@/post/post-schema.mjs';
import { Model } from '@effect/sql';
import { Schema } from 'effect';

export const CommentId = Schema.String.pipe(Schema.brand('CommentId'));

export type CommentId = typeof CommentId.Type;

const fields = {
  id: CommentId,
  postId: PostId,
  accountId: AccountId,
  content: Schema.String.pipe(
    Schema.annotations({
      description: '댓글 내용',
      default: '안녕하세요',
    }),
  ),
  // parentCommentId: Schema.optionalWith(
  //   CommentId.pipe(
  //     Schema.annotations({
  //       description: '부모 댓글의 ID',
  //       default: null,
  //     }),
  //   ),
  //   {
  //     description: '부모 댓글의 ID',
  //     nullable: true,
  //     onNoneEncoding: () => null,
  //   },
  // ),
  isDeleted: Schema.Boolean,
  createdAt: Schema.DateTimeUtcFromSelf,
  updatedAt: Schema.DateTimeUtcFromSelf,
};

export class Comment extends Model.Class<Comment>('Comment')({
  ...fields,
  id: Model.Generated(fields.id),
  postId: Model.FieldExcept('jsonCreate', 'jsonUpdate')(fields.postId),
  accountId: Model.FieldExcept('jsonCreate', 'jsonUpdate')(fields.accountId),
  isDeleted: Model.FieldExcept('jsonCreate')(fields.isDeleted),
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

const viewFields = {
  ...fields,
  likeCount: Schema.Number.pipe(
    Schema.int(),
    Schema.nonNegative(),
    Schema.annotations({
      default: 0,
      description: '이 게시글에 달린 좋아요의 수',
    }),
  ),
  dislikeCount: Schema.Number.pipe(
    Schema.int(),
    Schema.nonNegative(),
    Schema.annotations({
      default: 0,
      description: '이 게시글에 달린 싫어요의 수',
    }),
  ),
};

export class CommentView extends Model.Class<CommentView>('Comment')({
  ...viewFields,
  id: Model.Generated(fields.id),
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

interface CommentViewTreeEncoded
  extends Schema.Struct.Encoded<typeof viewFields> {
  // Define `subcategories` using recursion
  readonly childrenComments: ReadonlyArray<CommentViewTreeEncoded>;
}

export class CommentViewTree extends Model.Class<CommentViewTree>(
  'CommentViewTree',
)({
  ...viewFields,
  childrenComments: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<CommentViewTree, CommentViewTreeEncoded> =>
        CommentViewTree,
    ),
  ),
}) {}
