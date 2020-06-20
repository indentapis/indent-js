prepare: deps 

deps:
	yarn

.vscode/pnpify:
	yarn pnpify --sdk

ide: .vscode/pnpify

test: prepare
	yarn test

clean-versions:
	rm -r .yarn/versions

patch: clean-versions
	yarn bump-patch

minor: clean-versions
	yarn bump-minor

major: clean-versions
	yarn bump-major

build:
	yarn build

publish: build
	yarn workspace @indent/types npm publish \
		&& yarn workspace @indent/audit npm publish \
		&& yarn workspace @indent/webhook npm publish

@PHONY: test