# knocommerce setup script

## What it does

1. It assumes you already have created the subaccount via the https://faraday.ai/developers/reference/createaccount. You could add that to this script if you wanted to
2. Copies FIG-based cohorts from parent to child account.

It tries to be idempotent.

## Usage

```
node index.js $PARENT_API_KEY $CHILD_API_KEY
```

## Copyright

Copyright 2024 Faraday
