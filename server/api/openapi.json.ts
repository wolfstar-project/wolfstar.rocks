import { openApiDocument } from '~~/server/openapi';

export default defineEventHandler(() => {
	return openApiDocument;
});
