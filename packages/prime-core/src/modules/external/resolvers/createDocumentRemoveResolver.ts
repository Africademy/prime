import { getRepository, IsNull } from 'typeorm';
import { Document } from '../../../entities/Document';
import { SchemaPayload } from '../interfaces/SchemaPayload';

const getDefaultLocale = () => 'en';

export const createDocumentRemoveResolver = async (payload: SchemaPayload) => {
  const documentRepository = getRepository(Document);
  return async (root, args: { id: string; locale?: string }, context, info) => {
    const key = args.id.length === 36 ? 'id' : 'documentId';
    const locale = args.locale || (await getDefaultLocale());
    const single = payload.schema.settings.single;
    const doc = await documentRepository.findOneOrFail({
      ...(single && { [key]: args.id }),
      ...(single || (key === 'documentId' && { locale })),
      schemaId: payload.schema.id,
      deletedAt: IsNull(),
    });
    const result = await documentRepository.update(
      {
        documentId: doc.id,
        ...(args.locale && { locale }),
      },
      {
        deletedAt: new Date(),
      }
    );

    return result.raw[0].length > 0;
  };
};
