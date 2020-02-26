prepare: deps 

deps:
	yarn

.vscode/pnpify:
	yarn pnpify --sdk

ide: .vscode/pnpify

test: prepare
	yarn test

patch:
	yarn bump-patch

minor:
	yarn bump-minor

major:
	yarn bump-major

build:
	yarn build

publish: build
	yarn workspace @indent/types npm publish && yarn workspace @indent/audit npm publish

@PHONY: test