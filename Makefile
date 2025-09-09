BUILD_DIR=build
BUILD_DIR_MACOS=$(BUILD_DIR)/macos
BUILD_DIR_LINUX=$(BUILD_DIR)/linux

DIST_PATH=$(BUILD_DIR)/dist
BUNDLE_PATH=$(BUILD_DIR)/bundle.js
STATIC_PATH=$(BUILD_DIR)/static.zip

SERVER_NAME=vivify-server
EXE_NAME=viv

SERVER_PATH_MACOS=$(BUILD_DIR_MACOS)/$(SERVER_NAME)
EXE_PATH_MACOS=$(BUILD_DIR_MACOS)/$(EXE_NAME)

SERVER_PATH_LINUX=$(BUILD_DIR_LINUX)/$(SERVER_NAME)
EXE_PATH_LINUX=$(BUILD_DIR_LINUX)/$(EXE_NAME)

VIV_VERSION ?= $(shell git describe --tags --always --dirty)

.PHONY: instruct-build
instruct-build:
	@ echo 'Please run `make macos` or `make linux` to build the project'

# ------------------------------------------------------------------------------
# MARK: platform-independent build items ---------------------------------------

$(STATIC_PATH): $(shell find static -type f)
	mkdir -p $(BUILD_DIR)
	rm -rf $(STATIC_PATH)
	zip -X -r $(STATIC_PATH) static

$(DIST_PATH): $(shell find src -type f) tsconfig.json package.json yarn.lock
	node_modules/.bin/tsc
	touch $(DIST_PATH)

$(BUNDLE_PATH): webpack.config.js $(STATIC_PATH) $(DIST_PATH)
	VIV_VERSION=$(VIV_VERSION) node_modules/.bin/webpack
	touch $(BUNDLE_PATH)

# ------------------------------------------------------------------------------
# MARK: macos ------------------------------------------------------------------

.PHONY: macos
macos: $(SERVER_PATH_MACOS) $(EXE_PATH_MACOS)

$(SERVER_PATH_MACOS): $(BUNDLE_PATH) sea-config.json
	mkdir -p $(BUILD_DIR_MACOS)
	rm -rf $(SERVER_PATH_MACOS)
	node --experimental-sea-config sea-config.json
	cp $(shell command -v node) $(SERVER_PATH_MACOS)
	chmod +w $(SERVER_PATH_MACOS)
	codesign --remove-signature $(SERVER_PATH_MACOS)
	node_modules/.bin/postject $(SERVER_PATH_MACOS) NODE_SEA_BLOB $(BUILD_DIR)/sea-prep.blob \
			  --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
			  --macho-segment-name NODE_SEA
	codesign --sign - $(SERVER_PATH_MACOS)
	chmod -w $(SERVER_PATH_MACOS)

$(EXE_PATH_MACOS): viv
	mkdir -p $(BUILD_DIR_MACOS)
	cp viv $(EXE_PATH_MACOS)
	codesign --sign - $(EXE_PATH_MACOS)

# ------------------------------------------------------------------------------
# MARK: linux ------------------------------------------------------------------

.PHONY: linux
linux: $(SERVER_PATH_LINUX) $(EXE_PATH_LINUX)

$(SERVER_PATH_LINUX): $(BUNDLE_PATH) sea-config.json
	mkdir -p $(BUILD_DIR_LINUX)
	rm -rf $(SERVER_PATH_LINUX)
	node --experimental-sea-config sea-config.json
	cp $(shell command -v node) $(SERVER_PATH_LINUX)
	@ objdump -p $(SERVER_PATH_LINUX) | grep 'NEEDED' | grep -q 'libdl.so.2' || \
		{ \
		printf "\n\n\x1b[1;31mYour $(shell command -v node) does not support Node SEA, which is needed to compile Vivify.\x1b[0m\n"; \
		printf "\x1b[1;31mPlease install Node.js through Node Version Manager (nvm) and try again.\x1b[0m\n"; \
		rm $(SERVER_PATH_LINUX); \
		exit 1; \
		}
	chmod +w $(SERVER_PATH_LINUX)
	node_modules/.bin/postject $(SERVER_PATH_LINUX) NODE_SEA_BLOB $(BUILD_DIR)/sea-prep.blob \
			  --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
	chmod -w $(SERVER_PATH_LINUX)

$(EXE_PATH_LINUX): viv
	mkdir -p $(BUILD_DIR_LINUX)
	cp viv $(EXE_PATH_LINUX)

# ------------------------------------------------------------------------------
# MARK: configured installation ------------------------------------------------

.PHONY: install uninstall

# include .env.mk from ./configure
_MK_DIR=$(dir $(abspath $(firstword $(MAKEFILE_LIST))))
# - prefix is used to ignore errors if the file does not exist
-include $(_MK_DIR).env.mk

# >>> if .env.mk is fully defined, we can define install targets
ifeq '' '$(findstring undefined,$(origin SYSTEM)$(origin INSTALL_DIR))'

INSTALL_SERVER=$(INSTALL_DIR)/$(SERVER_NAME)
BUILD_SERVER=$(BUILD_DIR)/$(SYSTEM)/$(SERVER_NAME)

INSTALL_EXE=$(INSTALL_DIR)/$(EXE_NAME)
BUILD_EXE=$(BUILD_DIR)/$(SYSTEM)/$(EXE_NAME)

install: $(INSTALL_SERVER) $(INSTALL_EXE)

$(INSTALL_SERVER): $(BUILD_SERVER)
	rm -rf $(INSTALL_SERVER)
	cp $(BUILD_SERVER) $(INSTALL_SERVER)

$(INSTALL_EXE): $(BUILD_EXE)
	rm -rf $(INSTALL_EXE)
	cp $(BUILD_EXE) $(INSTALL_EXE)

uninstall:
	rm -rf $(INSTALL_SERVER) $(INSTALL_EXE)

else

install:
	@ echo "Please run ./configure <install_dir> to define the install target"

uninstall:
	@ echo "Please run ./configure <install_dir> to define the uninstall target"

endif
# <<< endif

# ------------------------------------------------------------------------------
# MARK: misc -------------------------------------------------------------------

.PHONY: clean
clean:
	rm -rf $(BUILD_DIR)/*
