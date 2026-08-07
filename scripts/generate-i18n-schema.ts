/* oxlint-disable no-console */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { colors } from "./utils/colors.ts";
import {
	FEATURE_FILES,
	LOCALES_DIRECTORY,
	REFERENCE_LOCALE,
	localeFeatureAbsolutePath,
} from "./utils/i18n-locale-files.ts";

const I18N_DIRECTORY = join(import.meta.dirname, "../i18n");
const SCHEMAS_DIRECTORY = join(I18N_DIRECTORY, "schemas");

type Json = Record<string, unknown>;
type LocaleJson = Json & { $schema?: string };

interface JsonSchema {
	$schema?: string;
	title?: string;
	description?: string;
	type: string;
	properties?: Record<string, JsonSchema>;
	additionalProperties?: boolean;
}

const generateSubSchema = (obj: Json): JsonSchema => {
	const properties: Record<string, JsonSchema> = {};

	for (const [key, value] of Object.entries(obj)) {
		if (key === "$schema") continue;
		if (value !== null && typeof value === "object" && !Array.isArray(value)) {
			properties[key] = generateSubSchema(value as Json);
		} else {
			properties[key] = { type: "string" };
		}
	}

	return {
		type: "object",
		properties,
		additionalProperties: false,
	};
};

const generateSchema = (obj: LocaleJson, featureFile: string): JsonSchema => {
	const baseSchema = generateSubSchema(obj);
	return {
		$schema: "http://json-schema.org/draft-07/schema#",
		title: `WolfStar i18n locale file (${featureFile})`,
		description: `Schema for ${featureFile}. Generated from ${REFERENCE_LOCALE}/${featureFile} — do not edit manually.`,
		...baseSchema,
		properties: {
			...baseSchema.properties,
			$schema: { type: "string" },
		},
	};
};

/*
 * Generates JSON Schemas from each English feature file under i18n/locales/en/
 * and writes them to i18n/schemas/{feature}.json.
 */
const main = async (): Promise<void> => {
	await mkdir(SCHEMAS_DIRECTORY, { recursive: true });

	for (const featureFile of FEATURE_FILES) {
		const referenceFilePath = localeFeatureAbsolutePath(REFERENCE_LOCALE, featureFile);
		const referenceContent = JSON.parse(
			await readFile(referenceFilePath, "utf-8"),
		) as LocaleJson;
		const schema = generateSchema(referenceContent, featureFile);
		const schemaFileName = featureFile.replace(/\.json$/, ".schema.json");
		const schemaFilePath = join(SCHEMAS_DIRECTORY, schemaFileName);
		await writeFile(schemaFilePath, `${JSON.stringify(schema, null, "\t")}\n`, "utf-8");

		// Point every locale's copy of this feature at the matching schema.
		const schemaRef = `../../schemas/${schemaFileName}`;
		for (const localeDir of await (
			await import("node:fs/promises")
		).readdir(LOCALES_DIRECTORY, { withFileTypes: true })) {
			if (!localeDir.isDirectory()) continue;
			const featurePath = join(LOCALES_DIRECTORY, localeDir.name, featureFile);
			const content = JSON.parse(await readFile(featurePath, "utf-8")) as LocaleJson;
			content.$schema = schemaRef;
			await writeFile(featurePath, `${JSON.stringify(content, null, "\t")}\n`, "utf-8");
		}

		console.log(colors.green(`✅ Generated schema at ${schemaFilePath}`));
	}

	// Keep a merged root schema pointer for docs that still mention schema.json.
	const mergedNote = {
		$schema: "http://json-schema.org/draft-07/schema#",
		title: "WolfStar i18n schemas index",
		description:
			"Locales are split by feature under i18n/locales/{locale}/*.json. See i18n/schemas/*.schema.json.",
		features: FEATURE_FILES,
	};
	await writeFile(
		join(I18N_DIRECTORY, "schema.json"),
		`${JSON.stringify(mergedNote, null, "\t")}\n`,
		"utf-8",
	);
};

await main();
