{
    "targets": [
        {
            "target_name": "addon",
            "sources": [ "addon.cc", "minkowski.cc" ],
            'cflags!': [ '-fno-exceptions' ],
            'cflags_cc!': [ '-fno-exceptions' ],
            'conditions': [[
                'OS=="mac"',
                {
                    'xcode_settings':
                    {
                        'GCC_ENABLE_CPP_EXCEPTIONS': 'YES'
                    }
                }
            ]],
            "include_dirs" : [
                "<!(node -e \"require('nan')\")",
                "C:/local/boost_1_69_0"
            ]
        }
    ],
}
