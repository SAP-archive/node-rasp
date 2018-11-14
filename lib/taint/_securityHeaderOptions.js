'use strict';

function getsecurityHeaderOptions() {
  // Get values from env variable
  const envVar = (typeof process.env.SECURITYHEADER === 'string') ?
    JSON.parse(process.env.SECURITYHEADER) :
    process.env.securityHeader;

  let envVarAddHeaders = undefined;
  let envHeaders = '';
  if (envVar !== undefined) {
    envVarAddHeaders = envVar.addHeaders;
    envHeaders = envVar.headers;
  }

  // Get values from package.json
  const env = process.env;

  let addHeaders = env.npm_package_securityHeader_addHeaders;
  let poweredBy = env.npm_package_securityHeader_headers_x_powered_by;
  let expectCT = env.npm_package_securityHeader_headers_expect_ct;
  let referrerPolicy =
    env.npm_package_securityHeader_headers_referrer_policy;
  let strictTransport =
    env.npm_package_securityHeader_headers_strict_transport_security;
  let dnsPrefatch =
    env.npm_package_securityHeader_headers_x_dns_prefatch_control;
  let crossDomain =
    env.npm_package_securityHeader_headers_x_permitted_cross_domain_policies;
  let contentType =
    env.npm_package_securityHeader_headers_x_content_type_options;
  let securityPolicy =
    env.npm_package_securityHeader_headers_content_security_policy;
  let downloadOptions =
    env.npm_package_securityHeader_headers_x_download_options;
  let frameOptions =
    env.npm_package_securityHeader_headers_x_frame_options;
  let xssProtection =
    env.npm_package_securityHeader_headers_x_xss_protection;
  let featurePolicy =
    env.npm_package_securityHeader_headers_feature_policy;
  let publicKeys =
    env.npm_package_securityHeader_headers_public_key_pins;
  let cacheControl =
    env.npm_package_securityHeader_headers_cache_control;

  // Check if values are present and if not set them to default value
  addHeaders = checkOptionValue(addHeaders, envVarAddHeaders, true);
  poweredBy = checkOptionValue(poweredBy, envHeaders['x-powered-by'], true);
  expectCT = checkOptionValue(expectCT, envHeaders['expect-ct'], true);
  referrerPolicy =
    checkOptionValue(referrerPolicy, envHeaders['referrer-policy'], true);
  strictTransport =
    checkOptionValue(strictTransport, envHeaders['strict-transport-security'],
                     true);
  dnsPrefatch =
    checkOptionValue(dnsPrefatch, envHeaders['x-dns-prefatch-control'], true);
  crossDomain =
    checkOptionValue(crossDomain,
                     envHeaders['x-permitted-cross-domain-policies'], true);
  contentType =
    checkOptionValue(contentType, envHeaders['x-content-type-options'], true);
  securityPolicy =
    checkOptionValue(securityPolicy, envHeaders['content-security-policy'],
                     true);
  downloadOptions =
    checkOptionValue(downloadOptions, envHeaders['x-download-options'], true);
  frameOptions =
    checkOptionValue(frameOptions, envHeaders['x-frame-options'], true);
  xssProtection =
    checkOptionValue(xssProtection, envHeaders['x-xss-protection'], true);
  featurePolicy =
    checkOptionValue(featurePolicy, envHeaders['feature-policy'], false);
  publicKeys =
    checkOptionValue(publicKeys, envHeaders['public-key-pins'], false);
  cacheControl =
    checkOptionValue(cacheControl, envHeaders['cache-control'], false);

  // Build option JSON and return it
  const securityHeader =
    { 'addHeaders': addHeaders,
      'headers':
      { 'x-powered-by': poweredBy,
        'expect-ct': expectCT,
        'strict-transport-security': strictTransport,
        'referrer-policy': referrerPolicy,
        'x-dns-prefatch-control': dnsPrefatch,
        'x-permitted-cross-domain-policies': crossDomain,
        'x-content-type-options': contentType,
        'content-security-policy': securityPolicy,
        'x-download-options': downloadOptions,
        'x-frame-options': frameOptions,
        'x-xss-protection': xssProtection,
        'feature-policy': featurePolicy,
        'public-key-pins': publicKeys,
        'cache-control': cacheControl
      }
    };

  return securityHeader;
}

function checkOptionValue(packageVariable, envVariable, defaultValue) {
  if (packageVariable === undefined) {
    if (envVariable !== undefined)
      return envVariable;
  } else {
    return JSON.parse(packageVariable.toLowerCase());
  }

  return defaultValue;
}

exports.getDefault = getsecurityHeaderOptions;
