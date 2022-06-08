const core = require('@actions/core');
const github = require('@actions/github');
const { imageHash }= require('image-hash');

/**
 * Check if the user that created this issue has a default image, if so:
 * 1) Add a label to the issue
 * 2) Optionally close the issue and leave a comment telling them why it was closed
 * @returns 
 */
async function main() {
    try {
        const githubToken = core.getInput('repo-token');
        const client = github.getOctokit(githubToken);

        const issueNumber = github.context.payload.issue.number;
        console.log(`Triggered for issue ${issueNumber}`)

        const issueLabel = core.getInput('label') || 'faceless';
        const closeIssue = core.getInput('close') === "true";

        const issueBaseOptions = {
            repo: github.context.payload.repository.name,
            owner: github.context.payload.repository.owner.login,
            issue_number: issueNumber, labels: [issueLabel]
        };

        const defaultUserImage = await userHasDefaultImage(github.context.payload.issue.user.login);
        if (!defaultUserImage) {
            console.log("User does not have a default profile image");
            return;
        }

        //Label the issue with the provided or default label
        console.log(`Labeling issue ${issueNumber} with label ${issueLabel}`)
        await client.rest.issues.addLabels(issueBaseOptions)

        //Close and comment on the issue if applicable
        if (closeIssue) {
            console.log(`Closing issue ${issueNumber}`)
            await client.rest.issues.update({
                ...issueBaseOptions,
                state: "closed",
            })
            await client.rest.issues.createComment({
                ...issueBaseOptions,
                body: `This issue has been automatically closed by [faceless](https://github.com/teamreadme/faceless) due to being created by a user without an avatar. Please update your github profile picture and recreate this issue.`
            })
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

/**
 * Request the hash for the user's actual profile image vs. what their proposed identicon would be
 * @param {*} username 
 * @returns `true` if the actual profile picture and the identicon match
 */
async function userHasDefaultImage(username) {
    let [profileHash, identiconHash] = await Promise.all([
        getImageHash(`https://github.com/${username}.png`),
        getImageHash(`https://github.com/identicons/${username}.png`),
    ])
    return profileHash === identiconHash;
}

async function getImageHash(url) {
    return new Promise((resolve, reject) => {
        // remote file simple
        imageHash(url, 16, true, (error, data) => {
            if (error) return reject(error);
            resolve(data)
        });
    })
}

main();