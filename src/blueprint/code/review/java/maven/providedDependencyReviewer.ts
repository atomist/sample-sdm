import { DefaultReviewComment, ReviewComment } from "@atomist/automation-client/operations/review/ReviewResult";
import { File } from "@atomist/automation-client/project/File";
import { Project } from "@atomist/automation-client/project/Project";
import { IsMaven, ReviewerRegistration, VersionedArtifact } from "@atomist/sdm";
import { promisify } from "util";
import * as xml2js from "xml2js";

import * as _ from "lodash";

/**
 * Ban Maven "provided" properties
 */
export const ProvidedDependencyReviewer: ReviewerRegistration = {
    name: "HardcodedProperties",
    pushTest: IsMaven,
    action: async pil => {
        return {
            repoId: pil.id,
            comments: await findProvidedProperties(pil.project),
        };
    },
};

async function findProvidedProperties(p: Project): Promise<ReviewComment[]> {
    const pom = await p.getFile("pom.xml");
    if (!pom) {
        return [];
    }
    const parsed = await parsePom(pom);
    const dependencies = _.get<Array<{dependency: { scope: string[] }}>>(parsed, "project.dependencies") || [];
    return dependencies
        .map(d => d.dependency[0])
        .filter(dep => !!dep.scope && dep.scope.length === 1 && dep.scope[0] === "provided")
        .map(dep => new DefaultReviewComment("error", "provided-dependency",
            `Provided dependency: ${JSON.stringify(dep)}`,
            {
                path: "pom.xml",
                lineFrom1: 1,
                offset: -1,
            }));
}

async function parsePom(pom: File): Promise<any> {
    const xml = await pom.getContent();
    const parser = new xml2js.Parser();
    const parsed = await promisify(parser.parseString)(xml);
    return parsed;
}
