BUILD_DIR=build
BUILD_DIR_MACOS=$(BUILD_DIR)/macos
BUILD_DIR_LINUX=$(BUILD_DIR)/linux

BUNDLE_PATH=$(BUILD_DIR)/bundle.js
STATIC_PATH=$(BUILD_DIR)/static.zip

SERVER_NAME=vivify-server
EXE_NAME=viv

SERVER_PATH_MACOS=$(BUILD_DIR_MACOS)/$(SERVER_NAME)
EXE_PATH_MACOS=$(BUILD_DIR_MACOS)/$(EXE_NAME)

SERVER_PATH_LINUX=$(BUILD_DIR_LINUX)/$(SERVER_NAME)
EXE_PATH_LINUX=$(BUILD_DIR_LINUX)/$(EXE_NAME)

.PHONY: macos linux clean

macos: $(SERVER_PATH_MACOS) $(EXE_PATH_MACOS)

linux: $(SERVER_PATH_LINUX) $(EXE_PATH_LINUX)

$(STATIC_PATH): $(shell find static -type f)
	mkdir -p $(BUILD_DIR)
	rm -rf $(STATIC_PATH)
	zip -X -r $(STATIC_PATH) static

$(BUNDLE_PATH): $(shell find src -type f) webpack.config.js tsconfig.json package.json yarn.lock $(STATIC_PATH)
	npx webpack
	touch $(BUNDLE_PATH)

$(SERVER_PATH_MACOS): $(BUNDLE_PATH) sea-config.json
	mkdir -p $(BUILD_DIR_MACOS)
	rm -rf $(SERVER_PATH_MACOS)
	node --experimental-sea-config sea-config.json
	cp $(shell command -v node) $(SERVER_PATH_MACOS)
	chmod +w $(SERVER_PATH_MACOS)
	codesign --remove-signature $(SERVER_PATH_MACOS)
	npx postject $(SERVER_PATH_MACOS) NODE_SEA_BLOB $(BUILD_DIR)/sea-prep.blob \
			  --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
			  --macho-segment-name NODE_SEA
	codesign --sign - $(SERVER_PATH_MACOS)
	chmod -w $(SERVER_PATH_MACOS)

$(EXE_PATH_MACOS): viv
	mkdir -p $(BUILD_DIR_MACOS)
	cp viv $(EXE_PATH_MACOS)
	codesign --sign - $(EXE_PATH_MACOS)

$(SERVER_PATH_LINUX): $(BUNDLE_PATH) sea-config.json
	mkdir -p $(BUILD_DIR_LINUX)
	rm -rf $(SERVER_PATH_LINUX)
	node --experimental-sea-config sea-config.json
	cp $(shell command -v node) $(SERVER_PATH_LINUX)
	chmod +w $(SERVER_PATH_LINUX)
	npx postject $(SERVER_PATH_LINUX) NODE_SEA_BLOB $(BUILD_DIR)/sea-prep.blob \
			  --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
			  --macho-segment-name NODE_SEA
	chmod -w $(SERVER_PATH_LINUX)

$(EXE_PATH_LINUX): viv
	mkdir -p $(BUILD_DIR_LINUX)
	cp viv $(EXE_PATH_LINUX)

clean:
	rm -rf $(BUILD_DIR)/*
