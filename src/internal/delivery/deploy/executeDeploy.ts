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

import { logger, Success } from "@atomist/automation-client";
import { ExecuteGoalResult } from "../../../api/goal/ExecuteGoalResult";
import { Goal } from "../../../api/goal/Goal";
import { ArtifactStore } from "../../../spi/artifact/ArtifactStore";
import { checkOutArtifact, setEndpointGoalOnSuccessfulDeploy, Target } from "./deploy";

import * as _ from "lodash";
import { ExecuteGoalWithLog, RunWithLogContext } from "../../../api/goal/ExecuteGoalWithLog";

/**
 * Execute deploy with the supplied deployer and target
 */
export function executeDeploy(artifactStore: ArtifactStore,
                              endpointGoal: Goal,
                              target: Target): ExecuteGoalWithLog {

    return async (rwlc: RunWithLogContext): Promise<ExecuteGoalResult> => {
        const commit = rwlc.status.commit;
        const {credentials, id, context, progressLog} = rwlc;
        const atomistTeam = context.teamId;

        logger.info("Deploying project %s:%s with target [%j]", id.owner, id.repo, target);

        const artifactCheckout = await checkOutArtifact(_.get(commit, "image.imageName"),
            artifactStore, id, credentials, progressLog);

        // questionable
        artifactCheckout.id.branch = commit.pushes[0].branch;
        const deployments = await target.deployer.deploy(
            artifactCheckout,
            target.targeter(id, id.branch),
            progressLog,
            credentials,
            atomistTeam);

        await Promise.all(deployments.map(deployment => setEndpointGoalOnSuccessfulDeploy(
            {endpointGoal, rwlc, deployment})));

        return Success;
    };
}
