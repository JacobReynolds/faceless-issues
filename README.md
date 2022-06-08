# 🙈 Faceless Issues

This Github Action will label and optionally close issues created by users without profile pictures. This is meant to decrease the amount of low quality submissions in your repository. It is best accompanied by a warning to users, so those that follow the rules will not have their issues closed.

## Detection methods
We detect users without profile pictures by sending 2 requests:
1) Their actual profile image, e.g. https://github.com/teamreadme.png
2) Their default identicon, e.g. https://github.com/identicons/teamreadme.png

and comparing the 2 images. If they match, the issue is labeled and optionally closed.

## Inputs

## `label`

**Optional** The label to apply to users without a profile picture. Default `"faceless"`.


## `close`

**Optional** Automatically close issues created by users without a profile picture. Default `false`.

## Example usage
Paste the following into `.github/workflows/faceless-issues.yml`
```
on:
  issues:
    types: [opened]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: teamreadme/faceless-issues@v1.0
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          close: true
          label: 'low-quality'
```

## Inspiration
Thanks to [@davidhemphill](https://twitter.com/davidhemphill) for the [inspiration](https://twitter.com/davidhemphill/status/1534384939449425920)!

## Deployment notes

Before creating a new release, make sure to [compile the action](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github) using `ncc build index.js --license LICENSE`.
