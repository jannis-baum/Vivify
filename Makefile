BUILD_DIR=build

BUNDLE_PATH=$(BUILD_DIR)/bundle.js

EXE_PATH=$(BUILD_DIR)/vivify-server
EXE_PATH_MACOS=$(BUILD_DIR)/vivify-server-macos

.PHONY: all clean

all: $(EXE_PATH_MACOS)

$(BUNDLE_PATH): $(shell find src -type f) webpack.config.js tsconfig.json package.json yarn.lock
	npx webpack
	touch $(BUNDLE_PATH)

$(EXE_PATH_MACOS): $(BUNDLE_PATH) sea-config.json
	rm -rf $(EXE_PATH_MACOS)
	node --experimental-sea-config sea-config.json
	cp $(shell command -v node) $(EXE_PATH_MACOS)
	chmod +w $(EXE_PATH_MACOS)
	codesign --remove-signature $(EXE_PATH_MACOS)
	npx postject $(EXE_PATH_MACOS) NODE_SEA_BLOB $(BUILD_DIR)/sea-prep.blob \
			  --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
			  --macho-segment-name NODE_SEA
	codesign --sign - $(EXE_PATH_MACOS)
	chmod -w $(EXE_PATH_MACOS)

clean:
	rm -rf $(BUILD_DIR)/*
