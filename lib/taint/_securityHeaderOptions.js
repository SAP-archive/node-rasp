'use strict';

function getEnvVarOptions() {
  return (typeof process.env.SECURITYHEADER === 'string') ?
    JSON.parse(process.env.SECURITYHEADER) :
    process.env.securityHeader;
}

function getNpmPackageOptions() {
  const env = process.env;

  const addHeaders = env.npm_package_securityHeader_addHeaders;
  const poweredBy = env.npm_package_securityHeader_headers_x_powered_by;
  const expectCT = env.npm_package_securityHeader_headers_expect_ct;
  const referrerPolicy =
    env.npm_package_securityHeader_headers_referrer_policy;
  const strictTransport =
    env.npm_package_securityHeader_headers_strict_transport_security;
  const dnsPrefatch =
    env.npm_package_securityHeader_headers_x_dns_prefatch_control;
  const crossDomain =
    env.npm_package_securityHeader_headers_x_permitted_cross_domain_policies;
  const contentType =
    env.npm_package_securityHeader_headers_x_content_type_options;
  const securityPolicy =
    env.npm_package_securityHeader_headers_content_security_policy;
  const downloadOptions =
    env.npm_package_securityHeader_headers_x_download_options;
  const frameOptions =
    env.npm_package_securityHeader_headers_x_frame_options;
  const xssProtection =
    env.npm_package_securityHeader_headers_x_xss_protection;
  const featurePolicy =
    env.npm_package_securityHeader_headers_feature_policy;
  const publicKeys =
    env.npm_package_securityHeader_headers_public_key_pins;
  const cacheControl =
    env.npm_package_securityHeader_headers_cache_control;

  const options =
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

  return options;
}

function getDefaultValues() {
  const defaultValues =
  [
    { 'name': 'x-powered-by', 'value': true },
    { 'name': 'expect-ct', 'value': true },
    { 'name': 'referrer-policy', 'value': true },
    { 'name': 'strict-transport-security', 'value': true },
    { 'name': 'x-dns-prefatch-control', 'value': true },
    { 'name': 'x-permitted-cross-domain-policies', 'value': false },
    { 'name': 'x-content-type-options', 'value': true },
    { 'name': 'content-security-policy', 'value': false },
    { 'name': 'x-download-options', 'value': true },
    { 'name': 'x-frame-options', 'value': true },
    { 'name': 'x-xss-protection', 'value': true },
    { 'name': 'feature-policy', 'value': false },
    { 'name': 'public-key-pins', 'value': false },
    { 'name': 'cache-control', 'value': false }
  ];

  return defaultValues;
}

function getsecurityHeaderOptions() {
  // Get default values
  const defaultValues = getDefaultValues();

  // Get values from env variable "SECURITYHEADER"
  const envVar = getEnvVarOptions();
  let envVarAddHeaders = undefined;
  let envHeaders = '';
  if (envVar !== undefined) {
    envVarAddHeaders = envVar.addHeaders;
    envHeaders = envVar.headers;
  }

  // Get values from package.json
  const options = getNpmPackageOptions();

  let npmAddHeaders = undefined;
  let npmHeaders = '';
  if (options !== undefined) {
    npmAddHeaders = options.addHeaders;
    npmHeaders = options.headers;
  }

  // Check if values are present and if not set them to default value
  options.addHeaders =
    checkOptionValue(npmAddHeaders,
                     envVarAddHeaders, true);

  for (var i = 0; i < defaultValues.length; i++) {
    options.headers[defaultValues[i].name] =
      checkOptionValue(npmHeaders[defaultValues[i].name],
                       envHeaders[defaultValues[i].name],
                       defaultValues[i].value);
  }

  return options;
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

exports.getSecurityHeaderOptions = getsecurityHeaderOptions;
