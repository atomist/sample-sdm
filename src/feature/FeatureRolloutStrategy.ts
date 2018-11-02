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
    FeatureInvocation,
    FeatureListener,
} from "./FeatureListener";
import { ComparisonPolicy, FeatureRegistration } from "./FeatureRegistration";
import { SdmContext, SdmListener, SoftwareDeliveryMachine } from "@atomist/sdm";
import { FingerprintData, logger } from "@atomist/automation-client";
import { FeatureStore } from "./FeatureStore";
import { Store } from "./Store";

/**
 * Implemented by types that can roll out a version of a feature to many projects.
 */
export interface FeatureRolloutStrategy<S extends FingerprintData> {

    /**
     * Listener to respond to feature changes
     */
    listener: FeatureListener;

    rolloutFeatureToDownstreamProjects(what: {
        feature: FeatureRegistration<S>,
        valueToUpgradeTo: S,

        /**
         * Name of the code transform
         */
        transformCommandName: string,
        sdm: SoftwareDeliveryMachine,
        i: SdmContext
    }): Promise<void>;
}

/**
 * Invocation when we've seen a version of a feature in a project
 * that is better than our present team-wide ideal.
 */
export interface PossibleNewIdealFeatureInvocation<S extends FingerprintData = any> extends FeatureInvocation<S> {


    /**
     * The current ideal for this feature
     */
    ideal: S;

}


export type PossibleNewIdealFeatureListener = SdmListener<PossibleNewIdealFeatureInvocation<any>>;

export function rolloutBetterThanIdealFeatureListener(
    store: Store,
    featureStore: FeatureStore,
    ...possibleNewIdealFeatureListeners: PossibleNewIdealFeatureListener[]): FeatureListener {
    return async fi => {
        logger.info("Push on project with feature %s", fi.feature.name);
        if (fi.feature.supportedComparisonPolicies.includes(ComparisonPolicy.quality)) {
            const ideal = await featureStore.ideal(fi.feature.name);
            logger.info("Ideal feature %s value is %j", fi.feature.name, ideal);
            if (!!ideal) {
                const valueInProject = await fi.newValue;

                if (fi.feature.compare(ideal, valueInProject, ComparisonPolicy.quality) < 0) {
                    const stored = await store.save(valueInProject);
                    // TODO fill in spread
                    const fui: PossibleNewIdealFeatureInvocation = {
                        addressChannels: fi.addressChannels,
                        id: fi.id,
                        credentials: fi.credentials,
                        context: fi.context,
                        feature: fi.feature,
                        newValue: valueInProject,
                        ideal,
                        storageKeyOfNewValue: stored,
                        rolloutCommandName: fi.rolloutCommandName,
                    };
                    await Promise.all(possibleNewIdealFeatureListeners.map(ful => ful(fui)));
                } else {
                    logger.info("Ideal feature %s value is %j, ours is %j and it's unremarkable", fi.feature.name, ideal, valueInProject);
                }
            } else {
                logger.info("No ideal found for feature %s", fi.feature.name);
            }
        } else {
            logger.info("FeatureRegistration %s doesn't support quality comparison", fi.feature.name);
        }
    };

}