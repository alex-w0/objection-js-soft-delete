# objection-js-soft-delete
test

    "husky": {
        "hooks": {
            "pre-commit": "lint-staged && yarn run test"
        }
    },
    "lint-staged": {
        "*": "yarn run test"
    }