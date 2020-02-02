prepare: deps 

deps:
	yarn

.vscode/pnpify:
	yarn pnpify --sdk

ide: .vscode/pnpify

test: prepare
	yarn test

@PHONY: test