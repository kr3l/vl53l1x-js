{
    "targets": [{
        "target_name": "VL53L1X",
        "cflags!": [ "-fno-exceptions" ],
        "cflags_cc!": [ "-fno-exceptions" ],
        "sources": [
            "cppsrc/main.cpp",
			"cppsrc/VL53L1X/VL53L1X.cpp",
			"cppsrc/VL53L1X/VL53L1XWrapper.cpp"
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