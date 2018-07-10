/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { doWithFiles } from "@atomist/automation-client/project/util/projectUtils";
import { CodeTransform, CodeTransformRegistration } from "@atomist/sdm";
import { AllJavaFiles } from "@atomist/sdm-pack-spring";
import { AffirmationParameters, affirmations } from "./affirmationTransform";

const appendAffirmationToJava: CodeTransform<AffirmationParameters> = (p, ci) => {
    const affirmation = ci.parameters.customAffirmation || randomAffirmation();
    let count = 0;
    return doWithFiles(p, AllJavaFiles, f => {
        return f.getContent().then(async content => {
            if (count++ >= 1) {
                return;
            }
            await ci.context.messageClient.respond(`Prepending to \`${f.name}\` via \`${ci.parameters.branchToUse}\`: _${affirmation}_`);
            return f.setContent(`// ${affirmation}\n\n${content}`);
        });
    });
};

/**
 * Harmlessly modify a Java file on master
 * @type {HandleCommand<EditOneOrAllParameters>}
 */
export const JavaAffirmationEditor: CodeTransformRegistration<AffirmationParameters> = {
    transform: appendAffirmationToJava,
    name: "javaAffirmation",
    paramsMaker: () => new AffirmationParameters("Everyone needs encouragement to write Java"),
    editMode: ap => ap.editMode,
    intent: "javakick",
};

function randomAffirmation() {
    return affirmations[getRandomInt(affirmations.length)];
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
