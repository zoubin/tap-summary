# tap-summary
Summarize TAP.

[![version](https://img.shields.io/npm/v/tap-summary.svg)](https://www.npmjs.org/package/tap-summary)
[![status](https://travis-ci.org/zoubin/tap-summary.svg?branch=master)](https://travis-ci.org/zoubin/tap-summary)
[![dependencies](https://david-dm.org/zoubin/tap-summary.svg)](https://david-dm.org/zoubin/tap-summary)
[![devDependencies](https://david-dm.org/zoubin/tap-summary/dev-status.svg)](https://david-dm.org/zoubin/tap-summary#info=devDependencies)

## Usage

```javascript
var reporter = require('tap-summary')()

```

or in `package.json`

```json
{
  "scripts": {
    "test": "tape test/*.js | tap-summary"
  }
}
```

## Example

![summary](example/clip.gif)

