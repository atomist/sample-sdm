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
    SoftwareDeliveryMachine,
    SoftwareDeliveryMachineConfiguration,
    suggestAction,
    ToDefaultBranch,
    whenPushSatisfies,
} from "@atomist/sdm";
import { createSoftwareDeliveryMachine } from "@atomist/sdm-core";
import {
    HasSpringBootApplicationClass,
    IsMaven,
} from "@atomist/sdm-pack-spring";

/**
 * Assemble a machine that suggests the potential to use more SDM features
 */
export function evangelicalMachine(
    configuration: SoftwareDeliveryMachineConfiguration): SoftwareDeliveryMachine {
    const sdm = createSoftwareDeliveryMachine(
        { name: "Helpful software delivery machine. You need to be saved.", configuration },
        // whenPushSatisfies(IsMaven, HasSpringBootApplicationClass, not(MaterialChangeToJavaRepo))
        //     .itMeans("No material change to Java")
        //     .setNoMoreGoals(),
        whenPushSatisfies(ToDefaultBranch, IsMaven, HasSpringBootApplicationClass)
            .itMeans("Spring Boot service to deploy")
            .setGoals(suggestAction({
                displayName: "addSpring",
                message: "This is a Spring project. I can help with that",
            })),
    );

    // TODO check if we've sent the message before.
    // Could do in a PushTest
    // sdm.addGoalImplementation("ImmaterialChangeToJava",
    //     ImmaterialChangeToJava,
    //     executeSendMessageToSlack("Looks like you didn't change Java in a material way. " +
    //         "Atomist could prevent you needing to build! :atomist_build_started:"))
    //     .addGoalImplementation("EnableSpringBoot",
    //         EnableSpringBoot,
    //         executeSendMessageToSlack("Congratulations. You're using Spring Boot. It's cool :sunglasses: and so is Atomist. " +
    //             "Atomist knows lots about Spring Boot and would love to help"))
    //     .addChannelLinkListener(SuggestAddingCloudFoundryManifest)
    //     .addNewRepoWithCodeAction(suggestAddingCloudFoundryManifestOnNewRepo(sdm.configuration.sdm.projectLoader))
    //     .addNewRepoWithCodeAction(
    //         // TODO suggest creating projects with generator
    //         tagRepo(springBootTagger),
    //     )
    //     .addCodeTransformCommand(AddCloudFoundryManifest)
    //     .addCommand(EnableDeploy)
    //     .addCommand(DisableDeploy)
    //     .addCommand(DisplayDeployEnablement)
    //     .addExtensionPacks(
    //         DemoEditors,
    //     )
    //     .addPushReaction(enableDeployOnCloudFoundryManifestAddition(sdm));

    // addTeamPolicies(sdm);
    return sdm;
}
