install: install-deps
	npm ci

run:
	bin/nodejs-package.js 10

install-deps:
	npm ci

test:
	npm test --test-reporter=spec

test-coverage:
	npx jest --coverage

lint:
	npx eslint .

publish:
	npm publish

.PHONY: test