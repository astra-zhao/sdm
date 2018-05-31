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

import { Configuration } from "@atomist/automation-client";
import * as _ from "lodash";
import { DefaultRepoRefResolver } from "../handlers/common/DefaultRepoRefResolver";
import { GitHubCredentialsResolver } from "../handlers/common/GitHubCredentialsResolver";
import { EphemeralLocalArtifactStore } from "../internal/artifact/local/EphemeralLocalArtifactStore";
import { rolarAndDashboardLogFactory } from "../log/rolarAndDashboardLogFactory";
import { CachingProjectLoader } from "../project/CachingProjectLoader";
import { ConcreteSoftwareDeliveryMachineOptions } from "./ConcreteSoftwareDeliveryMachineOptions";

export function defaultSoftwareDeliveryMachineOptions(configuration: Configuration): ConcreteSoftwareDeliveryMachineOptions {
    return {
        artifactStore: new EphemeralLocalArtifactStore(),
        projectLoader: new CachingProjectLoader(),
        logFactory: rolarAndDashboardLogFactory(_.get(configuration, "sdm.rolar.url"),
            _.get(configuration, "sdm.dashboard.url")),
        credentialsResolver: new GitHubCredentialsResolver(),
        repoRefResolver: new DefaultRepoRefResolver(),
    };
}
