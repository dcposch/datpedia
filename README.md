# datpedia

<img width="1214" alt="screen shot 2018-01-27 at 10 10 53 pm" src="https://user-images.githubusercontent.com/169280/35479552-295eda56-03af-11e8-8bb4-4fcebce794cc.png">

<img width="1214" alt="screen shot 2018-01-27 at 10 11 34 pm" src="https://user-images.githubusercontent.com/169280/35479553-29779dd4-03af-11e8-9973-a64f02b7cfab.png">

<img width="1214" alt="screen shot 2018-01-27 at 10 12 06 pm" src="https://user-images.githubusercontent.com/169280/35479554-298eb69a-03af-11e8-924c-7e361d8c7f88.png">


## quick start

1. get [Beaker Browser](https://beakerbrowser.com)
2. using Beaker, go to `datpedia.org`


## code

```
npm install
npm test
npm start
```

that should print instructions to get started.

- **scripts** contains scripts to download and process Wikipedia dumps
- **www** contains the old-web website served at https://datpedia.org
- **app** contains the React app that renders peer-to-peer Wikipedia


### development setup

Install node or upgrade node. `node --version` should be v9 or above.

```
brew install node
brew upgrade node
```

Install Atom.

Go to Atom > Preferences > Install, then install `prettier-atom`, `flow-ide`, and `linter-eslint`. Restart Atom once these packages finish installing.

Click on Settings for the `prettier-atom` and make them look like this:

![image](https://user-images.githubusercontent.com/169280/34692161-02e31134-f474-11e7-8fb6-22353dd7e3e9.png)

Go to the `flow-ide` settings, set the Flow binary path to `<...path to repo...>/node_modules/.bin/flow`

Go to the `linter-eslint` settings, enable format-on-save. Ignore the warning from `prettier`.

Done! You now have `standard`-compliant autoformatting, linting, and Flow integration.

You should have the following 10 Atom packages installed:

![image](https://user-images.githubusercontent.com/169280/34857020-67ee29ac-f6fd-11e7-9e5a-eb6dc461e033.png)
