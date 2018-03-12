# This file is used with the GYP meta build system.
# http://code.google.com/p/gyp/
{
  'target_defaults': {
    'default_configuration': 'Release',
    'configurations': {
      'Release': {
        'cflags': [ '-Wall', '-Wextra', '-O3' ],
      }
    },
  },

  'targets': [
    {
      'target_name': 'libpg_query',
      'type': 'static_library',
      'include_dirs': [ '.', 'src/postgres/include/' ],
      'sources': [ 'src/pg_query.c',]
    }
  ]
}
