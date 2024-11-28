import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';
import { Model } from '@effect/sql';
import { Schema } from 'effect';

export const TagId = Schema.String.pipe(Schema.brand('TagId'));

export type TagId = typeof TagId.Type;

export class Tag extends Model.Class<Tag>('Tag')({
  id: Model.Generated(TagId),
  name: Model.FieldExcept('jsonUpdate')(Schema.String.pipe(Schema.trimmed())),
  hslColor: Schema.NullishOr(
    Schema.String.pipe(
      Schema.filter((colorStr) => {
        // colorStr is hsl string
        const regex = /^(\d+)\s+(\d+)%\s+(\d+)%$/;

        if (!regex.test(colorStr)) {
          return false;
        }

        const [_, h, s, l] = regex.exec(colorStr)!;

        if (parseInt(h, 10) < 0 || parseInt(h, 10) >= 360) {
          return false;
        }

        if (parseInt(s, 10) < 0 || parseInt(s, 10) > 100) {
          return false;
        }

        if (parseInt(l, 10) < 0 || parseInt(l, 10) > 100) {
          return false;
        }

        return true;
      }),
      Schema.annotations({
        description:
          '색상을 hsl로 표현한 문자열입니다. hsl(<문자열값>) 에 해당하는 문자열값을 입력으로 넣어주세요. 그래야 프론트엔드에서 색상을 원활하게 표현할 수 있습니다.',
        examples: ['0 100% 50%', '120 100% 50%', '240 100% 50%'],
        default: '0 100% 50%',
        jsonSchema: {
          type: 'string',
          example: '0 100% 50%',
        },
      }),
    ),
  ),
  description: Schema.String,
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}
