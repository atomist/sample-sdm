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

import { doWithFiles } from "@atomist/automation-client/lib/project/util/projectUtils";
import {
    CodeTransform,
    CodeTransformRegistration,
} from "@atomist/sdm";
import { RequestedCommitParameters } from "../../commands/editors/support/RequestedCommitParameters";

/**
 * Whack the first TypeScript header we get hold off.
 * Intended for demo use.
 * @param {Project} p
 * @param {HandlerContext} ctx
 * @return {Promise<Project>}
 */
const whackSomeHeader: CodeTransform = (p, ci) => {
    let count = 0;
    return doWithFiles(p, "src/**/*.*", async f => {
        if (CFamilySuffix.test(f.path)) {
            const fileContent = await f.getContent();
            if (!fileContent.match(HeaderRegex)) {
                return;
            }
            if (count++ >= 1) {
                return;
            }
            await ci.addressChannels(`Removing a header from \`${f.path}\``);
            return f.setContent(fileContent.replace(HeaderRegex, ""));
        }
    });
};

/**
 * Harmlessly modify a TS file on master
 * @type {HandleCommand<EditOneOrAllParameters>}
 */
export const WhackHeaderEditor: CodeTransformRegistration<RequestedCommitParameters> = {
    transform: whackSomeHeader,
    name: "removeHeader",
    paramsMaker: () => new RequestedCommitParameters("Who needs all these extra characters"),
    transformPresentation: ci => ci.parameters.editMode,
    intent: "remove a header",
};

// TODO switch to CFamily constant from GlobPatterns

const HeaderRegex = /^\/\*[\s\S]*?\*\/\s*/;

const CFamilySuffix = /\.(ts|java)$/;
