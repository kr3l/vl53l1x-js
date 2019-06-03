{
    "targets": [{
        "target_name": "VL53L1X",
        "cflags!": [ "-fno-exceptions" ],
        "cflags_cc!": [ "-fno-exceptions" ],
        "sources": [
            "cppsrc/ST/vl53l1_platform.c",
			"cppsrc/ST/VL53L1X_api.c",
			"cppsrc/wrapper/VL53L1X_api_wrapper.cpp",
			"cppsrc/main.cpp"
        ],
        'include_dirs': [
            "<!@(node -p \"require('node-addon-api').include\")"
        ],
        'libraries': [],
        'dependencies': [
            "<!(node -p \"require('node-addon-api').gyp\")"
        ],
        'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ]
    }]
}