rm -rf dist
mkdir -p dist/test
cp -r src/test/fixtures dist/test
tsc
