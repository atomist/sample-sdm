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

import {
    ExtensionPack,
    metadata,
} from "@atomist/sdm";
import { RemoveFileEditor } from "../../commands/editors/helper/removeFile";
import { AffirmationTransform } from "./affirmationTransform";
import {
    BreakJavaBuildTransform,
    UnbreakJavaBuildEditor,
} from "./breakJavaBuild";
import {
    BreakNodeBuildTransform,
    UnbreakNodeBuildTransform,
} from "./breakNodeBuild";
import { JavaAffirmationTransform } from "./javaAffirmationTransform";
import { WhackHeaderEditor } from "./removeTypeScriptHeader";

/**
 * Editors for use in demos
 * @param {SoftwareDeliveryMachine} softwareDeliveryMachine
 */
export const DemoEditors: ExtensionPack = {
    ...metadata("demo-editors"),
    configure: sdm =>
        sdm
            .addCodeTransformCommand(BreakNodeBuildTransform)
            .addCodeTransformCommand(UnbreakNodeBuildTransform)
            .addCodeTransformCommand(WhackHeaderEditor)
            .addCodeTransformCommand(JavaAffirmationTransform)
            .addCodeTransformCommand(AffirmationTransform)
            .addCodeTransformCommand(BreakJavaBuildTransform)
            .addCodeTransformCommand(RemoveFileEditor)
            .addCodeTransformCommand(UnbreakJavaBuildEditor),
};
