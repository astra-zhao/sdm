/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Project } from "@atomist/automation-client/project/Project";
import { ConsoleProgressLog, mavenDeployer, SingleProjectLoader } from "../../../../../src";
import { GitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";

import * as assert from "power-assert";
import { GitCommandGitProject } from "@atomist/automation-client/project/git/GitCommandGitProject";
import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";

describe("mavenSourceDeployer", () => {

    it("should fail to deploy non Maven", async () => {
        const id = GitHubRepoRef.from({owner: "spring-team", repo: "spring-rest-seed", branch: "master"});
        const p: Project = InMemoryProject.from(id);
        const deployer = mavenDeployer(new SingleProjectLoader(p), {
            baseUrl: "http://127.0.0.1",
            commandLineArgumentsFor: () => [],
            successPattern: /Started [A-Za-z0-9_$]+ in [0-9].[0-9]+ seconds/,
        });
        try {
            await deployer.deploy(
                {id, name: "spring-rest-seed", version: "0.1.0"},
                {
                    name: "foo",
                    description: "whatever",
                    managedDeploymentKey: id,
                }, new ConsoleProgressLog(), {token: process.env.GITHUB_TOKEN}, "T123");
            assert.fail("Should have failed");
        } catch (err) {
            // Ok
        }
    }).timeout(400000);

    it("should deploy valid Maven", async () => {
        const credentials = {token: process.env.GITHUB_TOKEN};
        const id = GitHubRepoRef.from({owner: "atomist-seeds", repo: "spring-rest-seed", branch: "master"});
        const p: Project = await GitCommandGitProject.cloned(credentials, id);
        const deployer = mavenDeployer(new SingleProjectLoader(p), {
            baseUrl: "http://127.0.0.1",
            lowerPort: 10000,
            commandLineArgumentsFor: () => [`-Dserver.port=10000`],
            successPattern: /Started [A-Za-z0-9_$]+ in [0-9].[0-9]+ seconds/,
        });

        const deployed = await deployer.deploy(
            {id, name: "spring-rest-seed", version: "0.1.0"},
            {
                name: "foo",
                description: "whatever",
                managedDeploymentKey: id,
            },
            new ConsoleProgressLog(), credentials, "T123");
        assert(deployed.length === 1);
        await (deployed[0] as any).childProcess.kill();
    }).timeout(400000);

});
